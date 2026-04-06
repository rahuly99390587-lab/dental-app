import React, { useState, useEffect, useCallback } from 'react';
import { fetchPatients, fetchStats, fetchTodayPatients, deletePatient } from '../utils/api';
import { getTodayISO, formatDateShort } from '../utils/dateUtils';

const TABS = ['today', 'search', 'stats'];

export default function AdminPage() {
  const [activeTab, setActiveTab]       = useState('today');
  const [patients, setPatients]         = useState([]);
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');
  const [searchDate, setSearchDate]     = useState(getTodayISO());
  const [searchText, setSearchText]     = useState('');
  const [deleteTarget, setDeleteTarget] = useState('');
  const [deleteMsg, setDeleteMsg]       = useState('');

  // ── Load today's patients ────────────────────────────────────────────────
  const loadToday = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await fetchTodayPatients();
      setPatients(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load stats ────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await fetchStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Search patients ───────────────────────────────────────────────────────
  const handleSearch = async (e) => {
    e?.preventDefault();
    setLoading(true); setError('');
    try {
      const params = {};
      if (searchDate)  params.date   = searchDate;
      if (searchText)  params.search = searchText;
      const data = await fetchPatients(params);
      setPatients(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Delete patient ────────────────────────────────────────────────────────
  const handlePrint = (booking) => {
  const printWindow = window.open('', '_blank');

  printWindow.document.write(`
    <html>
      <head>
        <title>Patient Receipt</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
          }

          .receipt {
            border: 3px solid #0f4c81;
            padding: 25px;
            max-width: 750px;
            margin: auto;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }

          .clinic-info {
            text-align: left;
          }

          .clinic-name {
            font-size: 24px;
            font-weight: bold;
            color: #0f4c81;
          }

          .logo {
            width: 70px;
          }

          .token-box {
            text-align: center;
            background: #0f4c81;
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
          }

          .token-number {
            font-size: 42px;
            font-weight: bold;
          }

          .details {
            margin-top: 15px;
          }

          .row {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 16px;
          }

          .label {
            font-weight: bold;
          }

          .qr {
            text-align: center;
            margin-top: 20px;
          }

          .footer {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            font-size: 14px;
          }

          .signature {
            margin-top: 40px;
            text-align: right;
          }

          @media print {
            body {
              margin: 0;
            }
          }
        </style>
      </head>

      <body>
        <div class="receipt">

          <div class="header">
            <div class="clinic-info">
              <div class="clinic-name">${booking.clinicName || "Your Clinic Name"}</div>
              <div>${booking.address || "Clinic Address"}</div>
            </div>

            <!-- LOGO -->
            <img class="logo" src="https://via.placeholder.com/70" />
          </div>

          <!-- TOKEN -->
          <div class="token-box">
            <div>Your Token Number</div>
            <div class="token-number">${String(booking.token).padStart(3, '0')}</div>
          </div>

          <!-- DETAILS -->
          <div class="details">
            <div class="row"><span class="label">Patient Name:</span> <span>${booking.name}</span></div>
            <div class="row"><span class="label">Mobile:</span> <span>${booking.mobile}</span></div>
            <div class="row"><span class="label">Date:</span> <span>${booking.date}</span></div>
            <div class="row"><span class="label">Time:</span> <span>${booking.slot}</span></div>
            <div class="row"><span class="label">Problem:</span> <span>${booking.problem || "-"}</span></div>
            <div class="row"><span class="label">Doctor:</span> <span>Dr. Sharma</span></div>
            <div class="row"><span class="label">Fees:</span> <span>₹500</span></div>
          </div>

          <!-- QR CODE -->
          <div class="qr">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=Token-${booking.token}" />
          </div>

          <!-- FOOTER -->
          <div class="footer">
            <div>Please arrive 10 minutes early</div>
            <div>Thank you!</div>
          </div>

          <!-- SIGNATURE -->
          <div class="signature">
            ___________________<br/>
            Authorized Signature
          </div>

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

  // ── Tab change ────────────────────────────────────────────────────────────
  useEffect(() => {
    setError(''); setPatients([]); setStats(null);
    if (activeTab === 'today') loadToday();
    if (activeTab === 'stats') loadStats();
  }, [activeTab, loadToday, loadStats]);

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
  <h1 style={styles.title}>🏥 Admin Panel</h1>
  <p style={styles.subtitle}>Manage appointments and view clinic statistics</p>

  {/* 🔐 Logout Button */}
  <button
    onClick={() => {
      localStorage.removeItem("admin_key");
      window.location.reload();
    }}
    style={{
      marginTop: '10px',
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      background: '#dc2626',
      color: '#fff',
      cursor: 'pointer',
      fontWeight: '600'
    }}
  >
    Logout
  </button>
</div>
      <div style={styles.container}>
        {/* Tab bar */}
        <div style={styles.tabs}>
          {[
            { key: 'today',  label: "📋 Today's Patients" },
            { key: 'search', label: '🔍 Search / Filter' },
            { key: 'stats',  label: '📊 Statistics' },
          ].map(({ key, label }) => (
            <button
              key={key}
              style={{ ...styles.tab, ...(activeTab === key ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Messages */}
        {deleteMsg && <div style={styles.successMsg}>{deleteMsg}</div>}
        {error && <div style={styles.errorMsg}>⚠️ {error}</div>}

        {/* ── TODAY TAB ── */}
        {activeTab === 'today' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Today's Appointments — {formatDateShort(getTodayISO())}</h2>
              <button style={styles.refreshBtn} onClick={loadToday}>↻ Refresh</button>
            </div>
            <PatientTable patients={patients} loading={loading} onDelete={handleDelete} />
          </div>
        )}

        {/* ── SEARCH TAB ── */}
        {activeTab === 'search' && (
          <div>
            <form style={styles.searchForm} onSubmit={handleSearch}>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                style={styles.searchInput}
              />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search name or mobile…"
                style={styles.searchInput}
              />
              <button type="submit" style={styles.searchBtn}>Search</button>
            </form>
            <PatientTable patients={patients} loading={loading} onDelete={handleDelete} />
          </div>
        )}

        {/* ── STATS TAB ── */}
        {activeTab === 'stats' && (
          <div>
            {loading ? (
              <Loader />
            ) : stats ? (
              <div>
                <div style={styles.statsGrid}>
                  {[
                    { icon: '📅', label: 'All-Time Bookings', value: stats.totalAll },
                    { icon: '🗓',  label: "Today's Bookings",  value: stats.totalToday },
                    { icon: '🪑', label: 'Slots Remaining Today', value: stats.slotsLeft },
                    {
                      icon: '🏆',
                      label: "Today's Popular Slot",
                      value: stats.popularSlot ? `${stats.popularSlot.slot} (${stats.popularSlot.cnt})` : '—',
                    },
                  ].map(({ icon, label, value }) => (
                    <div key={label} style={styles.statCard}>
                      <div style={styles.statIcon}>{icon}</div>
                      <div style={styles.statValue}>{value}</div>
                      <div style={styles.statLabel}>{label}</div>
                    </div>
                  ))}
                </div>

                {stats.recent?.length > 0 && (
                  <>
                    <h3 style={{ ...styles.sectionTitle, marginTop: '1.5rem' }}>Recent Bookings</h3>
                    <PatientTable patients={stats.recent} loading={false} onDelete={handleDelete} />
                  </>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Loader() {
  return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
      Loading…
    </div>
  );
}

function PatientTable({ patients, loading, onDelete }) {
  if (loading) return <Loader />;

  if (!patients || patients.length === 0) {
    return (
      <div style={styles.emptyState}>
        <span style={{ fontSize: '2.5rem' }}>📭</span>
        <p>No appointments found.</p>
      </div>
    );
  }

  return (
    <div style={styles.tableWrap}>
      <table style={styles.table}>
        <thead>
          <tr>
            {['Token', 'Name', 'Mobile', 'Date', 'Slot', 'Problem', 'Action'].map((h) => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {patients.map((p, i) => (
            <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
              <td style={{ ...styles.td, ...styles.tokenCell }}>
                <span style={styles.tokenBadge}>{String(p.token).padStart(3, '0')}</span>
              </td>
              <td style={styles.td}>{p.name}</td>
              <td style={styles.td}>{p.mobile}</td>
              <td style={styles.td}>{formatDateShort(p.date)}</td>
              <td style={styles.td}>{p.slot}</td>
              <td style={{ ...styles.td, maxWidth: '160px' }}>
                <span style={styles.problemText}>{p.problem || '—'}</span>
              </td>
              <td style={styles.td}>

  {/* 🧾 PRINT BUTTON */}
  <button
    style={styles.printBtn}
    onClick={() => handlePrint(p)}
  >
    🧾 Print
  </button>

  {/* ❌ DELETE */}
  <button
    style={styles.deleteBtn}
    onClick={() => onDelete(p.mobile)}
  >
    🗑 Delete
  </button>

</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: 'calc(100vh - 70px)',
    background: 'linear-gradient(160deg, #f0f4ff 0%, #f8fafc 100%)',
  },
  header: {
    background: 'linear-gradient(135deg, #1e3a5f, #0f4c81)',
    padding: '2.5rem 2rem',
    textAlign: 'center',
  },
  title: {
    color: '#fff',
    fontFamily: "'Georgia', serif",
    fontSize: 'clamp(1.4rem, 3vw, 2rem)',
    fontWeight: 800,
    margin: '0 0 0.4rem',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: '0.9rem',
    margin: 0,
  },
  container: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '1.5rem 1.25rem 3rem',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  tab: {
    background: '#fff',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: 600,
    padding: '0.55rem 1.1rem',
    transition: 'all 0.18s',
  },
  tabActive: {
    background: '#0f4c81',
    borderColor: '#0f4c81',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(15,76,129,0.3)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  sectionTitle: {
    color: '#0f4c81',
    fontFamily: "'Georgia', serif",
    fontSize: '1.1rem',
    fontWeight: 700,
    margin: 0,
  },
  refreshBtn: {
    background: '#e0edfb',
    border: '1.5px solid #b8d4f0',
    borderRadius: '8px',
    color: '#0f4c81',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    padding: '0.4rem 0.9rem',
  },
  searchForm: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
  },
  searchInput: {
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.9rem',
    flex: 1,
    minWidth: '160px',
    outline: 'none',
    padding: '0.6rem 0.85rem',
    color: '#1e293b',
  },
  searchBtn: {
    background: 'linear-gradient(135deg, #0f4c81, #1a6eb5)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 700,
    padding: '0.6rem 1.4rem',
  },
  tableWrap: {
    overflowX: 'auto',
    borderRadius: '12px',
    boxShadow: '0 2px 16px rgba(15,76,129,0.08)',
    border: '1px solid #e2e8f0',
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    fontSize: '0.88rem',
  },
  th: {
    background: 'linear-gradient(135deg, #0f4c81, #1a6eb5)',
    color: '#fff',
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    padding: '0.75rem 0.9rem',
    textAlign: 'left',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  td: {
    borderBottom: '1px solid #f1f5f9',
    color: '#1e293b',
    padding: '0.65rem 0.9rem',
    verticalAlign: 'middle',
  },
  tokenCell: {
    textAlign: 'center',
  },
  tokenBadge: {
    background: 'linear-gradient(135deg, #0f4c81, #1a6eb5)',
    borderRadius: '8px',
    color: '#fff',
    display: 'inline-block',
    fontSize: '0.88rem',
    fontWeight: 700,
    minWidth: '44px',
    padding: '3px 8px',
    textAlign: 'center',
  },
  problemText: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    fontSize: '0.82rem',
    color: '#64748b',
  },
  deleteBtn: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '0.78rem',
    fontWeight: 600,
    padding: '0.3rem 0.6rem',
    whiteSpace: 'nowrap',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  statCard: {
    background: '#fff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '14px',
    boxShadow: '0 2px 12px rgba(15,76,129,0.07)',
    padding: '1.5rem',
    textAlign: 'center',
  },
  statIcon: {
    fontSize: '2rem',
    marginBottom: '0.6rem',
  },
  statValue: {
    color: '#0f4c81',
    fontSize: '1.75rem',
    fontWeight: 800,
    fontFamily: "'Georgia', serif",
    marginBottom: '0.3rem',
  },
  statLabel: {
    color: '#64748b',
    fontSize: '0.82rem',
    fontWeight: 500,
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  successMsg: {
    background: '#dcfce7',
    border: '1.5px solid #86efac',
    borderRadius: '10px',
    color: '#16a34a',
    fontSize: '0.9rem',
    fontWeight: 600,
    marginBottom: '1rem',
    padding: '0.75rem 1rem',
  },
  errorMsg: {
    background: '#fff8f8',
    border: '1.5px solid #fca5a5',
    borderRadius: '10px',
    color: '#dc2626',
    fontSize: '0.88rem',
    marginBottom: '1rem',
    padding: '0.75rem 1rem',
  },
};
