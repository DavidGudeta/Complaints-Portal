import db from "../db/index.js";

export const getCategories = (req: any, res: any) => {
  const categories = db.prepare("SELECT * FROM categories").all();
  res.json(categories);
};

export const getTaxCenters = (req: any, res: any) => {
  const centers = db.prepare("SELECT * FROM tax_centers").all();
  res.json(centers);
};

export const createTaxCenter = (req: any, res: any) => {
  const { name, location } = req.body;
  const result = db.prepare("INSERT INTO tax_centers (name, location) VALUES (?, ?)").run(name, location);
  res.json({ id: result.lastInsertRowid });
};

export const updateTaxCenter = (req: any, res: any) => {
  const { name, location } = req.body;
  db.prepare("UPDATE tax_centers SET name = ?, location = ? WHERE id = ?").run(name, location, req.params.id);
  res.json({ success: true });
};

export const deleteTaxCenter = (req: any, res: any) => {
  const users = db.prepare("SELECT COUNT(*) as count FROM users WHERE tax_center_id = ?").get(req.params.id) as any;
  if (users.count > 0) {
    return res.status(400).json({ error: "Cannot delete tax center with assigned users" });
  }
  db.prepare("DELETE FROM tax_centers WHERE id = ?").run(req.params.id);
  res.json({ success: true });
};

export const getStats = (req: any, res: any) => {
  const { taxCenterId, role } = req.query;
  let filter = "";
  const params: any[] = [];

  if (taxCenterId && role !== 'DIRECTOR' && role !== 'ADMIN') {
    filter = " AND tax_center_id = ?";
    params.push(taxCenterId);
  }

  const stats = {
    total: db.prepare(`SELECT COUNT(*) as count FROM complaints WHERE 1=1 ${filter}`).get(...params) as any,
    pending: db.prepare(`SELECT COUNT(*) as count FROM complaints WHERE status = 'PENDING' ${filter}`).get(...params) as any,
    in_progress: db.prepare(`SELECT COUNT(*) as count FROM complaints WHERE status = 'IN_PROGRESS' ${filter}`).get(...params) as any,
    closed: db.prepare(`SELECT COUNT(*) as count FROM complaints WHERE status = 'CLOSED' ${filter}`).get(...params) as any,
  };
  res.json({
    total: stats.total.count,
    pending: stats.pending.count,
    in_progress: stats.in_progress.count,
    closed: stats.closed.count,
  });
};
