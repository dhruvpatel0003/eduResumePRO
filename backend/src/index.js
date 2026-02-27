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
const mongoose = require('mongoose');
const { initGridFS } = require('./config/gridfs');
// Load environment variables
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


// Database connection
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async () => {
    console.log('✅ MongoDB connected');
    
    // NEW: Initialize GridFS buckets AFTER DB connection
    const db = mongoose.connection.db;
    initGridFS(db);
    console.log('✅ GridFS buckets ready (professorTemplates)');}).catch(err => {
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

// In your backend server.js
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  
  res.send(`
# HELP eduresume_resumes_generated_total Total resumes generated
# TYPE eduresume_resumes_generated_total counter
eduresume_resumes_generated_total 42

# HELP eduresume_ats_score_avg Average ATS score
# TYPE eduresume_ats_score_avg gauge
eduresume_ats_score_avg 82

# HELP eduresume_pdf_generation_seconds PDF generation time
# TYPE eduresume_pdf_generation_seconds histogram
eduresume_pdf_generation_seconds_bucket{le="1"} 10
eduresume_pdf_generation_seconds_bucket{le="2"} 35
eduresume_pdf_generation_seconds_bucket{le="+Inf"} 42
  `);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/jobs', jobOpeningRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/era', decriptionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
