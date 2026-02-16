const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  overallRating: {
    type: Number,
    min: 1,
    max: 5
  },
  comments: String,
  suggestions: [String],
  strengths: [String],
  areasForImprovement: [String],
  status: {
    type: String,
    enum: ['pending', 'submitted', 'reviewed'],
    default: 'pending'
  },
  sections: [
    {
      sectionName: String,
      rating: Number,
      comment: String
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
