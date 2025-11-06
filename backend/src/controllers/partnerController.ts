import { Request, Response } from 'express';
import { pool } from '../config/database';

export async function getPartners(req: Request, res: Response) {
  try {
    const { active } = req.query;

    let query = 'SELECT * FROM partners WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (active !== undefined) {
      query += ` AND active = $${paramIndex}`;
      params.push(active === 'true');
      paramIndex++;
    }

    query += ' ORDER BY organization_name ASC';

    const result = await pool.query(query, params);
    res.json({ partners: result.rows });
  } catch (error) {
    console.error('Get partners error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPartnerById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM partners WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    // Get delivery statistics for this partner
    const statsResult = await pool.query(
      `SELECT
         COUNT(*) as total_deliveries,
         COUNT(CASE WHEN status = 'delivered' THEN 1 END) as completed_deliveries
       FROM deliveries
       WHERE partner_id = $1`,
      [id]
    );

    res.json({
      partner: result.rows[0],
      stats: statsResult.rows[0]
    });
  } catch (error) {
    console.error('Get partner by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createPartner(req: Request, res: Response) {
  try {
    const {
      organization_name,
      address,
      latitude,
      longitude,
      contact_name,
      contact_phone,
      contact_email,
      operating_hours,
      food_preferences,
      current_need_level,
      delivery_instructions
    } = req.body;

    if (!organization_name || !address || !contact_name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO partners (organization_name, address, latitude, longitude, contact_name, contact_phone, contact_email, operating_hours, food_preferences, current_need_level, delivery_instructions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [organization_name, address, latitude, longitude, contact_name, contact_phone, contact_email, operating_hours, food_preferences, current_need_level, delivery_instructions]
    );

    res.status(201).json({
      message: 'Partner created successfully',
      partner: result.rows[0]
    });
  } catch (error) {
    console.error('Create partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updatePartner(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      organization_name,
      address,
      latitude,
      longitude,
      contact_name,
      contact_phone,
      contact_email,
      operating_hours,
      food_preferences,
      current_need_level,
      delivery_instructions,
      active
    } = req.body;

    const result = await pool.query(
      `UPDATE partners
       SET organization_name = COALESCE($1, organization_name),
           address = COALESCE($2, address),
           latitude = COALESCE($3, latitude),
           longitude = COALESCE($4, longitude),
           contact_name = COALESCE($5, contact_name),
           contact_phone = COALESCE($6, contact_phone),
           contact_email = COALESCE($7, contact_email),
           operating_hours = COALESCE($8, operating_hours),
           food_preferences = COALESCE($9, food_preferences),
           current_need_level = COALESCE($10, current_need_level),
           delivery_instructions = COALESCE($11, delivery_instructions),
           active = COALESCE($12, active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [organization_name, address, latitude, longitude, contact_name, contact_phone, contact_email, operating_hours, food_preferences, current_need_level, delivery_instructions, active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    res.json({
      message: 'Partner updated successfully',
      partner: result.rows[0]
    });
  } catch (error) {
    console.error('Update partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updatePartnerNeedLevel(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { current_need_level } = req.body;

    if (!current_need_level) {
      return res.status(400).json({ error: 'Need level is required' });
    }

    const validLevels = ['high', 'medium', 'low'];
    if (!validLevels.includes(current_need_level)) {
      return res.status(400).json({ error: 'Invalid need level' });
    }

    const result = await pool.query(
      `UPDATE partners
       SET current_need_level = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [current_need_level, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    res.json({
      message: 'Partner need level updated successfully',
      partner: result.rows[0]
    });
  } catch (error) {
    console.error('Update partner need level error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deletePartner(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM partners WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Partner not found' });
    }

    res.json({ message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Delete partner error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getPartnerDeliveries(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT d.*,
              u.name as driver_name,
              u.phone as driver_phone,
              rr.food_quantity,
              rr.food_description,
              e.title as event_title,
              e.location as pickup_location
       FROM deliveries d
       LEFT JOIN users u ON d.driver_id = u.id
       JOIN recovery_reports rr ON d.recovery_report_id = rr.id
       JOIN events e ON rr.event_id = e.id
       WHERE d.partner_id = $1
       ORDER BY d.created_at DESC`,
      [id]
    );

    res.json({ deliveries: result.rows });
  } catch (error) {
    console.error('Get partner deliveries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
