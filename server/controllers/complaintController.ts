import db from "../db/index.js";
import { createNotification } from "../utils/notifications.js";

export const submitComplaint = (req: any, res: any) => {
  const { tin, name, email, phone, subject, category_id, tax_center_id, description } = req.body;
  const tracking_code = "CMP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const dueDate = new Date();
  dueDate.setHours(dueDate.getHours() + 48);
  const dueDateStr = dueDate.toISOString();

  try {
    const result = db.prepare(`
      INSERT INTO complaints (tracking_code, tin, name, email, phone, subject, category_id, tax_center_id, description, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(tracking_code, tin, name, email, phone, subject, category_id, tax_center_id, description, dueDateStr);
    
    const staff = db.prepare("SELECT id FROM users WHERE (role = 'DIRECTOR' OR (role = 'TEAM_LEADER' AND tax_center_id = ?))").all(tax_center_id) as any[];
    staff.forEach(s => {
      createNotification(
        s.id, 
        'NEW_COMPLAINT', 
        'New Complaint Received', 
        `A new complaint (${tracking_code}) has been submitted.`,
        `/cases/detail/${tracking_code}`
      );
    });

    res.json({ tracking_code, id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit complaint" });
  }
};

export const trackComplaint = (req: any, res: any) => {
  const complaint = db.prepare(`
    SELECT c.*, cat.name as category_name 
    FROM complaints c
    JOIN categories cat ON c.category_id = cat.id
    WHERE c.tracking_code = ?
  `).get(req.params.code) as any;
  
  if (complaint) {
    const responses = db.prepare(`
      SELECT r.*, u.name as user_name, u.role as user_role
      FROM responses r
      JOIN users u ON r.user_id = u.id
      WHERE r.complaint_id = ?
      ORDER BY r.created_at ASC
    `).all(complaint.id);
    
    res.json({ ...complaint, responses });
  } else {
    res.status(404).json({ error: "Complaint not found" });
  }
};

export const listComplaints = (req: any, res: any) => {
  const { role, userId, status, taxCenterId } = req.query;
  let query = `
    SELECT c.*, cat.name as category_name, u.name as assigned_name, tc.name as tax_center_name
    FROM complaints c
    JOIN categories cat ON c.category_id = cat.id
    LEFT JOIN users u ON c.assigned_to = u.id
    LEFT JOIN tax_centers tc ON c.tax_center_id = tc.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (role === 'OFFICER') {
    query += " AND c.assigned_to = ?";
    params.push(userId);
  }

  if (taxCenterId && role !== 'DIRECTOR' && role !== 'ADMIN') {
    query += " AND c.tax_center_id = ?";
    params.push(taxCenterId);
  }

  if (status) {
    query += " AND c.status = ?";
    params.push(status);
  }

  query += " ORDER BY c.created_at DESC";
  
  const complaints = db.prepare(query).all(...params);
  res.json(complaints);
};

export const updateComplaint = (req: any, res: any) => {
  const { status, assigned_to, subject, description, category_id, tin, name, email, phone } = req.body;
  const updates: string[] = [];
  const params: any[] = [];

  if (status) { updates.push("status = ?"); params.push(status); }
  if (assigned_to !== undefined) { updates.push("assigned_to = ?"); params.push(assigned_to); }
  if (subject) { updates.push("subject = ?"); params.push(subject); }
  if (description) { updates.push("description = ?"); params.push(description); }
  if (category_id) { updates.push("category_id = ?"); params.push(category_id); }
  if (tin) { updates.push("tin = ?"); params.push(tin); }
  if (name) { updates.push("name = ?"); params.push(name); }
  if (email) { updates.push("email = ?"); params.push(email); }
  if (phone) { updates.push("phone = ?"); params.push(phone); }

  if (updates.length > 0) {
    updates.push("updated_at = CURRENT_TIMESTAMP");
    const query = `UPDATE complaints SET ${updates.join(", ")} WHERE id = ? OR tracking_code = ?`;
    params.push(req.params.id, req.params.id);
    db.prepare(query).run(...params);

    const complaint = db.prepare("SELECT * FROM complaints WHERE id = ? OR tracking_code = ?").get(req.params.id, req.params.id) as any;
    
    if (assigned_to) {
      createNotification(
        assigned_to,
        'ASSIGNMENT',
        'New Case Assigned',
        `You have been assigned to case ${complaint.tracking_code}.`,
        `/cases/detail/${complaint.tracking_code}`
      );
    }

    if (status && complaint.assigned_to) {
      createNotification(
        complaint.assigned_to,
        'STATUS_UPDATE',
        'Case Status Updated',
        `Case ${complaint.tracking_code} status changed to ${status}.`,
        `/cases/detail/${complaint.tracking_code}`
      );
    }
  }

  res.json({ success: true });
};

export const deleteComplaint = (req: any, res: any) => {
  db.prepare("DELETE FROM complaints WHERE id = ? OR tracking_code = ?").run(req.params.id, req.params.id);
  res.json({ success: true });
};

export const addResponse = (req: any, res: any) => {
  const { complaint_id, user_id, message } = req.body;
  db.prepare("INSERT INTO responses (complaint_id, user_id, message) VALUES (?, ?, ?)").run(complaint_id, user_id, message);
  
  const complaint = db.prepare("SELECT * FROM complaints WHERE id = ?").get(complaint_id) as any;
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(user_id) as any;

  if (user.role === 'OFFICER') {
    const leaders = db.prepare("SELECT id FROM users WHERE role = 'TEAM_LEADER' AND tax_center_id = ?").all(complaint.tax_center_id) as any[];
    leaders.forEach(l => {
      createNotification(
        l.id,
        'NEW_RESPONSE',
        'New Response Added',
        `${user.name} added a response to ${complaint.tracking_code}.`,
        `/cases/detail/${complaint.tracking_code}`
      );
    });
  }

  res.json({ success: true });
};
