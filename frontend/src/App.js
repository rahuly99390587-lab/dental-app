import React, { useState } from 'react';
import Navbar from './components/Navbar';
import BookingPage from './pages/BookingPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  const [page, setPage] = useState('booking');

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}>
      <Navbar activePage={page} onNavigate={setPage} />
      {page === 'booking' ? <BookingPage /> : <AdminPage />}
    </div>
  );
}
