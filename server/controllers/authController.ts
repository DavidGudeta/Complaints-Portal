import db from "../db/index.js";

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  try {
    const user = await db.prepare("SELECT id, name, email, role, tax_center_id FROM users WHERE email = ? AND password = ?").get(email, password) as any;
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Database connection error. Please check server logs." });
  }
};
