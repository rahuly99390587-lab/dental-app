const express = require('express');
const router = express.Router();
const db = require('../db');

const FIXED_SLOTS = [
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM',
  '11:00 AM','11:30 AM','12:00 PM','12:30 PM',
  '02:00 PM','02:30 PM','03:00 PM','03:30 PM',
  '04:00 PM','04:30 PM','05:00 PM','05:30 PM',
];

const MAX_PER_SLOT = 30;

// Helpers
function isValidDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00');
  return !isNaN(d.getTime());
}

function isValidMobile(mobile) {
  return /^\d{10}$/.test(mobile);
}

// ─── POST BOOKING ─────────────────────────
router.post('/', (req, res) => {
  const { name, mobile, date, slot, problem = '' } = req.body;

  // validation
  if (!name || !mobile || !date || !slot) {
    return res.status(400).json({ success: false, message: 'Missing fields' });
  }

  if (!isValidMobile(mobile)) {
    return res.status(400).json({ success: false, message: 'Invalid mobile' });
  }

  if (!isValidDate(date)) {
    return res.status(400).json({ success: false, message: 'Invalid date' });
  }

  if (!FIXED_SLOTS.includes(slot)) {
    return res.status(400).json({ success: false, message: 'Invalid slot' });
  }

  // Step 1: duplicate check
  db.get(
    'SELECT id FROM patients WHERE mobile = ? AND date = ?',
    [mobile, date],
    (err, existing) => {
      if (err) return res.status(500).json({ error: err.message });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Booking already exists for this date',
        });
      }

      // Step 2: slot count
      db.get(
        'SELECT COUNT(*) AS count FROM patients WHERE date = ? AND slot = ?',
        [date, slot],
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });

          if (row.count >= MAX_PER_SLOT) {
            return res.status(409).json({
              success: false,
              message: 'Slot full',
            });
          }

          // Step 3: token
          db.get(
            'SELECT COALESCE(MAX(token), 0) AS maxToken FROM patients WHERE date = ?',
            [date],
            (err, row2) => {
              if (err) return res.status(500).json({ error: err.message });

              const token = row2.maxToken + 1;

              // Step 4: insert
              db.run(
                `INSERT INTO patients (name, mobile, date, slot, token, problem)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [name, mobile, date, slot, token, problem],
                function (err) {
                  if (err) return res.status(500).json({ error: err.message });

                  return res.status(201).json({
                    success: true,
                    message: 'Booking successful',
                    data: {
                      id: this.lastID,
                      name,
                      mobile,
                      date,
                      slot,
                      token,
                      problem,
                    },
                  });
                }
              );
            }
          );
        }
      );
    }
  );
});

// ─── DELETE ─────────────────────────
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM patients WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }

    return res.json({ success: true, message: 'Deleted successfully' });
  });
});

module.exports = router;