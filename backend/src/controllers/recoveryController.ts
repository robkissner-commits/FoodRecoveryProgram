import { Request, Response } from 'express';
import { pool } from '../config/database';

export async function createRecoveryReport(req: Request, res: Response) {
  try {
    const { event_id, has_food, food_quantity, food_description, notes } = req.body;
    const reporter_id = req.user?.userId;

    if (!event_id || has_food === undefined) {
      return res.status(400).json({ error: 'Event ID and has_food status are required' });
    }

    // Check if event exists and reporter is assigned to it
    const eventResult = await pool.query(
      'SELECT id, reporter_id, status FROM events WHERE id = $1',
      [event_id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventResult.rows[0];

    // Allow admin to create reports, or reporter assigned to event
    if (req.user?.role !== 'admin' && event.reporter_id !== reporter_id) {
      return res.status(403).json({ error: 'You are not assigned to this event' });
    }

    // Check if report already exists for this event
    const existingReport = await pool.query(
      'SELECT id FROM recovery_reports WHERE event_id = $1',
      [event_id]
    );

    if (existingReport.rows.length > 0) {
      return res.status(400).json({ error: 'Recovery report already exists for this event' });
    }

    // Handle photo uploads
    let photo_urls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      photo_urls = req.files.map((file: Express.Multer.File) => `/uploads/${file.filename}`);
    }

    // Create recovery report
    const result = await pool.query(
      `INSERT INTO recovery_reports (event_id, reporter_id, has_food, food_quantity, food_description, photo_urls, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [event_id, reporter_id, has_food, food_quantity, food_description, photo_urls, notes]
    );

    // Update event status
    await pool.query(
      `UPDATE events SET status = 'reported', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [event_id]
    );

    const report = result.rows[0];

    res.status(201).json({
      message: 'Recovery report created successfully',
      report
    });

    // If there IS food, we should trigger notifications to drivers
    // This will be handled by the notification system we'll create
  } catch (error) {
    console.error('Create recovery report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getRecoveryReports(req: Request, res: Response) {
  try {
    const { status, has_food } = req.query;

    let query = `
      SELECT rr.*,
             e.title as event_title,
             e.location as event_location,
             e.latitude as event_latitude,
             e.longitude as event_longitude,
             u.name as reporter_name
      FROM recovery_reports rr
      JOIN events e ON rr.event_id = e.id
      LEFT JOIN users u ON rr.reporter_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND rr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (has_food !== undefined) {
      query += ` AND rr.has_food = $${paramIndex}`;
      params.push(has_food === 'true');
      paramIndex++;
    }

    query += ' ORDER BY rr.reported_at DESC';

    const result = await pool.query(query, params);
    res.json({ reports: result.rows });
  } catch (error) {
    console.error('Get recovery reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getRecoveryReportById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT rr.*,
              e.title as event_title,
              e.location as event_location,
              e.latitude as event_latitude,
              e.longitude as event_longitude,
              e.start_time as event_start_time,
              e.end_time as event_end_time,
              u.name as reporter_name,
              u.phone as reporter_phone
       FROM recovery_reports rr
       JOIN events e ON rr.event_id = e.id
       LEFT JOIN users u ON rr.reporter_id = u.id
       WHERE rr.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Recovery report not found' });
    }

    res.json({ report: result.rows[0] });
  } catch (error) {
    console.error('Get recovery report by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateRecoveryReport(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { has_food, food_quantity, food_description, notes, status } = req.body;

    // Get existing report
    const existingReport = await pool.query(
      'SELECT reporter_id FROM recovery_reports WHERE id = $1',
      [id]
    );

    if (existingReport.rows.length === 0) {
      return res.status(404).json({ error: 'Recovery report not found' });
    }

    // Check permissions (admin or the reporter who created it)
    if (req.user?.role !== 'admin' && existingReport.rows[0].reporter_id !== req.user?.userId) {
      return res.status(403).json({ error: 'You do not have permission to update this report' });
    }

    const result = await pool.query(
      `UPDATE recovery_reports
       SET has_food = COALESCE($1, has_food),
           food_quantity = COALESCE($2, food_quantity),
           food_description = COALESCE($3, food_description),
           notes = COALESCE($4, notes),
           status = COALESCE($5, status)
       WHERE id = $6
       RETURNING *`,
      [has_food, food_quantity, food_description, notes, status, id]
    );

    res.json({
      message: 'Recovery report updated successfully',
      report: result.rows[0]
    });
  } catch (error) {
    console.error('Update recovery report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
