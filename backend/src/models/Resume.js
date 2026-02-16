const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template'
  },
  title: {
    type: String,
    required: true
  },
  personalInfo: {
    fullName: String,
    email: String,
    phone: String,
    location: String,
    summary: String,
    links: [
      {
        platform: String,
        url: String
      }
    ]
  },
  experience: [
    {
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      currentlyWorking: Boolean,
      description: String
    }
  ],
  education: [
    {
      institution: String,
      degree: String,
      field: String,
      startDate: Date,
      endDate: Date,
      grade: String
    }
  ],
  skills: [String],
  certifications: [
    {
      name: String,
      issuer: String,
      date: Date,
      credentialId: String,
      credentialUrl: String
    }
  ],
  projects: [
    {
      name: String,
      description: String,
      technologies: [String],
      link: String,
      startDate: Date,
      endDate: Date
    }
  ],
  atsScore: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
