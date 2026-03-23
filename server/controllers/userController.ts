import db from "../db/index.js";
import { supabase } from "../utils/supabase.js";

export const getUsers = async (req: any, res: any) => {
  const users = await db.query(`
    SELECT u.id, u.uid, u.name, u.username, u.email, u.role, u.tax_center_id, tc.name as tax_center_name 
    FROM users u
    LEFT JOIN tax_centers tc ON u.tax_center_id = tc.id
  `);
  res.json(users.rows);
};

export const createUser = async (req: any, res: any) => {
  const { name, username, email, password, role, tax_center_id } = req.body;
  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: password || 'password',
      email_confirm: true,
      user_metadata: { name, username }
    });

    if (authError) throw authError;

    // 2. Insert into public.users table
    const result = await db.query(`
      INSERT INTO users (name, username, email, password, role, tax_center_id, uid)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [name, username, email, password || 'password', role, tax_center_id, authData.user.id]);
    
    res.json({ id: result.rows[0].id, uid: authData.user.id });
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(400).json({ error: error.message || "Failed to create user" });
  }
};

export const updateUser = async (req: any, res: any) => {
  const { name, username, email, password, role, tax_center_id } = req.body;
  const updates: string[] = [];
  const params: any[] = [];
  let paramIdx = 1;

  if (name) { updates.push(`name = $${paramIdx++}`); params.push(name); }
  if (username) { updates.push(`username = $${paramIdx++}`); params.push(username); }
  if (email) { updates.push(`email = $${paramIdx++}`); params.push(email); }
  if (password) { updates.push(`password = $${paramIdx++}`); params.push(password); }
  if (role) { updates.push(`role = $${paramIdx++}`); params.push(role); }
  if (tax_center_id !== undefined) { updates.push(`tax_center_id = $${paramIdx++}`); params.push(tax_center_id); }

  if (updates.length > 0) {
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIdx}`;
    params.push(req.params.id);
    await db.query(query, params);

    // If email or password changed, we should ideally update Supabase Auth too
    // But for now, we'll keep it simple.
  }
  res.json({ success: true });
};

export const deleteUser = async (req: any, res: any) => {
  const { id } = req.params;
  try {
    // Get the UID first
    const user = await db.query("SELECT uid FROM users WHERE id = $1", [id]);
    if (user.rows.length > 0 && user.rows[0].uid) {
      // Delete from Supabase Auth
      await supabase.auth.admin.deleteUser(user.rows[0].uid);
    }
    
    // Delete from public.users
    await db.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message || "Failed to delete user" });
  }
};

export const updateProfile = async (req: any, res: any) => {
  const { name, email } = req.body;
  const { id } = req.params;
  
  try {
    await db.query("UPDATE users SET name = $1, email = $2 WHERE id = $3", [name, email, id]);
    const result = await db.query("SELECT id, name, email, role, tax_center_id FROM users WHERE id = $1", [id]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: "Email already exists or update failed" });
  }
};

export const changePassword = async (req: any, res: any) => {
  const { currentPassword, newPassword } = req.body;
  const { id } = req.params;
  
  const result = await db.query("SELECT * FROM users WHERE id = $1 AND password = $2", [id, currentPassword]);
  if (result.rows.length === 0) {
    return res.status(401).json({ error: "Incorrect current password" });
  }
  
  await db.query("UPDATE users SET password = $1 WHERE id = $2", [newPassword, id]);
  res.json({ success: true });
};

export const getPerformanceStats = async (req: any, res: any) => {
  const stats = await db.query(`
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
    GROUP BY u.id, u.name, u.role, tc.name
    ORDER BY complaint_count DESC
  `);
  res.json(stats.rows);
};
