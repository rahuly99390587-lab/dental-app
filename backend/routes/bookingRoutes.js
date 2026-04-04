const express = require('express');
const router = express.Router();
const db = require('../db');

// ─── Constants ───────────────────────────────────────────────────────────────
const FIXED_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
];
const MAX_PER_SLOT = 30;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Validate that a string is in YYYY-MM-DD format and is a real date.
 */
function isValidDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr + 'T00:00:00');
  return !isNaN(d.getTime());
}

/**
 * Validate 10-digit mobile number (digits only).
 */
function isValidMobile(mobile) {
  return /^\d{10}$/.test(mobile);
}

// ─── POST /api/booking ────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const { name, mobile, date, slot, problem = '' } = req.body;

    // ── Validate required fields ──
    const missing = [];
    if (!name)   missing.push('name');
    if (!mobile) missing.push('mobile');
    if (!date)   missing.push('date');
    if (!slot)   missing.push('slot');

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`,
      });
    }

    // ── Validate mobile ──
    if (!isValidMobile(mobile)) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number must be exactly 10 digits.',
      });
    }

    // ── Validate date format ──
    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Date must be in YYYY-MM-DD format.',
      });
    }

    // ── Validate slot ──
    if (!FIXED_SLOTS.includes(slot)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slot selected.',
      });
    }

    // ── Check for duplicate booking (same mobile + date) ──
    const existing = db
      .prepare('SELECT id FROM patients WHERE mobile = ? AND date = ?')
      .get(mobile, date);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A booking for this mobile number already exists for the selected date.',
      });
    }

    // ── Check slot capacity ──
    const { count } = db
      .prepare('SELECT COUNT(*) AS count FROM patients WHERE date = ? AND slot = ?')
      .get(date, slot);

    if (count >= MAX_PER_SLOT) {
      return res.status(409).json({
        success: false,
        message: 'Selected slot is fully booked. Please choose another slot.',
      });
    }

    // ── Assign token (sequential per date) ──
    const { maxToken } = db
      .prepare('SELECT COALESCE(MAX(token), 0) AS maxToken FROM patients WHERE date = ?')
      .get(date);
    const token = maxToken + 1;

    // ── Insert booking ──
    const stmt = db.prepare(
      'INSERT INTO patients (name, mobile, date, slot, token, problem) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const info = stmt.run(
      name.trim(),
      mobile.trim(),
      date,
      slot,
      token,
      problem.trim()
    );

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: {
        id: info.lastInsertRowid,
        name: name.trim(),
        mobile: mobile.trim(),
        date,
        slot,
        token,
        problem: problem.trim(),
      },
    });
  } catch (err) {
    console.error('[POST /api/booking] Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again.',
    });
  }
});

// ─── DELETE /api/booking/:id ──────────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const info = db.prepare('DELETE FROM patients WHERE id = ?').run(id);

    if (info.changes === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    return res.json({ success: true, message: 'Booking cancelled successfully.' });
  } catch (err) {
    console.error('[DELETE /api/booking/:id] Error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
});

module.exports = { router, FIXED_SLOTS, MAX_PER_SLOT };
