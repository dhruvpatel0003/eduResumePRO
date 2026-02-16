const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sections: [
    {
      name: String,
      fields: [String]
    }
  ],
  styling: {
    fontFamily: {
      type: String,
      default: 'Arial'
    },
    fontSize: {
      type: Number,
      default: 12
    },
    colors: {
      primary: String,
      secondary: String,
      text: String
    },
    layout: String
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['modern', 'classic', 'creative', 'minimal'],
    default: 'modern'
  },
  thumbnail: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
