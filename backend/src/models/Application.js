const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobOpeningId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobOpening',
    required: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
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
  interviewDate: {
    type: Date
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
