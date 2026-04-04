const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { FIXED_SLOTS, MAX_PER_SLOT } = require('./bookingRoutes');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00');
  return !isNaN(d.getTime());
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

// ─── GET /api/patients/slots?date=YYYY-MM-DD ──────────────────────────────────
// NOTE: This MUST be defined BEFORE /:mobile so Express doesn't treat
//       "slots" as a mobile param.
router.get('/slots', (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: 'Query parameter "date" is required.',
    });
  }

  if (!isValidDate(date)) {
    return res.status(400).json({
      success: false,
      message: 'Date must be in YYYY-MM-DD format.',
    });
  }

  db.all(
    'SELECT slot, COUNT(*) AS booked FROM patients WHERE date = ? GROUP BY slot',
    [date],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: false,
          message: 'Database error',
        });
      }

      const bookedMap = {};
      rows.forEach((r) => {
        bookedMap[r.slot] = r.booked;
      });

      const slots = FIXED_SLOTS.map((slot) => {
        const booked = bookedMap[slot] || 0;
        const available = MAX_PER_SLOT - booked;
        return {
          slot,
          booked,
          available,
          isFull: booked >= MAX_PER_SLOT,
        };
      });

      return res.json({ success: true, date, slots });
    }
  );
});

// ─── GET /api/patients/today ──────────────────────────────────────────────────
router.get('/today', auth, (req, res) => {
  try {
    const today = getTodayISO();
    const patients = db
      .prepare(
        'SELECT * FROM patients WHERE date = ? ORDER BY token ASC'
      )
      .all(today);

    return res.json({ success: true, date: today, count: patients.length, data: patients });
  } catch (err) {
    console.error('[GET /api/patients/today] Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── GET /api/patients/stats ──────────────────────────────────────────────────
router.get('/stats', auth, (req, res) => {
  try {
    const today = getTodayISO();

    const totalAll = db.prepare('SELECT COUNT(*) AS c FROM patients').get().c;
    const totalToday = db.prepare('SELECT COUNT(*) AS c FROM patients WHERE date = ?').get(today).c;
    const totalSlots = FIXED_SLOTS.length * MAX_PER_SLOT;
    const slotsLeft = totalSlots - totalToday;

    // Most popular slot today
    const popularSlot = db
      .prepare(
        `SELECT slot, COUNT(*) AS cnt FROM patients
         WHERE date = ? GROUP BY slot ORDER BY cnt DESC LIMIT 1`
      )
      .get(today);

    // Recent bookings (last 5)
    const recent = db
      .prepare('SELECT * FROM patients ORDER BY id DESC LIMIT 5')
      .all();

    return res.json({
      success: true,
      data: {
        totalAll,
        totalToday,
        totalSlots,
        slotsLeft,
        popularSlot: popularSlot || null,
        recent,
      },
    });
  } catch (err) {
    console.error('[GET /api/patients/stats] Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── GET /api/patients ────────────────────────────────────────────────────────
router.get('/', auth, (req, res) => {
  try {
    const { date, search } = req.query;
    let query = 'SELECT * FROM patients WHERE 1=1';
    const params = [];

    if (date) {
      if (!isValidDate(date)) {
        return res.status(400).json({ success: false, message: 'Invalid date format. Use YYYY-MM-DD.' });
      }
      query += ' AND date = ?';
      params.push(date);
    }

    if (search) {
      query += ' AND (name LIKE ? OR mobile LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY date ASC, token ASC';

    const patients = db.prepare(query).all(...params);
    return res.json({ success: true, count: patients.length, data: patients });
  } catch (err) {
    console.error('[GET /api/patients] Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

// ─── DELETE /api/patients/:mobile ─────────────────────────────────────────────
router.delete('/:mobile', auth, (req, res) => {
  try {
    const { mobile } = req.params;

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Mobile must be 10 digits.' });
    }

    const info = db.prepare('DELETE FROM patients WHERE mobile = ?').run(mobile);

    if (info.changes === 0) {
      return res.status(404).json({ success: false, message: 'No patient found with that mobile number.' });
    }

    return res.json({ success: true, message: `Deleted ${info.changes} record(s) for mobile ${mobile}.` });
  } catch (err) {
    console.error('[DELETE /api/patients/:mobile] Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = router;
