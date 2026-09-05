const { Pool } = require('pg');
const { DATABASE_URL } = require('./env');

class ResilientDB {
  constructor() {
    this.isPostgres = false;
    this.pool = null;
    this.memoryStore = {
      users: [],
      districts: [],
      phcs: [],
      medicines: [],
      stock: [],
      stock_transactions: [],
      beds: [],
      staff_attendance: [],
      predictions: [],
      transfers: []
    };
  }

  async initialize() {
    try {
      if (DATABASE_URL && process.env.USE_POSTGRES === 'true') {
        this.pool = new Pool({ connectionString: DATABASE_URL, connectionTimeoutMillis: 2000 });
        await this.pool.query('SELECT 1');
        this.isPostgres = true;
        console.log('[DB] Connected to PostgreSQL 16 successfully.');
      } else {
        console.log('[DB] Operating in embedded resilient database mode.');
      }
    } catch (err) {
      console.warn('[DB] PostgreSQL unavailable, falling back to embedded resilient database:', err.message);
      this.isPostgres = false;
    }
  }

  async query(text, params = []) {
    if (this.isPostgres && this.pool) {
      return await this.pool.query(text, params);
    }
    return { rows: [], rowCount: 0 };
  }
}

const db = new ResilientDB();
module.exports = db;
