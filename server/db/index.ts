import Database from "better-sqlite3";

const db = new Database("taxguard.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS tax_centers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    tax_center_id INTEGER,
    FOREIGN KEY (tax_center_id) REFERENCES tax_centers(id)
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    parent_id INTEGER,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS COMPLAINANT (
    COMPLAINANT_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    EMAIL_ID TEXT,
    TAXPAYER_PHONE TEXT,
    COMPLAINANT_NAME TEXT,
    COMPLAINANT_PHONE TEXT,
    TAXPAYER_NAME TEXT,
    TAXPAYER_ADDRESS TEXT,
    IP_ADDRESS TEXT,
    LETTER_NO TEXT,
    APPLICATION_DATE DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS complaints_case (
    COMPLAINTS_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    COMPLAINTS_CODE TEXT UNIQUE,
    ENTERPISE_NAME TEXT,
    MANAGER_PHONE TEXT,
    COMPLAINANT_NAME TEXT,
    COMPLAINANT_PHONE TEXT,
    COMPLAINANT_EMAIL TEXT,
    TAX_CENTER TEXT,
    COMPLAINTS_CATEGORY TEXT,
    TIN TEXT,
    APPLIED_DATE DATETIME DEFAULT CURRENT_TIMESTAMP,
    COMPLAIN_DETAILS TEXT,
    COMPLAINTS_POINTS TEXT,
    MACHINE_CODE TEXT,
    COMPLAINS_ON TEXT,
    ENTERPRISE_ADDRESS TEXT,
    CUSTOMER_ADDRESS TEXT,
    COMPLAINTS_DETAILS TEXT,
    REMARKS TEXT,
    COMPLAINTS_SHORTLY TEXT,
    CASE_STATUS TEXT DEFAULT 'PENDING',
    REFERENCE_NO TEXT,
    APPLICATION_TYPE TEXT,
    CASE_TYPE TEXT,
    RELEVANT_OFFICER INTEGER,
    LAST_UPDATED_DATE DATETIME DEFAULT CURRENT_TIMESTAMP,
    CURRENT_YEAR TEXT,
    COMPLAINTS_STATUS TEXT,
    COMPLAINTS_SUB_CATEGORY TEXT,
    ATTACHED_FILE TEXT,
    EMAIL_STATUS TEXT,
    COMPLAINTS_TITLE TEXT,
    COMPLAINT_CODE TEXT,
    FOREIGN KEY (RELEVANT_OFFICER) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tracking_code TEXT UNIQUE NOT NULL,
    tin TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    subject TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    subcategory_id INTEGER,
    tax_center_id INTEGER,
    description TEXT NOT NULL,
    mrc_code TEXT,
    ref_no TEXT,
    woreda TEXT,
    zone TEXT,
    region TEXT,
    status TEXT DEFAULT 'PENDING',
    assigned_to INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    due_date DATETIME,
    deadline_notified INTEGER DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (subcategory_id) REFERENCES categories(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (tax_center_id) REFERENCES tax_centers(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    user_id INTEGER,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    findings TEXT NOT NULL,
    recommendation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id)
  );
`);

// Seed initial data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO tax_centers (name, location) VALUES (?, ?)").run("Addis Ababa Central", "Addis Ababa");
  db.prepare("INSERT INTO tax_centers (name, location) VALUES (?, ?)").run("Dire Dawa Branch", "Dire Dawa");
  db.prepare("INSERT INTO tax_centers (name, location) VALUES (?, ?)").run("Mekelle Branch", "Mekelle");
  
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("Tax Assessment");
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("Payment Issues");
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("Refund Claims");
  
  // Default users (password is 'password' for demo)
  db.prepare("INSERT INTO users (name, email, password, role, tax_center_id) VALUES (?, ?, ?, ?, ?)").run("Director User", "director@revenue.gov.et", "password", "DIRECTOR", 1);
  db.prepare("INSERT INTO users (name, email, password, role, tax_center_id) VALUES (?, ?, ?, ?, ?)").run("Team Leader AA", "leader.aa@revenue.gov.et", "password", "TEAM_LEADER", 1);
  db.prepare("INSERT INTO users (name, email, password, role, tax_center_id) VALUES (?, ?, ?, ?, ?)").run("Team Leader DD", "leader.dd@revenue.gov.et", "password", "TEAM_LEADER", 2);
  db.prepare("INSERT INTO users (name, email, password, role, tax_center_id) VALUES (?, ?, ?, ?, ?)").run("Officer AA", "officer.aa@revenue.gov.et", "password", "OFFICER", 1);
  db.prepare("INSERT INTO users (name, email, password, role, tax_center_id) VALUES (?, ?, ?, ?, ?)").run("Officer DD", "officer.dd@revenue.gov.et", "password", "OFFICER", 2);
  db.prepare("INSERT INTO users (name, email, password, role, tax_center_id) VALUES (?, ?, ?, ?, ?)").run("Admin User", "admin@revenue.gov.et", "password", "ADMIN", 1);
}

export default db;
