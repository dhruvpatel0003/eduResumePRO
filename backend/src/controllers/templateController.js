const Template = require('../models/Template');
const { uploadToGridFS } = require('../config/gridfs');
const multer = require('multer'); // Simple memory storage
const upload = multer({ storage: multer.memoryStorage() });
const { deleteFromGridFS } = require('../config/gridfs');

class TemplateController {
  static uploadTemplate = [
    upload.single('pdf'), // Store in memory
    async (req, res) => {
      
      try {
        // Only professors may upload templates
        if (!req.user || req.user.role !== 'professor') {
          return res.status(403).json({ error: 'Only professors can upload templates' });
        }
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
          pdfGridFSId: gridFSId.toString() // Store as string for easier handling
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

  static async deleteTemplate(req, res) {
    try {
      // Only professors may delete templates
      if (!req.user || req.user.role !== 'professor') {
        return res.status(403).json({ error: 'Only professors can delete templates' });
      }
      const { id } = req.params;
      
      // 1. Find template
      const template = await Template.findOne({ 
        _id: id, 
        professorId: req.user.id // Only own templates
      });
      
      if (!template) {
        return res.status(404).json({ error: 'Template not found or unauthorized' });
      }

      await deleteFromGridFS(template.pdfGridFSId);
      await Template.findByIdAndDelete(id);
      res.json({ 
        message: 'Template deleted successfully',
        deletedTemplate: template.name 
      });
      
    } catch (error) {
      console.error('Delete template error:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
}
}
module.exports = TemplateController;
