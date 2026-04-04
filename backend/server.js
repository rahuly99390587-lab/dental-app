const express = require('express');
const cors = require('cors');
const path = require('path');

// ─── Init ─────────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3001;

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, mobile apps, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger (dev) ─────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ─── API Routes ───────────────────────────────────────────────────────────────
// IMPORTANT: Mount order matters.
//   - patientRoutes handles /api/patients/** (including /slots, /today, /stats)
//   - bookingRoutes handles /api/booking
const patientRoutes = require('./routes/patientRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/patients', patientRoutes);
app.use('/api/booking', bookingRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Serve React Build (Production) ──────────────────────────────────────────
// if (process.env.NODE_ENV === 'production') {
//   const buildPath = path.join(__dirname, '..', 'frontend', 'build');
//   app.use(express.static(buildPath));
//   app.use((_req, res) => {
//     res.sendFile(path.join(buildPath, 'index.html'));
//   });
// }

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[Global Error]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🦷  Dental Booking API running on port ${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health      : http://localhost:${PORT}/health`);
  console.log(`   Slots API   : http://localhost:${PORT}/api/patients/slots?date=YYYY-MM-DD\n`);
});

module.exports = app;
