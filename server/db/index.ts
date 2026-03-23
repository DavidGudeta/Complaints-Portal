import pg from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);
const lookup = promisify(dns.lookup);

// Force Node.js to prefer IPv4 over IPv6 globally
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();

const { Pool } = pg;

const EXPECTED_PASSWORD = "0dY423PeIsn70Ds9";
const EXPECTED_USER = "postgres";
const DEFAULT_HOST = "db.wgxohuugcinzlqzeldys.supabase.co";
const DEFAULT_DATABASE = "postgres";
const POOLING_PORT = 6543;

// Helper to resolve host to IPv4
const resolveToIpv4 = async (hostname: string) => {
  // If it's already an IP, return it
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname)) {
    return hostname;
  }

  try {
    console.log(`[DB] Attempting to resolve ${hostname} to IPv4 using dns.resolve4...`);
    const addresses = await resolve4(hostname);
    if (addresses && addresses.length > 0) {
      console.log(`[DB] Resolved ${hostname} to IPv4 addresses: ${addresses.join(', ')}. Using ${addresses[0]}`);
      return addresses[0];
    }
  } catch (err) {
    console.warn(`[DB] dns.resolve4 failed for ${hostname}:`, err instanceof Error ? err.message : err);
  }

  // Fallback to dns.lookup if resolve4 fails
  try {
    console.log(`[DB] Attempting to resolve ${hostname} to IPv4 using dns.lookup...`);
    const result = await lookup(hostname, { family: 4 });
    console.log(`[DB] dns.lookup resolved ${hostname} to IPv4: ${result.address}`);
    return result.address;
  } catch (lookupErr) {
    console.warn(`[DB] dns.lookup also failed for ${hostname}, using original hostname.`);
    return hostname;
  }
};

const getPoolConfig = async () => {
  const rawUrl = process.env.DATABASE_URL;
  
  // Default fallback config
  const fallbackConfig = {
    user: EXPECTED_USER,
    password: EXPECTED_PASSWORD,
    host: DEFAULT_HOST,
    port: POOLING_PORT,
    database: DEFAULT_DATABASE,
    ssl: { rejectUnauthorized: false },
    family: 4
  };

  if (!rawUrl) {
    console.warn('[DB] DATABASE_URL not found, using fallback config');
    fallbackConfig.host = await resolveToIpv4(fallbackConfig.host);
    return fallbackConfig;
  }

  try {
    const url = new URL(rawUrl.trim());
    const user = url.username || EXPECTED_USER;
    const password = decodeURIComponent(url.password) || EXPECTED_PASSWORD;
    const originalHost = url.hostname || DEFAULT_HOST;
    const port = parseInt(url.port) || POOLING_PORT;
    const database = url.pathname.substring(1) || DEFAULT_DATABASE;

    console.log(`[DB] Connecting to ${originalHost}:${port}/${database} as ${user}`);

    // Resolve hostname to IP to bypass IPv6 issues
    const resolvedHost = await resolveToIpv4(originalHost);

    return {
      user,
      password,
      host: resolvedHost,
      port,
      database,
      ssl: { 
        rejectUnauthorized: false,
        servername: originalHost // Keep original host for SNI
      },
      family: 4
    };
  } catch (error) {
    console.error('[DB] Failed to parse DATABASE_URL, using fallback', error);
    fallbackConfig.host = await resolveToIpv4(fallbackConfig.host);
    return fallbackConfig;
  }
};

let pool: pg.Pool | null = null;
let poolPromise: Promise<pg.Pool> | null = null;

const getPool = async (): Promise<pg.Pool> => {
  if (pool) return pool;
  if (poolPromise) return poolPromise;

  poolPromise = (async () => {
    const config = await getPoolConfig();
    const newPool = new Pool(config);

    newPool.on('error', (err) => {
      console.error('[DB] Unexpected error on idle client', err);
    });

    // Test connection
    try {
      const res = await newPool.query('SELECT NOW()');
      console.log('✅ Database connection successful at:', res.rows[0].now);
    } catch (err: any) {
      console.error('❌ Database connection failed:', err.message);
      if (err.message.includes('ECONNREFUSED')) {
        console.error('HINT: Connection refused. This usually means the host is unreachable or the port is wrong.');
      }
    }

    pool = newPool;
    return newPool;
  })();

  return poolPromise;
};

// Initialize Database
export const initDb = async () => {
  const p = await getPool();
  const client = await p.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tax_centers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uid UUID UNIQUE,
        name TEXT NOT NULL,
        username TEXT UNIQUE,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        tax_center_id INTEGER REFERENCES tax_centers(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Ensure uid and username columns exist if table was already created
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='uid') THEN
          ALTER TABLE users ADD COLUMN uid UUID UNIQUE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='username') THEN
          ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
        END IF;
      END $$;

      -- Disable RLS to allow frontend access (for this build)
      ALTER TABLE users DISABLE ROW LEVEL SECURITY;
      ALTER TABLE tax_centers DISABLE ROW LEVEL SECURITY;

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id INTEGER REFERENCES categories(id)
      );

      CREATE TABLE IF NOT EXISTS COMPLAINANT (
        COMPLAINANT_ID SERIAL PRIMARY KEY,
        EMAIL_ID TEXT,
        TAXPAYER_PHONE TEXT,
        COMPLAINANT_NAME TEXT,
        COMPLAINANT_PHONE TEXT,
        TAXPAYER_NAME TEXT,
        TAXPAYER_ADDRESS TEXT,
        IP_ADDRESS TEXT,
        LETTER_NO TEXT,
        APPLICATION_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS complaints_case (
        COMPLAINTS_ID SERIAL PRIMARY KEY,
        COMPLAINTS_CODE TEXT UNIQUE,
        ENTERPISE_NAME TEXT,
        MANAGER_PHONE TEXT,
        COMPLAINANT_NAME TEXT,
        COMPLAINANT_PHONE TEXT,
        COMPLAINANT_EMAIL TEXT,
        TAX_CENTER TEXT,
        COMPLAINTS_CATEGORY TEXT,
        TIN TEXT,
        APPLIED_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
        RELEVANT_OFFICER INTEGER REFERENCES users(id),
        LAST_UPDATED_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CURRENT_YEAR TEXT,
        COMPLAINTS_STATUS TEXT,
        COMPLAINTS_SUB_CATEGORY TEXT,
        ATTACHED_FILE TEXT,
        EMAIL_STATUS TEXT,
        COMPLAINTS_TITLE TEXT,
        COMPLAINT_CODE TEXT,
        deadline_notified INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        tracking_code TEXT UNIQUE NOT NULL,
        tin TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        subject TEXT NOT NULL,
        category_id INTEGER NOT NULL REFERENCES categories(id),
        subcategory_id INTEGER REFERENCES categories(id),
        tax_center_id INTEGER REFERENCES tax_centers(id),
        description TEXT NOT NULL,
        mrc_code TEXT,
        ref_no TEXT,
        woreda TEXT,
        zone TEXT,
        region TEXT,
        status TEXT DEFAULT 'PENDING',
        assigned_to INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP,
        deadline_notified INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        link TEXT,
        is_read INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS responses (
        id SERIAL PRIMARY KEY,
        complaint_id INTEGER NOT NULL REFERENCES complaints_case(COMPLAINTS_ID),
        user_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS assessments (
        id SERIAL PRIMARY KEY,
        complaint_id INTEGER NOT NULL REFERENCES complaints_case(COMPLAINTS_ID),
        user_id INTEGER NOT NULL REFERENCES users(id),
        findings TEXT NOT NULL,
        recommendation TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS attachments (
        id SERIAL PRIMARY KEY,
        complaint_id INTEGER NOT NULL REFERENCES complaints_case(COMPLAINTS_ID),
        filename TEXT NOT NULL,
        url TEXT NOT NULL
      );
    `);

    // Seed initial data if empty
    const userCountRes = await client.query("SELECT COUNT(*) as count FROM users");
    const userCount = parseInt(userCountRes.rows[0].count);
    
    if (userCount === 0) {
      await client.query("INSERT INTO tax_centers (name, location) VALUES ($1, $2)", ["Addis Ababa Central", "Addis Ababa"]);
      await client.query("INSERT INTO tax_centers (name, location) VALUES ($1, $2)", ["Dire Dawa Branch", "Dire Dawa"]);
      await client.query("INSERT INTO tax_centers (name, location) VALUES ($1, $2)", ["Mekelle Branch", "Mekelle"]);
      
      await client.query("INSERT INTO categories (name) VALUES ($1)", ["Tax Assessment"]);
      await client.query("INSERT INTO categories (name) VALUES ($1)", ["Payment Issues"]);
      await client.query("INSERT INTO categories (name) VALUES ($1)", ["Refund Claims"]);
      
      // Default users (password is 'password' for demo)
      const defaultUsers = [
        { name: "Director User", username: "director", email: "director@revenue.gov.et", role: "DIRECTOR", tax_center_id: 1 },
        { name: "Team Leader AA", username: "leader_aa", email: "leader.aa@revenue.gov.et", role: "TEAM_LEADER", tax_center_id: 1 },
        { name: "Team Leader DD", username: "leader_dd", email: "leader.dd@revenue.gov.et", role: "TEAM_LEADER", tax_center_id: 2 },
        { name: "Officer AA", username: "officer_aa", email: "officer.aa@revenue.gov.et", role: "OFFICER", tax_center_id: 1 },
        { name: "Officer DD", username: "officer_dd", email: "officer.dd@revenue.gov.et", role: "OFFICER", tax_center_id: 2 },
        { name: "Admin User", username: "admin", email: "admin@revenue.gov.et", role: "ADMIN", tax_center_id: 1 }
      ];

      const { supabase } = await import("../utils/supabase.js");

      for (const u of defaultUsers) {
        let uid = null;
        try {
          // Try to create in Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: u.email,
            password: 'password',
            email_confirm: true,
            user_metadata: { name: u.name, username: u.username }
          });

          if (!authError && authData.user) {
            uid = authData.user.id;
          } else if (authError?.message?.includes('already registered')) {
            // If already exists in auth, try to get the ID
            const { data: listData } = await supabase.auth.admin.listUsers();
            const existingUser = listData.users.find(au => au.email === u.email);
            if (existingUser) uid = existingUser.id;
          }
        } catch (err) {
          console.warn(`[DB] Failed to sync ${u.email} to Supabase Auth:`, err);
        }

        await client.query(
          "INSERT INTO users (name, username, email, password, role, tax_center_id, uid) VALUES ($1, $2, $3, $4, $5, $6, $7)", 
          [u.name, u.username, u.email, "password", u.role, u.tax_center_id, uid]
        );
      }
    } else {
      // Migration: Sync existing users who don't have a uid
      const { supabase } = await import("../utils/supabase.js");
      const usersToSync = await client.query("SELECT * FROM users WHERE uid IS NULL");
      
      for (const u of usersToSync.rows) {
        try {
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: u.email,
            password: u.password || 'password',
            email_confirm: true,
            user_metadata: { name: u.name, username: u.username }
          });

          if (!authError && authData.user) {
            await client.query("UPDATE users SET uid = $1 WHERE id = $2", [authData.user.id, u.id]);
            console.log(`[DB] Migrated user ${u.email} to Supabase Auth`);
          } else if (authError?.message?.includes('already registered')) {
            const { data: listData } = await supabase.auth.admin.listUsers();
            const existingUser = listData.users.find(au => au.email === u.email);
            if (existingUser) {
              await client.query("UPDATE users SET uid = $1 WHERE id = $2", [existingUser.id, u.id]);
              console.log(`[DB] Linked existing Supabase Auth user ${u.email} to local DB`);
            }
          }
        } catch (err) {
          console.warn(`[DB] Failed to migrate user ${u.email}:`, err);
        }
      }
    }
  } finally {
    client.release();
  }
};

// Start initialization
initDb().catch(err => {
  console.error('[DB] Initialization failed:', err);
});

// Helper to mimic better-sqlite3 prepare().get() and prepare().all() and prepare().run()
export const db = {
  prepare: (sql: string) => {
    let count = 0;
    const pgSql = sql.replace(/\?/g, () => {
      count++;
      return `$${count}`;
    });

    return {
      get: async (...params: any[]) => {
        const p = await getPool();
        const res = await p.query(pgSql, params);
        return res.rows[0];
      },
      all: async (...params: any[]) => {
        const p = await getPool();
        const res = await p.query(pgSql, params);
        return res.rows;
      },
      run: async (...params: any[]) => {
        const p = await getPool();
        let finalSql = pgSql;
        if (pgSql.trim().toUpperCase().startsWith('INSERT')) {
            finalSql += ' RETURNING *';
        }
        const res = await p.query(finalSql, params);
        const row = res.rows[0];
        let lastInsertRowid = null;
        if (row) {
          lastInsertRowid = row.id || row.COMPLAINTS_ID || row.COMPLAINANT_ID || Object.values(row)[0];
        }
        return { lastInsertRowid, changes: res.rowCount };
      }
    };
  },
  exec: async (sql: string) => {
    const p = await getPool();
    return await p.query(sql);
  },
  query: async (sql: string, params?: any[]) => {
    const p = await getPool();
    return await p.query(sql, params);
  }
};

export default db;
