const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'dental.db');

// Connect DB
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("DB Error:", err.message);
  } else {
    console.log("Connected to SQLite");
  }
});

// Create tables (IMPORTANT: serialize)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      name     TEXT    NOT NULL,
      mobile   TEXT    NOT NULL,
      date     TEXT    NOT NULL,
      slot     TEXT    NOT NULL,
      token    INTEGER NOT NULL,
      problem  TEXT    DEFAULT '',
      created_at TEXT  DEFAULT (datetime('now','localtime'))
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_patients_date ON patients(date)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_patients_mobile ON patients(mobile)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_patients_slot ON patients(date, slot)`);
});

module.exports = db;