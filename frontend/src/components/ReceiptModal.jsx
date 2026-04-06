import React, { useEffect, useRef } from 'react';
import { formatDateLong } from '../utils/dateUtils';
import { CLINIC_INFO } from '../utils/constants';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
// import { fontWeight } from 'html2canvas/dist/types/css/property-descriptors/font-weight';

export default function ReceiptModal({ booking, onClose, onNewBooking }) {
  const dialogRef = useRef(null);

  // Focus trap
  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!booking) return null;
  const downloadPDF = () => {
  const printWindow = window.open('', '_blank');

  printWindow.document.write(`
    <html>
      <head>
        <title>Appointment Receipt</title>
        <style>
          body {
            font-family: Arial;
            padding: 30px;
          }

          .box {
            border: 3px solid #0f4c81;
            padding: 25px;
            max-width: 700px;
            margin: auto;
          }

          h2 {
            text-align: center;
            color: #0f4c81;
          }

          .token {
            background: #0f4c81;
            color: #fff;
            text-align: center;
            padding: 15px;
            border-radius: 10px;
            font-size: 30px;
            font-weight: bold;
            margin: 20px 0;
          }

          .row {
            margin: 10px 0;
            font-size: 16px;
          }
        </style>
      </head>

      <body>
        <div class="box">
          <h2>Appointment Confirmed</h2>

          <div class="token">
            Token: ${String(booking.token).padStart(3, '0')}
          </div>

          <div class="row"><b>Name:</b> ${booking.name}</div>
          <div class="row"><b>Mobile:</b> ${booking.mobile}</div>
          <div class="row"><b>Date:</b> ${booking.date}</div>
          <div class="row"><b>Time:</b> ${booking.slot}</div>
          <div class="row"><b>Problem:</b> ${booking.problem || "-"}</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        id="booking-card"
        style={{
  ...styles.modal,
  background: "#ffffff",
  boxShadow: "none",
}}
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Booking Confirmation"
      >
        {/* Success header */}
        <div style={styles.header}>
          <div style={styles.checkCircle}>✓</div>
          <h2 style={styles.title}>Booking Confirmed!</h2>
          <p style={styles.subtitle}>Your appointment has been successfully scheduled.</p>
        </div>

        {/* Token highlight */}
        <div style={styles.tokenBox}>
          <div style={styles.tokenLabel}>Your Token Number</div>
          <div style={styles.tokenNumber}>{String(booking.token).padStart(3, '0')}</div>
          <div style={styles.tokenHint}>Please arrive 10 minutes before your slot.</div>
        </div>

        {/* Booking details */}
        <div style={styles.details}>
          {[
            { icon: '👤', label: 'Patient',  value: booking.name },
            { icon: '📱', label: 'Mobile',   value: booking.mobile },
            { icon: '📅', label: 'Date',     value: formatDateLong(booking.date) },
            { icon: '🕐', label: 'Slot',     value: booking.slot },
            { icon: '🏥', label: 'Clinic',   value: CLINIC_INFO.name },
            ...(booking.problem ? [{ icon: '📋', label: 'Problem', value: booking.problem }] : []),
          ].map(({ icon, label, value }) => (
            <div key={label} style={styles.row}>
              <span style={styles.rowIcon}>{icon}</span>
              <span style={styles.rowLabel}>{label}</span>
              <span style={styles.rowValue}>{value}</span>
            </div>
          ))}
        </div>

        {/* Clinic info footer */}
        <div style={styles.clinicBox}>
          <div style={styles.clinicLine}>📍 {CLINIC_INFO.address}</div>
          <div style={styles.clinicLine}>📞 {CLINIC_INFO.phone}</div>
          <div style={styles.clinicLine}>🕒 {CLINIC_INFO.hours}</div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button style={styles.btnPrimary} onClick={onNewBooking}>
            Book Another Appointment
          </button>
          <button style={styles.btnSecondary} onClick={onClose}>
            Close
          </button>
          <button
  style={styles.btnSecondary}
  onClick={() => downloadPDF(booking)}
>
  📃 Download PDF
</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10, 30, 60, 0.65)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
    animation: 'fadeIn 0.2s ease',
  },
  modal: {
    background: '#fff',
    borderRadius: '20px',
    padding: '2rem',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 24px 80px rgba(15,76,129,0.3)',
    outline: 'none',
    maxHeight: '90vh',
    overflowY: 'auto',
    animation: 'slideUp 0.3s ease',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  checkCircle: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #16a34a, #22c55e)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    color: '#fff',
    margin: '0 auto 1rem',
    boxShadow: '0 8px 24px rgba(22,163,74,0.35)',
  },
  title: {
    margin: '0 0 0.5rem',
    fontSize: '1.5rem',
    fontWeight: 800,
    color: '#0f4c81',
    fontFamily: "'Georgia', serif",
  },
  subtitle: {
    margin: 0,
    color: '#000',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
 tokenBox: {
  background: 'linear-gradient(135deg, #0f4c81, #1a6eb5)',
    borderRadius: '14px',
    padding: '1.5rem',
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#fff',
  },
  tokenLabel: {
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    opacity: 0.8,
    marginBottom: '0.5rem',
  },
  tokenNumber: {
    fontSize: '3.5rem',
    fontWeight: 900,
    fontFamily: "'Georgia', serif",
    lineHeight: 1,
    textShadow: '0 2px 8px rgba(0,0,0,0.25)',
    marginBottom: '0.5rem',
  },
  tokenHint: {
    fontSize: '0.78rem',
    opacity: 0.75,
    fontStyle: 'italic',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    marginBottom: '1.25rem',
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '1rem',
  },
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.6rem',
    fontSize: '0.9rem',
  },
  rowIcon: {
    minWidth: '20px',
    fontSize: '1rem',
  },
  rowLabel: {
    color: '#64748b',
    minWidth: '70px',
    fontWeight: 600,
    fontSize: '0.82rem',
  },
  rowValue: {
    color: '#000',
    fontWeight: 600,
    flex: 1,
  },
  clinicBox: {
    background: '#f0f6ff',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  clinicLine: {
    fontSize: '0.82rem',
    color: '#475569',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    flexDirection: 'column',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #0f4c81, #1a6eb5)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 700,
    padding: '0.85rem',
    width: '100%',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    letterSpacing: '0.03em',
  },
  btnSecondary: {
    background: 'transparent',
    border: '1.5px solid #cbd5e1',
    borderRadius: '10px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    padding: '0.75rem',
    width: '100%',
    transition: 'background 0.15s ease',
  },
};

// Modal animations
if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
    @keyframes slideUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
  `;
  document.head.appendChild(s);
}
