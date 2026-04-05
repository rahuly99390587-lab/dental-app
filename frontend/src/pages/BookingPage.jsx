import React, { useState, useEffect, useCallback } from 'react';
import SlotPicker from '../components/SlotPicker';
import ReceiptModal from '../components/ReceiptModal';
import { fetchSlots, createBooking } from '../utils/api';
import { getTodayISO, formatDateLong, getGreeting } from '../utils/dateUtils';
import { PROBLEM_CATEGORIES, CLINIC_INFO } from '../utils/constants';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
const INITIAL_FORM = {
  name: '',
  mobile: '',
  date: getTodayISO(),
  slot: '',
  problem: '',
};

export default function BookingPage() {
  const [form, setForm]           = useState(INITIAL_FORM);
  const [slots, setSlots]         = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError]     = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState('');
  const [booking, setBooking]           = useState(null); // successful booking data
  const [fieldErrors, setFieldErrors]   = useState({});

 const downloadPDF = async () => {
  const element = document.getElementById("booking-card");
  if (!element) return alert("Booking card not found");

  // 🔥 overlay hide
  const modal = document.querySelector('[style*="rgba"]');
  if (modal) modal.style.display = "none";

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  // 🔥 overlay restore
  if (modal) modal.style.display = "flex";

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save("appointment.pdf");
};

  // ── Load slots whenever the date changes ──────────────────────────────────
  const loadSlots = useCallback(async (date) => {
    if (!date) return;
    setSlotsLoading(true);
    setSlotsError('');
    setSlots([]);
    try {
      const data = await fetchSlots(date);
      setSlots(data);
    } catch (err) {
      setSlotsError(err.message || 'Failed to load slots. Please try again.');
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlots(form.date);
  }, [form.date, loadSlots]);

  // ── Field change handler ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (name === 'slot') setSubmitError('');
  };

  // ── Client-side validation ────────────────────────────────────────────────
  const validate = () => {
    const errors = {};
    if (!form.name.trim())             errors.name   = 'Full name is required.';
    if (!form.mobile.trim())           errors.mobile = 'Mobile number is required.';
    else if (!/^\d{10}$/.test(form.mobile)) errors.mobile = 'Must be exactly 10 digits.';
    if (!form.slot)                    errors.slot   = 'Please select a time slot.';
    return errors;
  };

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const response = await createBooking({
        name:    form.name.trim(),
        mobile:  form.mobile.trim(),
        date:    form.date,
        slot:    form.slot,
        problem: form.problem.trim(),
      });
      setBooking(response.data);
    } catch (err) {
      setSubmitError(err.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset for new booking ─────────────────────────────────────────────────
  const handleNewBooking = () => {
    setBooking(null);
    setForm({ ...INITIAL_FORM, date: getTodayISO() });
    setFieldErrors({});
    setSubmitError('');
  };

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <p style={styles.greeting}>{getGreeting()} 👋</p>
          <h1 style={styles.heroTitle}>Book Your Dental Appointment</h1>
          <p style={styles.heroSub}>
            Schedule at <strong>{CLINIC_INFO.name}</strong> — fast, easy, and hassle-free.
          </p>
          <div style={styles.heroBadge}>
            📍 {CLINIC_INFO.address} &nbsp;|&nbsp; 🕒 {CLINIC_INFO.hours}
          </div>
        </div>
      </div>

      {/* Form card */}
      <div style={styles.container}>
        <form style={styles.card} onSubmit={handleSubmit} noValidate>
          <h2 style={styles.cardTitle}>Patient Details</h2>

          {/* Name */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="name">Full Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              style={{ ...styles.input, ...(fieldErrors.name ? styles.inputError : {}) }}
              autoComplete="name"
            />
            {fieldErrors.name && <span style={styles.errMsg}>{fieldErrors.name}</span>}
          </div>

          {/* Mobile */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="mobile">Mobile Number *</label>
            <div style={styles.phoneWrap}>
              <span style={styles.phonePrefix}>+91</span>
              <input
                id="mobile"
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                placeholder="10-digit number"
                maxLength={10}
                style={{ ...styles.input, ...styles.phoneInput, ...(fieldErrors.mobile ? styles.inputError : {}) }}
                autoComplete="tel"
                inputMode="numeric"
              />
            </div>
            {fieldErrors.mobile && <span style={styles.errMsg}>{fieldErrors.mobile}</span>}
          </div>

          {/* Date (locked to today) */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Appointment Date
              <span style={styles.lockedBadge}>Today</span>
            </label>
            <input
              type="text"
              value={formatDateLong(form.date)}
              readOnly
              style={{ ...styles.input, ...styles.inputReadonly }}
            />
          </div>

          {/* Problem */}
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="problem">Concern / Problem</label>
            <select
              id="problem"
              name="problem"
              value={form.problem}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">— Select a concern —</option>
              {PROBLEM_CATEGORIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Slot picker */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              Select Time Slot *
              {form.slot && (
                <span style={styles.selectedBadge}>✓ {form.slot}</span>
              )}
            </label>
            {slotsError ? (
              <div style={styles.slotError}>
                <span>⚠️ {slotsError}</span>
                <button type="button" style={styles.retryBtn} onClick={() => loadSlots(form.date)}>
                  Retry
                </button>
              </div>
            ) : (
              <SlotPicker
                slots={slots}
                selectedSlot={form.slot}
                onSelect={(slot) => {
                  setForm((prev) => ({ ...prev, slot }));
                  setFieldErrors((prev) => ({ ...prev, slot: '' }));
                }}
                loading={slotsLoading}
              />
            )}
            {fieldErrors.slot && <span style={styles.errMsg}>{fieldErrors.slot}</span>}
          </div>

          {/* Submit error */}
          {submitError && (
            <div style={styles.submitError}>
              <span>❌ {submitError}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              ...(submitting ? styles.submitBtnDisabled : {}),
            }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span style={styles.btnSpinner} />
                Booking…
              </>
            ) : (
              '🦷 Confirm Appointment'
            )}
          </button>
        </form>
      </div>

      {/* Success modal */}
      {booking && (
        <ReceiptModal
          booking={booking}
          onClose={handleNewBooking}
          onNewBooking={handleNewBooking}
        />
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 70px)',
    background: 'linear-gradient(160deg, #e8f1fb 0%, #f0f9ff 50%, #e8f8f5 100%)',
  },
  hero: {
    background: 'linear-gradient(135deg, #0f4c81 0%, #1a6eb5 60%, #0ea5e9 100%)',
    padding: '3rem 2rem 4rem',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: '680px',
    margin: '0 auto',
  },
  greeting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: '1rem',
    margin: '0 0 0.5rem',
    fontStyle: 'italic',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
    fontFamily: "'Georgia', serif",
    fontWeight: 800,
    margin: '0 0 0.75rem',
    textShadow: '0 2px 12px rgba(0,0,0,0.2)',
  },
  heroSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: '1rem',
    margin: '0 0 1rem',
  },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '30px',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '0.82rem',
    padding: '0.4rem 1.2rem',
    backdropFilter: 'blur(4px)',
  },
  container: {
    maxWidth: '620px',
    margin: '-2rem auto 3rem',
    padding: '0 1.25rem',
  },
  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 8px 40px rgba(15,76,129,0.12)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#0f4c81',
    fontFamily: "'Georgia', serif",
    borderBottom: '2px solid #e2edf8',
    paddingBottom: '0.75rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.45rem',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.88rem',
    fontWeight: 700,
    color: '#334155',
    letterSpacing: '0.02em',
  },
  lockedBadge: {
    fontSize: '0.72rem',
    background: '#dcfce7',
    color: '#16a34a',
    borderRadius: '20px',
    padding: '1px 8px',
    fontWeight: 600,
  },
  selectedBadge: {
    fontSize: '0.72rem',
    background: '#dbeafe',
    color: '#1d4ed8',
    borderRadius: '20px',
    padding: '1px 8px',
    fontWeight: 600,
  },
  input: {
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    outline: 'none',
    padding: '0.7rem 0.9rem',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    width: '100%',
    boxSizing: 'border-box',
    color: '#1e293b',
    background: '#fafcff',
  },
  inputError: {
    borderColor: '#ef4444',
    background: '#fff8f8',
  },
  inputReadonly: {
    background: '#f1f5f9',
    color: '#64748b',
    cursor: 'default',
    borderColor: '#e2e8f0',
  },
  phoneWrap: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    overflow: 'hidden',
    background: '#fafcff',
  },
  phonePrefix: {
    background: '#f1f5f9',
    borderRight: '2px solid #e2e8f0',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: 600,
    padding: '0.7rem 0.8rem',
    whiteSpace: 'nowrap',
  },
  phoneInput: {
    border: 'none',
    borderRadius: 0,
    flex: 1,
  },
  select: {
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    outline: 'none',
    padding: '0.7rem 0.9rem',
    width: '100%',
    boxSizing: 'border-box',
    color: '#1e293b',
    background: '#fafcff',
    cursor: 'pointer',
  },
  errMsg: {
    color: '#ef4444',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  slotError: {
    background: '#fff8f8',
    border: '1.5px solid #fca5a5',
    borderRadius: '10px',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.88rem',
    padding: '0.75rem 1rem',
  },
  retryBtn: {
    background: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600,
    padding: '0.3rem 0.75rem',
  },
  submitError: {
    background: '#fff8f8',
    border: '1.5px solid #fca5a5',
    borderRadius: '10px',
    color: '#dc2626',
    fontSize: '0.88rem',
    padding: '0.75rem 1rem',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #0f4c81, #1a6eb5)',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(15,76,129,0.35)',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    marginTop: '0.5rem',
    padding: '1rem',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    width: '100%',
  },
  submitBtnDisabled: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  btnSpinner: {
    width: '18px',
    height: '18px',
    border: '2.5px solid rgba(255,255,255,0.4)',
    borderTop: '2.5px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
};
