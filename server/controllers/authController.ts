import db from "../db/index.js";

export const login = (req: any, res: any) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT id, name, email, role, tax_center_id FROM users WHERE email = ? AND password = ?").get(email, password) as any;
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
};
