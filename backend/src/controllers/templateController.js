const Template = require('../models/Template');
const { uploadToGridFS } = require('../config/gridfs');
const multer = require('multer'); // Simple memory storage
const upload = multer({ storage: multer.memoryStorage() });

class TemplateController {
  static uploadTemplate = [
    upload.single('pdf'), // Store in memory
    async (req, res) => {
      
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'PDF file required' });
        }

        const { name, description } = req.body;
        if (!name) return res.status(400).json({ error: 'Name required' });

        // Upload buffer to GridFS
        const gridFSId = await uploadToGridFS(req.file.buffer, `template-${Date.now()}.pdf`);

        // Save to MongoDB
        const template = await Template.create({
          name,
          description,
          professorId: req.user?.id || null,
          pdfGridFSId: gridFSId
        });

        res.status(201).json({
          message: 'Template uploaded!',
          template: {
            id: template._id,
            name: template.name,
            pdfGridFSId: template.pdfGridFSId.toString()
          }
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Upload failed' });
      }
    }
  ];

  static async listTemplates(req, res) {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.json(templates);
  }
}

module.exports = TemplateController;
