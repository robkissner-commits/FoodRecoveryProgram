import { Request, Response } from 'express';
import { pool } from '../config/database';

export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;
    const { unread_only } = req.query;

    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    const params: any[] = [userId];

    if (unread_only === 'true') {
      query += ' AND read = false';
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const result = await pool.query(query, params);
    res.json({ notifications: result.rows });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function markNotificationAsRead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const result = await pool.query(
      `UPDATE notifications
       SET read = true
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      message: 'Notification marked as read',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function markAllNotificationsAsRead(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    await pool.query(
      'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
      [userId]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = req.user?.userId;

    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
      [userId]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Helper function to create notifications (can be called from other controllers)
export async function createNotification(
  userId: number,
  title: string,
  message: string,
  type: string,
  relatedId?: number
) {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, related_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, title, message, type, relatedId]
    );
  } catch (error) {
    console.error('Create notification error:', error);
  }
}

// Helper function to notify all drivers about a new recovery
export async function notifyDriversAboutRecovery(recoveryReportId: number) {
  try {
    // Get all active drivers
    const driversResult = await pool.query(
      "SELECT id FROM users WHERE role = 'driver' AND active = true"
    );

    // Get recovery report details
    const reportResult = await pool.query(
      `SELECT rr.*, e.title, e.location
       FROM recovery_reports rr
       JOIN events e ON rr.event_id = e.id
       WHERE rr.id = $1`,
      [recoveryReportId]
    );

    if (reportResult.rows.length === 0) return;

    const report = reportResult.rows[0];

    // Create notification for each driver
    const title = 'New Food Recovery Available!';
    const message = `Food available at ${report.title} (${report.location}). Quantity: ${report.food_quantity || 'Not specified'}`;

    for (const driver of driversResult.rows) {
      await createNotification(driver.id, title, message, 'new_recovery', recoveryReportId);
    }
  } catch (error) {
    console.error('Notify drivers error:', error);
  }
}
