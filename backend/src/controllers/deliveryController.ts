import { Request, Response } from 'express';
import { pool } from '../config/database';

// Partner assignment algorithm
async function assignPartner(eventLatitude?: number, eventLongitude?: number): Promise<number | null> {
  try {
    // Get all active partners with high or medium need
    const partnersResult = await pool.query(
      `SELECT id, latitude, longitude, current_need_level,
              (SELECT COUNT(*) FROM deliveries WHERE partner_id = partners.id AND status = 'delivered') as delivery_count
       FROM partners
       WHERE active = true AND current_need_level IN ('high', 'medium')
       ORDER BY
         CASE current_need_level
           WHEN 'high' THEN 1
           WHEN 'medium' THEN 2
           ELSE 3
         END,
         delivery_count ASC
       LIMIT 1`
    );

    if (partnersResult.rows.length === 0) {
      // No partners available with high/medium need, get any active partner
      const anyPartnerResult = await pool.query(
        `SELECT id FROM partners WHERE active = true LIMIT 1`
      );

      if (anyPartnerResult.rows.length === 0) {
        return null;
      }

      return anyPartnerResult.rows[0].id;
    }

    return partnersResult.rows[0].id;
  } catch (error) {
    console.error('Partner assignment error:', error);
    return null;
  }
}

export async function createDelivery(req: Request, res: Response) {
  try {
    const { recovery_report_id } = req.body;
    const driver_id = req.user?.userId;

    if (!recovery_report_id) {
      return res.status(400).json({ error: 'Recovery report ID is required' });
    }

    // Check if user is a driver
    if (req.user?.role !== 'driver') {
      return res.status(403).json({ error: 'Only drivers can accept deliveries' });
    }

    // Check if recovery report exists and has food
    const reportResult = await pool.query(
      `SELECT rr.*, e.latitude, e.longitude
       FROM recovery_reports rr
       JOIN events e ON rr.event_id = e.id
       WHERE rr.id = $1`,
      [recovery_report_id]
    );

    if (reportResult.rows.length === 0) {
      return res.status(404).json({ error: 'Recovery report not found' });
    }

    const report = reportResult.rows[0];

    if (!report.has_food) {
      return res.status(400).json({ error: 'This report indicates no food is available' });
    }

    if (report.status !== 'pending') {
      return res.status(400).json({ error: 'This recovery is no longer available' });
    }

    // Check if delivery already exists for this report
    const existingDelivery = await pool.query(
      'SELECT id FROM deliveries WHERE recovery_report_id = $1',
      [recovery_report_id]
    );

    if (existingDelivery.rows.length > 0) {
      return res.status(400).json({ error: 'Delivery already exists for this recovery report' });
    }

    // Assign partner using algorithm
    const partner_id = await assignPartner(report.latitude, report.longitude);

    if (!partner_id) {
      return res.status(500).json({ error: 'No available partners found' });
    }

    // Create delivery
    const result = await pool.query(
      `INSERT INTO deliveries (recovery_report_id, driver_id, partner_id, status)
       VALUES ($1, $2, $3, 'accepted')
       RETURNING *`,
      [recovery_report_id, driver_id, partner_id]
    );

    // Update recovery report status
    await pool.query(
      `UPDATE recovery_reports SET status = 'assigned' WHERE id = $1`,
      [recovery_report_id]
    );

    // Get full delivery details with related info
    const deliveryDetails = await pool.query(
      `SELECT d.*,
              p.organization_name as partner_name,
              p.address as partner_address,
              p.contact_phone as partner_phone,
              p.latitude as partner_latitude,
              p.longitude as partner_longitude,
              p.delivery_instructions,
              rr.food_quantity,
              rr.food_description,
              rr.photo_urls,
              e.title as event_title,
              e.location as pickup_location,
              e.latitude as pickup_latitude,
              e.longitude as pickup_longitude
       FROM deliveries d
       JOIN partners p ON d.partner_id = p.id
       JOIN recovery_reports rr ON d.recovery_report_id = rr.id
       JOIN events e ON rr.event_id = e.id
       WHERE d.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({
      message: 'Delivery accepted successfully',
      delivery: deliveryDetails.rows[0]
    });
  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getDeliveries(req: Request, res: Response) {
  try {
    const { status, driver_id, partner_id } = req.query;

    let query = `
      SELECT d.*,
             u.name as driver_name,
             u.phone as driver_phone,
             p.organization_name as partner_name,
             p.address as partner_address,
             p.latitude as partner_latitude,
             p.longitude as partner_longitude,
             rr.food_quantity,
             rr.food_description,
             e.title as event_title,
             e.location as pickup_location,
             e.latitude as pickup_latitude,
             e.longitude as pickup_longitude
      FROM deliveries d
      LEFT JOIN users u ON d.driver_id = u.id
      LEFT JOIN partners p ON d.partner_id = p.id
      JOIN recovery_reports rr ON d.recovery_report_id = rr.id
      JOIN events e ON rr.event_id = e.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND d.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (driver_id) {
      query += ` AND d.driver_id = $${paramIndex}`;
      params.push(driver_id);
      paramIndex++;
    }

    if (partner_id) {
      query += ` AND d.partner_id = $${paramIndex}`;
      params.push(partner_id);
      paramIndex++;
    }

    query += ' ORDER BY d.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ deliveries: result.rows });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getDeliveryById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT d.*,
              u.name as driver_name,
              u.phone as driver_phone,
              u.email as driver_email,
              p.organization_name as partner_name,
              p.address as partner_address,
              p.contact_name as partner_contact_name,
              p.contact_phone as partner_phone,
              p.latitude as partner_latitude,
              p.longitude as partner_longitude,
              p.delivery_instructions,
              rr.food_quantity,
              rr.food_description,
              rr.photo_urls,
              e.title as event_title,
              e.location as pickup_location,
              e.latitude as pickup_latitude,
              e.longitude as pickup_longitude
       FROM deliveries d
       LEFT JOIN users u ON d.driver_id = u.id
       LEFT JOIN partners p ON d.partner_id = p.id
       JOIN recovery_reports rr ON d.recovery_report_id = rr.id
       JOIN events e ON rr.event_id = e.id
       WHERE d.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.json({ delivery: result.rows[0] });
  } catch (error) {
    console.error('Get delivery by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateDeliveryStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, issues } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Get existing delivery
    const existingDelivery = await pool.query(
      'SELECT driver_id FROM deliveries WHERE id = $1',
      [id]
    );

    if (existingDelivery.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Check permissions (admin or the assigned driver)
    if (req.user?.role !== 'admin' && existingDelivery.rows[0].driver_id !== req.user?.userId) {
      return res.status(403).json({ error: 'You do not have permission to update this delivery' });
    }

    // Handle photo upload
    let photoUrl = null;
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    // Update timestamps based on status
    let additionalUpdates = '';
    if (status === 'picked_up' && photoUrl) {
      additionalUpdates = `, pickup_time = CURRENT_TIMESTAMP, pickup_photo_url = '${photoUrl}'`;

      // Update recovery report status
      await pool.query(
        `UPDATE recovery_reports rr
         SET status = 'picked_up'
         FROM deliveries d
         WHERE d.recovery_report_id = rr.id AND d.id = $1`,
        [id]
      );
    } else if (status === 'delivered' && photoUrl) {
      additionalUpdates = `, delivery_time = CURRENT_TIMESTAMP, delivery_photo_url = '${photoUrl}'`;

      // Update recovery report status
      await pool.query(
        `UPDATE recovery_reports rr
         SET status = 'delivered'
         FROM deliveries d
         WHERE d.recovery_report_id = rr.id AND d.id = $1`,
        [id]
      );

      // Update event status
      await pool.query(
        `UPDATE events e
         SET status = 'completed'
         FROM recovery_reports rr, deliveries d
         WHERE rr.event_id = e.id AND d.recovery_report_id = rr.id AND d.id = $1`,
        [id]
      );
    }

    const result = await pool.query(
      `UPDATE deliveries
       SET status = $1,
           issues = COALESCE($2, issues),
           updated_at = CURRENT_TIMESTAMP
           ${additionalUpdates}
       WHERE id = $3
       RETURNING *`,
      [status, issues, id]
    );

    res.json({
      message: 'Delivery status updated successfully',
      delivery: result.rows[0]
    });
  } catch (error) {
    console.error('Update delivery status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function cancelDelivery(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Get existing delivery
    const existingDelivery = await pool.query(
      'SELECT driver_id, recovery_report_id FROM deliveries WHERE id = $1',
      [id]
    );

    if (existingDelivery.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Check permissions (admin or the assigned driver)
    if (req.user?.role !== 'admin' && existingDelivery.rows[0].driver_id !== req.user?.userId) {
      return res.status(403).json({ error: 'You do not have permission to cancel this delivery' });
    }

    // Update delivery status
    await pool.query(
      `UPDATE deliveries SET status = 'cancelled', issues = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [reason, id]
    );

    // Reset recovery report status to pending so another driver can pick it up
    await pool.query(
      `UPDATE recovery_reports SET status = 'pending' WHERE id = $1`,
      [existingDelivery.rows[0].recovery_report_id]
    );

    res.json({ message: 'Delivery cancelled successfully' });
  } catch (error) {
    console.error('Cancel delivery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
