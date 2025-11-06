import { Request, Response } from 'express';
import { pool } from '../config/database';

export async function getAdminDashboard(req: Request, res: Response) {
  try {
    // Get overall statistics
    const statsResult = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM events) as total_events,
        (SELECT COUNT(*) FROM events WHERE status = 'scheduled') as scheduled_events,
        (SELECT COUNT(*) FROM events WHERE status = 'assigned') as assigned_events,
        (SELECT COUNT(*) FROM events WHERE status = 'completed') as completed_events,
        (SELECT COUNT(*) FROM recovery_reports WHERE has_food = true) as recoveries_with_food,
        (SELECT COUNT(*) FROM deliveries WHERE status = 'delivered') as completed_deliveries,
        (SELECT COUNT(*) FROM users WHERE role = 'reporter' AND active = true) as active_reporters,
        (SELECT COUNT(*) FROM users WHERE role = 'driver' AND active = true) as active_drivers,
        (SELECT COUNT(*) FROM partners WHERE active = true) as active_partners
    `);

    // Get upcoming events (next 7 days)
    const upcomingEventsResult = await pool.query(`
      SELECT e.*,
             u.name as reporter_name,
             u.email as reporter_email
      FROM events e
      LEFT JOIN users u ON e.reporter_id = u.id
      WHERE e.start_time >= CURRENT_TIMESTAMP
        AND e.start_time <= CURRENT_TIMESTAMP + INTERVAL '7 days'
      ORDER BY e.start_time ASC
      LIMIT 10
    `);

    // Get active recoveries (pending pickup or delivery)
    const activeRecoveriesResult = await pool.query(`
      SELECT rr.*,
             e.title as event_title,
             e.location as event_location,
             u.name as reporter_name,
             d.id as delivery_id,
             d.status as delivery_status,
             driver.name as driver_name
      FROM recovery_reports rr
      JOIN events e ON rr.event_id = e.id
      LEFT JOIN users u ON rr.reporter_id = u.id
      LEFT JOIN deliveries d ON d.recovery_report_id = rr.id
      LEFT JOIN users driver ON d.driver_id = driver.id
      WHERE rr.has_food = true
        AND rr.status IN ('pending', 'assigned', 'picked_up')
      ORDER BY rr.reported_at DESC
      LIMIT 10
    `);

    // Get recent completed deliveries
    const recentDeliveriesResult = await pool.query(`
      SELECT d.*,
             driver.name as driver_name,
             p.organization_name as partner_name,
             rr.food_quantity,
             e.title as event_title
      FROM deliveries d
      JOIN users driver ON d.driver_id = driver.id
      JOIN partners p ON d.partner_id = p.id
      JOIN recovery_reports rr ON d.recovery_report_id = rr.id
      JOIN events e ON rr.event_id = e.id
      WHERE d.status = 'delivered'
      ORDER BY d.delivery_time DESC
      LIMIT 10
    `);

    res.json({
      stats: statsResult.rows[0],
      upcomingEvents: upcomingEventsResult.rows,
      activeRecoveries: activeRecoveriesResult.rows,
      recentDeliveries: recentDeliveriesResult.rows
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getReporterDashboard(req: Request, res: Response) {
  try {
    const reporterId = req.user?.userId;

    // Get reporter's assigned events
    const assignedEventsResult = await pool.query(`
      SELECT *
      FROM events
      WHERE reporter_id = $1
        AND start_time >= CURRENT_TIMESTAMP
      ORDER BY start_time ASC
    `, [reporterId]);

    // Get reporter's past reports
    const pastReportsResult = await pool.query(`
      SELECT rr.*,
             e.title as event_title,
             e.location as event_location,
             e.start_time
      FROM recovery_reports rr
      JOIN events e ON rr.event_id = e.id
      WHERE rr.reporter_id = $1
      ORDER BY rr.reported_at DESC
      LIMIT 20
    `, [reporterId]);

    // Get available events (no reporter assigned)
    const availableEventsResult = await pool.query(`
      SELECT *
      FROM events
      WHERE reporter_id IS NULL
        AND status = 'scheduled'
        AND start_time >= CURRENT_TIMESTAMP
      ORDER BY start_time ASC
      LIMIT 10
    `);

    // Get reporter statistics
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) as total_reports,
        COUNT(CASE WHEN has_food = true THEN 1 END) as reports_with_food
      FROM recovery_reports
      WHERE reporter_id = $1
    `, [reporterId]);

    res.json({
      assignedEvents: assignedEventsResult.rows,
      pastReports: pastReportsResult.rows,
      availableEvents: availableEventsResult.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Get reporter dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getDriverDashboard(req: Request, res: Response) {
  try {
    const driverId = req.user?.userId;

    // Get available recoveries (not yet assigned to a driver)
    const availableRecoveriesResult = await pool.query(`
      SELECT rr.*,
             e.title as event_title,
             e.location as pickup_location,
             e.latitude as pickup_latitude,
             e.longitude as pickup_longitude,
             u.name as reporter_name,
             u.phone as reporter_phone
      FROM recovery_reports rr
      JOIN events e ON rr.event_id = e.id
      LEFT JOIN users u ON rr.reporter_id = u.id
      WHERE rr.has_food = true
        AND rr.status = 'pending'
      ORDER BY rr.reported_at DESC
    `);

    // Get driver's active deliveries
    const activeDeliveriesResult = await pool.query(`
      SELECT d.*,
             p.organization_name as partner_name,
             p.address as partner_address,
             p.latitude as partner_latitude,
             p.longitude as partner_longitude,
             p.contact_phone as partner_phone,
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
      WHERE d.driver_id = $1
        AND d.status IN ('accepted', 'picked_up')
      ORDER BY d.created_at DESC
    `, [driverId]);

    // Get driver's delivery history
    const deliveryHistoryResult = await pool.query(`
      SELECT d.*,
             p.organization_name as partner_name,
             rr.food_quantity,
             e.title as event_title
      FROM deliveries d
      JOIN partners p ON d.partner_id = p.id
      JOIN recovery_reports rr ON d.recovery_report_id = rr.id
      JOIN events e ON rr.event_id = e.id
      WHERE d.driver_id = $1
      ORDER BY d.created_at DESC
      LIMIT 20
    `, [driverId]);

    // Get driver statistics
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) as total_deliveries,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_deliveries
      FROM deliveries
      WHERE driver_id = $1
    `, [driverId]);

    res.json({
      availableRecoveries: availableRecoveriesResult.rows,
      activeDeliveries: activeDeliveriesResult.rows,
      deliveryHistory: deliveryHistoryResult.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Get driver dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPartnerDashboard(req: Request, res: Response) {
  try {
    // Get partner info from user
    const userResult = await pool.query(
      'SELECT email FROM users WHERE id = $1',
      [req.user?.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find partner by contact email
    const partnerResult = await pool.query(
      'SELECT * FROM partners WHERE contact_email = $1',
      [userResult.rows[0].email]
    );

    if (partnerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Partner profile not found' });
    }

    const partner = partnerResult.rows[0];

    // Get incoming deliveries
    const incomingDeliveriesResult = await pool.query(`
      SELECT d.*,
             driver.name as driver_name,
             driver.phone as driver_phone,
             rr.food_quantity,
             rr.food_description,
             e.title as event_title,
             e.location as pickup_location
      FROM deliveries d
      LEFT JOIN users driver ON d.driver_id = driver.id
      JOIN recovery_reports rr ON d.recovery_report_id = rr.id
      JOIN events e ON rr.event_id = e.id
      WHERE d.partner_id = $1
        AND d.status IN ('accepted', 'picked_up')
      ORDER BY d.created_at DESC
    `, [partner.id]);

    // Get delivery history
    const deliveryHistoryResult = await pool.query(`
      SELECT d.*,
             driver.name as driver_name,
             rr.food_quantity,
             rr.food_description,
             e.title as event_title
      FROM deliveries d
      LEFT JOIN users driver ON d.driver_id = driver.id
      JOIN recovery_reports rr ON d.recovery_report_id = rr.id
      JOIN events e ON rr.event_id = e.id
      WHERE d.partner_id = $1
      ORDER BY d.created_at DESC
      LIMIT 20
    `, [partner.id]);

    // Get statistics
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) as total_deliveries,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_deliveries
      FROM deliveries
      WHERE partner_id = $1
    `, [partner.id]);

    res.json({
      partner: partner,
      incomingDeliveries: incomingDeliveriesResult.rows,
      deliveryHistory: deliveryHistoryResult.rows,
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Get partner dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
