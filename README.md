# 🦷 SmileCare Dental Appointment Booking System

A full-stack, production-ready dental clinic appointment booking system built with React, Node.js + Express, and SQLite.

---

## 📁 Project Structure

```
dental-app/
├── backend/
│   ├── server.js                  # Express app entry point
│   ├── db.js                      # SQLite setup (better-sqlite3)
│   ├── routes/
│   │   ├── bookingRoutes.js       # POST /api/booking, DELETE /api/booking/:id
│   │   └── patientRoutes.js       # GET /api/patients/** 
│   ├── middleware/
│   │   └── auth.js                # Bearer token auth for admin routes
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── BookingPage.jsx    # Patient-facing booking form
│   │   │   └── AdminPage.jsx      # Admin dashboard
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Top navigation bar
│   │   │   ├── SlotPicker.jsx     # Interactive slot selection grid
│   │   │   └── ReceiptModal.jsx   # Success confirmation modal
│   │   ├── utils/
│   │   │   ├── api.js             # Centralized API layer
│   │   │   ├── dateUtils.js       # Date formatting helpers
│   │   │   └── constants.js       # App-wide constants
│   │   ├── App.jsx
│   │   └── index.js
│   ├── .env.example
│   └── package.json
├── render.yaml                    # Render deployment blueprint
├── package.json                   # Root convenience scripts
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd dental-app

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

The defaults work out-of-the-box for local development — no changes needed.

### 3. Run

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 3001)
cd backend && npm start

# Terminal 2 — Frontend (port 3000)
cd frontend && npm start
```

Then open **http://localhost:3000** in your browser.

---

## 🌐 API Reference

All routes are prefixed with `/api`.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET`  | `/api/patients/slots?date=YYYY-MM-DD` | ❌ | Get slot availability for a date |
| `POST` | `/api/booking` | ❌ | Create a new appointment |
| `GET`  | `/api/patients` | ✅ | List all patients (filterable) |
| `GET`  | `/api/patients/today` | ✅ | Today's appointments |
| `GET`  | `/api/patients/stats` | ✅ | Dashboard statistics |
| `DELETE` | `/api/patients/:mobile` | ✅ | Delete bookings by mobile |

### POST /api/booking — Request Body

```json
{
  "name":    "Rahul Sharma",
  "mobile":  "9876543210",
  "date":    "2024-03-15",
  "slot":    "10:00 AM",
  "problem": "Toothache / Pain"
}
```

### GET /api/patients/slots — Response

```json
{
  "success": true,
  "date": "2024-03-15",
  "slots": [
    { "slot": "09:00 AM", "booked": 12, "available": 18, "isFull": false },
    { "slot": "09:30 AM", "booked": 30, "available": 0,  "isFull": true  }
  ]
}
```

---

## 🗃️ Database Schema

```sql
CREATE TABLE patients (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  mobile     TEXT    NOT NULL,
  date       TEXT    NOT NULL,          -- YYYY-MM-DD
  slot       TEXT    NOT NULL,          -- e.g. "09:00 AM"
  token      INTEGER NOT NULL,          -- sequential per day
  problem    TEXT    DEFAULT '',
  created_at TEXT    DEFAULT (datetime('now','localtime'))
);
```

---

## 🔒 Admin Authentication

Admin routes (`/api/patients/*`) are protected by an optional Bearer token.

- Set `ADMIN_KEY=your-secret` in `backend/.env`
- Send `Authorization: Bearer your-secret` header with admin requests
- If `ADMIN_KEY` is not set, auth is skipped (dev-friendly)

---

## ☁️ Deploying to Render

### Option A — Using render.yaml Blueprint (Recommended)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Blueprint
3. Connect your repo — Render reads `render.yaml` automatically
4. Set `ADMIN_KEY` in the backend service environment (Render dashboard)
5. Update `REACT_APP_API_URL` in the frontend service to your backend URL

### Option B — Manual Deployment

**Backend (Web Service):**
- Root Dir: `backend`
- Build: `npm install`
- Start: `node server.js`
- Add Disk: mount at `/var/data`, set `DATA_DIR=/var/data`

**Frontend (Static Site):**
- Root Dir: `frontend`
- Build: `npm install && npm run build`
- Publish Dir: `build`
- Add rewrite rule: `/* → /index.html`

---

## ✅ Feature Checklist

- [x] Date format always `YYYY-MM-DD` end-to-end
- [x] Configurable API base URL via `REACT_APP_API_URL`
- [x] All routes mounted correctly — zero 404s
- [x] CORS enabled and configurable
- [x] Slot capacity enforced (max 30/slot)
- [x] Duplicate mobile+date booking rejected
- [x] Token auto-assigned (sequential per day)
- [x] Mobile validation (exactly 10 digits)
- [x] Success receipt modal with token number
- [x] Admin dashboard: today's list, search, stats
- [x] Responsive design (mobile-friendly)
- [x] Edge cases: API down, full slots, invalid date
- [x] Render-ready with persistent disk for SQLite

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, functional components, hooks |
| Backend | Node.js, Express 4 |
| Database | SQLite via `better-sqlite3` |
| Deployment | Render (web service + static site) |
| Styling | Inline React styles (zero dependencies) |
