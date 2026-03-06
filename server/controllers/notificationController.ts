import db from "../db/index.js";

export const getNotifications = (req: any, res: any) => {
  const { userId } = req.query;
  const notifications = db.prepare(`
    SELECT * FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 50
  `).all(userId);
  res.json(notifications);
};

export const markAsRead = (req: any, res: any) => {
  db.prepare("UPDATE notifications SET is_read = 1 WHERE id = ?").run(req.params.id);
  res.json({ success: true });
};

export const markAllAsRead = (req: any, res: any) => {
  const { userId } = req.body;
  db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(userId);
  res.json({ success: true });
};
