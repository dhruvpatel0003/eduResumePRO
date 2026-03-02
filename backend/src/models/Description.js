const mongoose = require('mongoose');

const descriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['job', 'project'],
    required: true
  },
  input: {
    brief: String,      // "Built a web app with React"
    points: [String],   // ["React frontend", "Node backend", "MongoDB"]
    context: String     // Job title or project context
  },
  generatedText: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Description', descriptionSchema);
