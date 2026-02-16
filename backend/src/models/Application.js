const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  jobOpeningId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobOpening',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'under-review', 'shortlisted', 'rejected', 'accepted'],
    default: 'applied'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  coverLetter: String,
  score: {
    type: Number,
    default: 0
  },
  feedback: String,
  interviewDate: Date,
  result: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
