const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { FIXED_SLOTS, MAX_PER_SLOT } = require('./bookingRoutes');

// ─── Helpers ─────────────────────────────────────────

function isValidDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00');
  return !isNaN(d.getTime());
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

// ─── SLOTS ───────────────────────────────────────────
router.get('/slots', (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ success: false, message: 'Date required' });
  }

  if (!isValidDate(date)) {
    return res.status(400).json({ success: false, message: 'Invalid date format' });
  }

  db.all(
    'SELECT slot, COUNT(*) AS booked FROM patients WHERE date = ? GROUP BY slot',
    [date],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'DB error' });
      }

      const map = {};
      rows.forEach(r => map[r.slot] = r.booked);

      const slots = FIXED_SLOTS.map(slot => ({
        slot,
        booked: map[slot] || 0,
        available: MAX_PER_SLOT - (map[slot] || 0),
        isFull: (map[slot] || 0) >= MAX_PER_SLOT
      }));

      res.json({ success: true, date, slots });
    }
  );
});

// ─── TODAY ───────────────────────────────────────────
router.get('/today', auth, (req, res) => {
  const today = getTodayISO();

  db.all(
    'SELECT * FROM patients WHERE date = ? ORDER BY token ASC',
    [today],
    (err, rows) => {
      if (err) return res.status(500).json({ success: false });

      res.json({
        success: true,
        date: today,
        count: rows.length,
        data: rows
      });
    }
  );
});

// ─── STATS ───────────────────────────────────────────
router.get('/stats', auth, (req, res) => {
  const today = getTodayISO();

  db.get('SELECT COUNT(*) AS c FROM patients', [], (err, totalAllRow) => {
    if (err) return res.status(500).json({ success: false });

    db.get(
      'SELECT COUNT(*) AS c FROM patients WHERE date = ?',
      [today],
      (err, totalTodayRow) => {
        if (err) return res.status(500).json({ success: false });

        db.get(
          `SELECT slot, COUNT(*) AS cnt FROM patients
           WHERE date = ? GROUP BY slot ORDER BY cnt DESC LIMIT 1`,
          [today],
          (err, popularSlot) => {
            if (err) return res.status(500).json({ success: false });

            db.all(
              'SELECT * FROM patients ORDER BY id DESC LIMIT 5',
              [],
              (err, recent) => {
                if (err) return res.status(500).json({ success: false });

                res.json({
                  success: true,
                  data: {
                    totalAll: totalAllRow.c,
                    totalToday: totalTodayRow.c,
                    totalSlots: FIXED_SLOTS.length * MAX_PER_SLOT,
                    slotsLeft: (FIXED_SLOTS.length * MAX_PER_SLOT) - totalTodayRow.c,
                    popularSlot: popularSlot || null,
                    recent
                  }
                });
              }
            );
          }
        );
      }
    );
  });
});

// ─── ALL PATIENTS ────────────────────────────────────
router.get('/', auth, (req, res) => {
  const { date, search } = req.query;

  let query = 'SELECT * FROM patients WHERE 1=1';
  const params = [];

  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }

  if (search) {
    query += ' AND (name LIKE ? OR mobile LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY date ASC, token ASC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ success: false });

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  });
});

// ─── DELETE ──────────────────────────────────────────
router.delete('/:mobile', auth, (req, res) => {
  const { mobile } = req.params;

  db.run(
    'DELETE FROM patients WHERE mobile = ?',
    [mobile],
    function (err) {
      if (err) return res.status(500).json({ success: false });

      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Not found' });
      }

      res.json({
        success: true,
        message: `Deleted ${this.changes} record(s)`
      });
    }
  );
});

module.exports = router;