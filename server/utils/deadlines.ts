import db from "../db/index.js";
import { createNotification } from "./notifications.js";

export const checkDeadlines = async () => {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  const upcoming = await db.prepare(`
    SELECT * FROM complaints_case 
    WHERE CASE_STATUS != 'CLOSED' 
    AND CASE_STATUS != 'APPROVED'
    AND APPLIED_DATE <= ? 
    AND deadline_notified = 0
  `).all(tomorrow.toISOString()) as any[];

  for (const c of upcoming) {
    // Notify assigned officer
    if (c.RELEVANT_OFFICER) {
      await createNotification(
        c.RELEVANT_OFFICER,
        'DEADLINE_REMINDER',
        'Upcoming Deadline',
        `Case ${c.COMPLAINT_CODE} is due within 24 hours.`,
        `/cases/detail/${c.COMPLAINT_CODE}`
      );
    }
    
    // Notify Team Leader
    const leaders = await db.prepare("SELECT id FROM users WHERE role = 'TEAM_LEADER' AND tax_center_id = CAST(? AS INTEGER)").all(c.TAX_CENTER) as any[];
    for (const l of leaders) {
      await createNotification(
        l.id,
        'DEADLINE_REMINDER',
        'Case Deadline Approaching',
        `Assigned case ${c.COMPLAINT_CODE} is approaching its deadline.`,
        `/cases/detail/${c.COMPLAINT_CODE}`
      );
    }

    await db.prepare("UPDATE complaints_case SET deadline_notified = 1 WHERE COMPLAINTS_ID = ?").run(c.COMPLAINTS_ID);
  }
};
