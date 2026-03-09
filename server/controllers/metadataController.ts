import db from "../db/index.js";

export const getCategories = (req: any, res: any) => {
  const categories = db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM categories WHERE parent_id = c.id) as subcategory_count
    FROM categories c
  `).all();
  res.json(categories);
};

export const getCategoryTree = (req: any, res: any) => {
  const categories = db.prepare("SELECT * FROM categories WHERE parent_id IS NULL").all();
  const subcategories = db.prepare("SELECT * FROM categories WHERE parent_id IS NOT NULL").all();
  
  const tree = categories.map((cat: any) => ({
    ...cat,
    subcategories: subcategories.filter((sub: any) => sub.parent_id === cat.id)
  }));
  
  res.json(tree);
};

export const getSubcategories = (req: any, res: any) => {
  const subcategories = db.prepare(`
    SELECT s.*, c.name as category_name 
    FROM categories s 
    JOIN categories c ON s.parent_id = c.id 
    WHERE s.parent_id IS NULL IS NOT TRUE
  `).all();
  res.json(subcategories);
};

export const createCategory = (req: any, res: any) => {
  const { name, parent_id } = req.body;
  const result = db.prepare("INSERT INTO categories (name, parent_id) VALUES (?, ?)").run(name, parent_id || null);
  res.json({ id: result.lastInsertRowid });
};

export const updateCategory = (req: any, res: any) => {
  const { name, parent_id } = req.body;
  db.prepare("UPDATE categories SET name = ?, parent_id = ? WHERE id = ?").run(name, parent_id || null, req.params.id);
  res.json({ success: true });
};

export const deleteCategory = (req: any, res: any) => {
  // Check if it has subcategories
  const subCount = db.prepare("SELECT COUNT(*) as count FROM categories WHERE parent_id = ?").get(req.params.id) as any;
  if (subCount.count > 0) {
    return res.status(400).json({ error: "Cannot delete category with subcategories" });
  }
  
  // Check if it's used in complaints
  const complaintCount = db.prepare("SELECT COUNT(*) as count FROM complaints WHERE category_id = ? OR subcategory_id = ?").get(req.params.id, req.params.id) as any;
  if (complaintCount.count > 0) {
    return res.status(400).json({ error: "Cannot delete category used in complaints" });
  }

  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.json({ success: true });
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
