import db from "../db/index.js";
import { createNotification } from "./notifications.js";

export const checkDeadlines = () => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const upcoming = db.prepare(`
    SELECT * FROM complaints 
    WHERE status != 'CLOSED' 
    AND status != 'APPROVED'
    AND due_date <= ? 
    AND deadline_notified = 0
  `).all(tomorrow.toISOString()) as any[];

  upcoming.forEach(c => {
    // Notify assigned officer
    if (c.assigned_to) {
      createNotification(
        c.assigned_to,
        'DEADLINE_REMINDER',
        'Upcoming Deadline',
        `Case ${c.tracking_code} is due within 24 hours.`,
        `/cases/detail/${c.tracking_code}`
      );
    }
    
    // Notify Team Leader
    const leaders = db.prepare("SELECT id FROM users WHERE role = 'TEAM_LEADER' AND tax_center_id = ?").all(c.tax_center_id) as any[];
    leaders.forEach(l => {
      createNotification(
        l.id,
        'DEADLINE_REMINDER',
        'Case Deadline Approaching',
        `Assigned case ${c.tracking_code} is approaching its deadline.`,
        `/cases/detail/${c.tracking_code}`
      );
    });

    db.prepare("UPDATE complaints SET deadline_notified = 1 WHERE id = ?").run(c.id);
  });
};
