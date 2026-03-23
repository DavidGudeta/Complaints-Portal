import db from "../db/index.js";

export const getCategories = async (req: any, res: any) => {
  const categories = await db.prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM categories WHERE parent_id = c.id) as subcategory_count
    FROM categories c
  `).all();
  res.json(categories);
};

export const getCategoryTree = async (req: any, res: any) => {
  const categories = await db.prepare("SELECT * FROM categories WHERE parent_id IS NULL").all();
  const subcategories = await db.prepare("SELECT * FROM categories WHERE parent_id IS NOT NULL").all();
  
  const tree = categories.map((cat: any) => ({
    ...cat,
    subcategories: subcategories.filter((sub: any) => sub.parent_id === cat.id)
  }));
  
  res.json(tree);
};

export const getSubcategories = async (req: any, res: any) => {
  const subcategories = await db.prepare(`
    SELECT s.*, c.name as category_name 
    FROM categories s 
    JOIN categories c ON s.parent_id = c.id 
    WHERE s.parent_id IS NULL IS NOT TRUE
  `).all();
  res.json(subcategories);
};

export const createCategory = async (req: any, res: any) => {
  const { name, parent_id } = req.body;
  const result = await db.prepare("INSERT INTO categories (name, parent_id) VALUES (?, ?)").run(name, parent_id || null);
  res.json({ id: result.lastInsertRowid });
};

export const updateCategory = async (req: any, res: any) => {
  const { name, parent_id } = req.body;
  await db.prepare("UPDATE categories SET name = ?, parent_id = ? WHERE id = ?").run(name, parent_id || null, req.params.id);
  res.json({ success: true });
};

export const deleteCategory = async (req: any, res: any) => {
  // Check if it has subcategories
  const subCount = await db.prepare("SELECT COUNT(*) as count FROM categories WHERE parent_id = ?").get(req.params.id) as any;
  if (subCount.count > 0) {
    return res.status(400).json({ error: "Cannot delete category with subcategories" });
  }
  
  // Check if it's used in complaints
  const complaintCount = await db.prepare("SELECT COUNT(*) as count FROM complaints_case WHERE COMPLAINTS_CATEGORY = CAST(? AS TEXT) OR COMPLAINTS_SUB_CATEGORY = CAST(? AS TEXT)").get(req.params.id, req.params.id) as any;
  if (complaintCount.count > 0) {
    return res.status(400).json({ error: "Cannot delete category used in complaints" });
  }

  await db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.json({ success: true });
};

export const getTaxCenters = async (req: any, res: any) => {
  const centers = await db.prepare("SELECT * FROM tax_centers").all();
  res.json(centers);
};

export const createTaxCenter = async (req: any, res: any) => {
  const { name, location } = req.body;
  const result = await db.prepare("INSERT INTO tax_centers (name, location) VALUES (?, ?)").run(name, location);
  res.json({ id: result.lastInsertRowid });
};

export const updateTaxCenter = async (req: any, res: any) => {
  const { name, location } = req.body;
  await db.prepare("UPDATE tax_centers SET name = ?, location = ? WHERE id = ?").run(name, location, req.params.id);
  res.json({ success: true });
};

export const deleteTaxCenter = async (req: any, res: any) => {
  const users = await db.prepare("SELECT COUNT(*) as count FROM users WHERE tax_center_id = ?").get(req.params.id) as any;
  if (users.count > 0) {
    return res.status(400).json({ error: "Cannot delete tax center with assigned users" });
  }
  await db.prepare("DELETE FROM tax_centers WHERE id = ?").run(req.params.id);
  res.json({ success: true });
};

export const getStats = async (req: any, res: any) => {
  const { taxCenterId, role } = req.query;
  let filter = "";
  const params: any[] = [];

  if (taxCenterId && role !== 'DIRECTOR' && role !== 'ADMIN') {
    filter = " AND TAX_CENTER = ?";
    params.push(taxCenterId);
  }

  const stats = {
    total: await db.prepare(`SELECT COUNT(*) as count FROM complaints_case WHERE 1=1 ${filter}`).get(...params) as any,
    pending: await db.prepare(`SELECT COUNT(*) as count FROM complaints_case WHERE CASE_STATUS = 'PENDING' ${filter}`).get(...params) as any,
    in_progress: await db.prepare(`SELECT COUNT(*) as count FROM complaints_case WHERE CASE_STATUS = 'IN_PROGRESS' ${filter}`).get(...params) as any,
    closed: await db.prepare(`SELECT COUNT(*) as count FROM complaints_case WHERE CASE_STATUS = 'CLOSED' ${filter}`).get(...params) as any,
  };
  res.json({
    total: stats.total.count,
    pending: stats.pending.count,
    in_progress: stats.in_progress.count,
    closed: stats.closed.count,
  });
};
