import db from "../db/index.js";

export const getUsers = (req: any, res: any) => {
  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.tax_center_id, tc.name as tax_center_name 
    FROM users u
    LEFT JOIN tax_centers tc ON u.tax_center_id = tc.id
  `).all();
  res.json(users);
};

export const createUser = (req: any, res: any) => {
  const { name, email, password, role, tax_center_id } = req.body;
  try {
    const result = db.prepare(`
      INSERT INTO users (name, email, password, role, tax_center_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email, password || 'password', role, tax_center_id);
    res.json({ id: result.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: "Email already exists" });
  }
};

export const updateUser = (req: any, res: any) => {
  const { name, email, password, role, tax_center_id } = req.body;
  const updates: string[] = [];
  const params: any[] = [];

  if (name) { updates.push("name = ?"); params.push(name); }
  if (email) { updates.push("email = ?"); params.push(email); }
  if (password) { updates.push("password = ?"); params.push(password); }
  if (role) { updates.push("role = ?"); params.push(role); }
  if (tax_center_id !== undefined) { updates.push("tax_center_id = ?"); params.push(tax_center_id); }

  if (updates.length > 0) {
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    params.push(req.params.id);
    db.prepare(query).run(...params);
  }
  res.json({ success: true });
};

export const deleteUser = (req: any, res: any) => {
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ success: true });
};

export const updateProfile = (req: any, res: any) => {
  const { name, email } = req.body;
  const { id } = req.params;
  
  try {
    db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, id);
    const updatedUser = db.prepare("SELECT id, name, email, role, tax_center_id FROM users WHERE id = ?").get(id);
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: "Email already exists or update failed" });
  }
};

export const changePassword = (req: any, res: any) => {
  const { currentPassword, newPassword } = req.body;
  const { id } = req.params;
  
  const user = db.prepare("SELECT * FROM users WHERE id = ? AND password = ?").get(id, currentPassword);
  if (!user) {
    return res.status(401).json({ error: "Incorrect current password" });
  }
  
  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(newPassword, id);
  res.json({ success: true });
};

export const getPerformanceStats = (req: any, res: any) => {
  const stats = db.prepare(`
    SELECT 
      u.id, 
      u.name, 
      u.role, 
      tc.name as tax_center_name,
      COUNT(c.COMPLAINTS_ID) as complaint_count
    FROM users u
    LEFT JOIN tax_centers tc ON u.tax_center_id = tc.id
    LEFT JOIN complaints_case c ON u.id = c.RELEVANT_OFFICER
    WHERE u.role IN ('OFFICER', 'TEAM_LEADER')
    GROUP BY u.id
    ORDER BY complaint_count DESC
  `).all();
  res.json(stats);
};
