import React, { useState } from 'react';
import { CLINIC_INFO } from '../utils/constants';

export default function Navbar({ activePage, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <span style={styles.logo}>🦷</span>
        <div>
          <div style={styles.clinicName}>{CLINIC_INFO.name}</div>
          <div style={styles.tagline}>{CLINIC_INFO.tagline}</div>
        </div>
      </div>

      {/* Desktop nav */}
      <div style={styles.links}>
        <button
          style={{
            ...styles.link,
            ...(activePage === 'booking' ? styles.activeLink : {}),
          }}
          onClick={() => onNavigate('booking')}
        >
          Book Appointment
        </button>
        <button
          style={{
            ...styles.link,
            ...(activePage === 'admin' ? styles.activeLink : {}),
          }}
          onClick={() => onNavigate('admin')}
        >
          Admin Panel
        </button>
      </div>

      {/* Mobile hamburger */}
      <button
        style={styles.hamburger}
        onClick={() => setMenuOpen((p) => !p)}
        aria-label="Toggle menu"
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <button
            style={styles.mobileLink}
            onClick={() => { onNavigate('booking'); setMenuOpen(false); }}
          >
            Book Appointment
          </button>
          <button
            style={styles.mobileLink}
            onClick={() => { onNavigate('admin'); setMenuOpen(false); }}
          >
            Admin Panel
          </button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    height: '70px',
    background: 'linear-gradient(135deg, #0f4c81 0%, #1a6eb5 100%)',
    boxShadow: '0 2px 20px rgba(15,76,129,0.4)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'default',
  },
  logo: {
    fontSize: '2rem',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
  },
  clinicName: {
    color: '#ffffff',
    fontFamily: "'Georgia', serif",
    fontSize: '1.15rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  tagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.72rem',
    fontStyle: 'italic',
    letterSpacing: '0.05em',
  },
  links: {
    display: 'flex',
    gap: '0.5rem',
  },
  link: {
    background: 'transparent',
    border: '1.5px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.85)',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: 500,
    letterSpacing: '0.03em',
    padding: '0.45rem 1.1rem',
    transition: 'all 0.2s ease',
  },
  activeLink: {
    background: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.7)',
    color: '#ffffff',
    boxShadow: '0 0 12px rgba(255,255,255,0.15)',
  },
  hamburger: {
    display: 'none',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  mobileMenu: {
    display: 'none',
    flexDirection: 'column',
    width: '100%',
    padding: '0.5rem 0 1rem',
    gap: '0.5rem',
  },
  mobileLink: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.95rem',
    padding: '0.7rem 1rem',
    textAlign: 'left',
    width: '100%',
  },
};

// Inject responsive styles
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @media (max-width: 600px) {
      nav > div:nth-child(2) { display: none !important; }
      nav > button:last-of-type { display: block !important; }
      nav > div:last-child { display: flex !important; }
    }
  `;
  document.head.appendChild(styleTag);
}
