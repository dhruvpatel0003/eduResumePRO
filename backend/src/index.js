const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const templateRoutes = require('./routes/templateRoutes');
const jobOpeningRoutes = require('./routes/jobOpeningRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const decriptionRoutes = require('./routes/descriptionRoutes');
const githubRoutes = require('./routes/githubRoutes');
const hunterRoutes = require('./routes/hunterRoutes');
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const applicationRoutes = require('./routes/applicationRoutes');
const mongoose = require('mongoose');
const { initGridFS } = require('./config/gridfs');

// Prometheus metrics
const promBundle = require('express-prom-bundle');
const client = require('prom-client');
const { register, apiErrorsTotal, activeDbConnections } = require('./metrics');


// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware - PROMETHEUS FIRST (BEFORE other routes)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FIXED: Prometheus middleware BEFORE all routes
app.use(promBundle({
  includeMethod: true,      // Track GET/POST/etc
  includePath: true,        // Track paths
  includeStatusCode: true,  // Track 200/404/500
  autoregister: true,        // Auto-creates /metrics endpoint
  collectDefaultMetrics: true,
  requestDurationBuckets: [0.1, 0.5, 1, 2],  // HTTP latency
  registry: register  // Use YOUR registry
}));

// ✅ Collect default metrics (CPU, memory, etc)
// client.collectDefaultMetrics();

// Database connection
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async () => {
    console.log('✅ MongoDB connected');
    
    // Track active connections
    setInterval(() => {
      const activeConnections = mongoose.connection.base.connections.reduce((acc, conn) => acc + Object.keys(conn.models).length > 0 ? 1 : 0, 0); // Simplified count, or just monitor state
      activeDbConnections.set(mongoose.connection.readyState === 1 ? 1 : 0); 
    }, 10000);

    // Initialize GridFS buckets AFTER DB connection
    const db = mongoose.connection.db;
    initGridFS(db);
    console.log('✅ GridFS buckets ready (professorTemplates)');
  }).catch(err => {
    console.error('Failed to connect DB:', err);
    process.exit(1);
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    message: 'API is running'
  });
});

// ✅ REMOVE THIS - promBundle already creates /metrics
// app.get('/metrics', ...)  // DELETE THIS ENTIRE BLOCK

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/jobs', jobOpeningRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/era', decriptionRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/hunter', hunterRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/applications', applicationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Track 500 errors
  apiErrorsTotal.inc({ endpoint: req.path, status_code: 500 });

  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  apiErrorsTotal.inc({ endpoint: req.path, status_code: 404 });
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
