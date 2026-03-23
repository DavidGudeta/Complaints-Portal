import db from "../db/index.js";

export const getNotifications = async (req: any, res: any) => {
  const { userId } = req.query;
  try {
    const notifications = await db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all(userId);
    res.json(notifications);
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const markAsRead = async (req: any, res: any) => {
  try {
    await db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

export const markAllAsRead = async (req: any, res: any) => {
  const { userId } = req.body;
  try {
    await db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(userId);
    res.json({ success: true });
  } catch (error) {
    console.error('markAllAsRead error:', error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};
