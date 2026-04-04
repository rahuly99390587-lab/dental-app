import React from 'react';
import { SLOT_THRESHOLDS } from '../utils/constants';

export default function SlotPicker({ slots, selectedSlot, onSelect, loading }) {
  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <div style={styles.spinner} />
        <p style={styles.loadingText}>Loading available slots…</p>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={{ fontSize: '2rem' }}>📅</span>
        <p>No slots available. Please select a different date.</p>
      </div>
    );
  }

  // Split slots into morning and afternoon groups
  const morning   = slots.filter((s) => s.slot.includes('AM'));
  const afternoon = slots.filter((s) => s.slot.includes('PM'));

  return (
    <div style={styles.wrapper}>
      {[{ label: '🌤 Morning', items: morning }, { label: '☀️ Afternoon', items: afternoon }].map(
        ({ label, items }) =>
          items.length > 0 && (
            <div key={label} style={styles.group}>
              <div style={styles.groupLabel}>{label}</div>
              <div style={styles.grid}>
                {items.map((s) => {
                  const isSelected  = selectedSlot === s.slot;
                  const isFull      = s.isFull;
                  const almostFull  = !isFull && s.available <= SLOT_THRESHOLDS.ALMOST_FULL;

                  let cardStyle = { ...styles.card };
                  if (isFull)      cardStyle = { ...cardStyle, ...styles.cardFull };
                  else if (isSelected) cardStyle = { ...cardStyle, ...styles.cardSelected };
                  else if (almostFull) cardStyle = { ...cardStyle, ...styles.cardAlmostFull };

                  return (
                    <button
                      key={s.slot}
                      style={cardStyle}
                      onClick={() => !isFull && onSelect(s.slot)}
                      disabled={isFull}
                      title={isFull ? 'Slot fully booked' : `${s.available} spots remaining`}
                      aria-pressed={isSelected}
                      aria-disabled={isFull}
                    >
                      <span style={styles.slotTime}>{s.slot}</span>
                      <span style={isFull ? styles.badgeFull : isSelected ? styles.badgeSelected : almostFull ? styles.badgeWarning : styles.badgeAvail}>
                        {isFull
                          ? 'Full'
                          : almostFull
                          ? `${s.available} left!`
                          : `${s.available} free`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem',
  },
  groupLabel: {
    fontSize: '0.82rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#0f4c81',
    paddingLeft: '2px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: '0.55rem',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.3rem',
    padding: '0.7rem 0.5rem',
    border: '2px solid #d1dff0',
    borderRadius: '10px',
    background: '#f0f6ff',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    outline: 'none',
  },
  cardSelected: {
    border: '2px solid #0f4c81',
    background: 'linear-gradient(135deg, #0f4c81, #1a6eb5)',
    boxShadow: '0 4px 16px rgba(15,76,129,0.35)',
    transform: 'translateY(-2px)',
  },
  cardFull: {
    border: '2px solid #e0e0e0',
    background: '#f5f5f5',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  cardAlmostFull: {
    border: '2px solid #f59e0b',
    background: '#fffbeb',
  },
  slotTime: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'inherit',
  },
  badgeAvail: {
    fontSize: '0.68rem',
    color: '#16a34a',
    fontWeight: 600,
    background: '#dcfce7',
    borderRadius: '20px',
    padding: '1px 7px',
  },
  badgeSelected: {
    fontSize: '0.68rem',
    color: '#e0f0ff',
    fontWeight: 600,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '20px',
    padding: '1px 7px',
  },
  badgeFull: {
    fontSize: '0.68rem',
    color: '#ef4444',
    fontWeight: 600,
    background: '#fee2e2',
    borderRadius: '20px',
    padding: '1px 7px',
  },
  badgeWarning: {
    fontSize: '0.68rem',
    color: '#d97706',
    fontWeight: 600,
    background: '#fef3c7',
    borderRadius: '20px',
    padding: '1px 7px',
  },
  loadingWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '2rem',
    color: '#64748b',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e0e7ef',
    borderTop: '3px solid #0f4c81',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#94a3b8',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
};

// Inject spinner animation
if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(s);
}
