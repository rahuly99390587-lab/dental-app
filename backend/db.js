const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists (for Render persistent disk or local)
const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'dental.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    name     TEXT    NOT NULL,
    mobile   TEXT    NOT NULL,
    date     TEXT    NOT NULL,
    slot     TEXT    NOT NULL,
    token    INTEGER NOT NULL,
    problem  TEXT    DEFAULT '',
    created_at TEXT  DEFAULT (datetime('now','localtime'))
  );

  CREATE INDEX IF NOT EXISTS idx_patients_date  ON patients(date);
  CREATE INDEX IF NOT EXISTS idx_patients_mobile ON patients(mobile);
  CREATE INDEX IF NOT EXISTS idx_patients_slot   ON patients(date, slot);
`);

module.exports = db;
