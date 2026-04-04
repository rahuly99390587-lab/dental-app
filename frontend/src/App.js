import React, { useState } from 'react';
import Navbar from './components/Navbar';
import BookingPage from './pages/BookingPage';
import AdminPage from './pages/AdminPage';
import AdminLogin from './pages/AdminLogin'; // 👈 add this

export default function App() {
  const [page, setPage] = useState('booking');

  // 🔐 check login
  const isLoggedIn = localStorage.getItem("admin_key");

  const handleAdminClick = () => {
    if (!isLoggedIn) {
      setPage('admin-login'); // 👈 redirect to login
    } else {
      setPage('admin');
    }
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif" }}>
      
      <Navbar 
        activePage={page} 
        onNavigate={(p) => {
          if (p === 'admin') {
            handleAdminClick();
          } else {
            setPage(p);
          }
        }} 
      />

      {/* Pages */}
      {page === 'booking' && <BookingPage />}
      {page === 'admin' && <AdminPage />}
      {page === 'admin-login' && <AdminLogin onLogin={() => setPage('admin')} />}
    </div>
  );
}