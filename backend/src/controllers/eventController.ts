import { Request, Response } from 'express';
import { pool } from '../config/database';
import { parse } from 'csv-parse/sync';
import fs from 'fs';

export async function getEvents(req: Request, res: Response) {
  try {
    const { status, from_date, to_date } = req.query;

    let query = `
      SELECT e.*,
             u.name as reporter_name,
             u.email as reporter_email,
             u.phone as reporter_phone
      FROM events e
      LEFT JOIN users u ON e.reporter_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND e.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (from_date) {
      query += ` AND e.start_time >= $${paramIndex}`;
      params.push(from_date);
      paramIndex++;
    }

    if (to_date) {
      query += ` AND e.start_time <= $${paramIndex}`;
      params.push(to_date);
      paramIndex++;
    }

    query += ' ORDER BY e.start_time ASC';

    const result = await pool.query(query, params);
    res.json({ events: result.rows });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getEventById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT e.*,
              u.name as reporter_name,
              u.email as reporter_email,
              u.phone as reporter_phone
       FROM events e
       LEFT JOIN users u ON e.reporter_id = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event: result.rows[0] });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createEvent(req: Request, res: Response) {
  try {
    const {
      title,
      location,
      latitude,
      longitude,
      start_time,
      end_time,
      expected_attendees,
      food_type,
      catering_company,
      notes
    } = req.body;

    if (!title || !location || !start_time || !end_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO events (title, location, latitude, longitude, start_time, end_time, expected_attendees, food_type, catering_company, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, location, latitude, longitude, start_time, end_time, expected_attendees, food_type, catering_company, notes]
    );

    res.status(201).json({
      message: 'Event created successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function uploadEventsCSV(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read CSV file
    const fileContent = fs.readFileSync(req.file.path, 'utf-8');

    // Parse CSV
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // Validate and insert events
    const insertedEvents = [];
    const errors = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];

      try {
        // Required fields validation
        if (!record.title || !record.location || !record.start_time || !record.end_time) {
          errors.push({ row: i + 2, error: 'Missing required fields' });
          continue;
        }

        // Insert event
        const result = await pool.query(
          `INSERT INTO events (title, location, latitude, longitude, start_time, end_time, expected_attendees, food_type, catering_company, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
          [
            record.title,
            record.location,
            record.latitude || null,
            record.longitude || null,
            record.start_time,
            record.end_time,
            record.expected_attendees || null,
            record.food_type || null,
            record.catering_company || null,
            record.notes || null
          ]
        );

        insertedEvents.push(result.rows[0]);
      } catch (error: any) {
        errors.push({ row: i + 2, error: error.message });
      }
    }

    // Delete uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'CSV upload processed',
      inserted: insertedEvents.length,
      errors: errors.length,
      events: insertedEvents,
      errorDetails: errors
    });
  } catch (error) {
    console.error('Upload CSV error:', error);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function assignReporter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const reporterId = req.user?.userId;

    if (!reporterId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if user is a reporter
    if (req.user?.role !== 'reporter') {
      return res.status(403).json({ error: 'Only reporters can assign themselves to events' });
    }

    // Check if event exists and is available
    const eventResult = await pool.query(
      'SELECT id, reporter_id, status FROM events WHERE id = $1',
      [id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventResult.rows[0];

    if (event.reporter_id) {
      return res.status(400).json({ error: 'Event already has a reporter assigned' });
    }

    // Assign reporter
    const result = await pool.query(
      `UPDATE events
       SET reporter_id = $1, status = 'assigned', updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [reporterId, id]
    );

    res.json({
      message: 'Successfully assigned to event',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Assign reporter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function unassignReporter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // Check if event exists
    const eventResult = await pool.query(
      'SELECT id, reporter_id FROM events WHERE id = $1',
      [id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventResult.rows[0];

    // Check if user is the assigned reporter or an admin
    if (req.user?.role !== 'admin' && event.reporter_id !== userId) {
      return res.status(403).json({ error: 'You can only unassign yourself or must be an admin' });
    }

    // Unassign reporter
    const result = await pool.query(
      `UPDATE events
       SET reporter_id = NULL, status = 'scheduled', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({
      message: 'Reporter unassigned successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Unassign reporter error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateEvent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      title,
      location,
      latitude,
      longitude,
      start_time,
      end_time,
      expected_attendees,
      food_type,
      catering_company,
      notes,
      status
    } = req.body;

    const result = await pool.query(
      `UPDATE events
       SET title = COALESCE($1, title),
           location = COALESCE($2, location),
           latitude = COALESCE($3, latitude),
           longitude = COALESCE($4, longitude),
           start_time = COALESCE($5, start_time),
           end_time = COALESCE($6, end_time),
           expected_attendees = COALESCE($7, expected_attendees),
           food_type = COALESCE($8, food_type),
           catering_company = COALESCE($9, catering_company),
           notes = COALESCE($10, notes),
           status = COALESCE($11, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING *`,
      [title, location, latitude, longitude, start_time, end_time, expected_attendees, food_type, catering_company, notes, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      message: 'Event updated successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteEvent(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
