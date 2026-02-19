const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    // Human readable name: "Prof John Doe Resume"
    name: { type: String, required: true },

    // Who uploaded it (later you can link to User model)
    professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },

    // GridFS file id where the PDF is stored
    pdfGridFSId: { type: mongoose.Schema.Types.ObjectId, required: true },

    // Optional tags / description
    description: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Template', templateSchema);
