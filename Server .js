// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { startScheduler } = require('./scheduler');

const app = express();

// Debug middleware (NEW)
app.use((req, res, next) => {
  console.log(`🛠️ [DEBUG] ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medications', require('./routes/medications'));
app.use('/api/adherence', require('./routes/adherence'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check (MODIFIED)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development', // NEW
    debug: true // NEW
  });
});

// Temporary debug route (NEW)
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'Debug route is working!',
    headers: req.headers,
    query: req.query
  });
});

// Start scheduler
startScheduler();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🏥 Medicine Reminder API running at http://localhost:${PORT}`);
  console.log(`📋 API endpoints:`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET/POST /api/medications`);
  console.log(`   GET /api/medications/schedule/today`);
  console.log(`   POST /api/adherence/log`);
  console.log(`   GET /api/adherence/stats`);
  console.log(`   GET /api/notifications`);
  console.log(`   GET /api/debug (NEW)\n`); // NEW
});