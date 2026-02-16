const Template = require('../models/Template');

const templateController = {
  // Get all templates
  getAll: async (req, res) => {
    try {
      const templates = await Template.find({ isPublic: true });
      res.status(200).json(templates);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get template by ID
  getById: async (req, res) => {
    try {
      const template = await Template.findById(req.params.id);
      if (!template) return res.status(404).json({ message: 'Template not found' });
      res.status(200).json(template);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create template (admin only)
  create: async (req, res) => {
    try {
      const template = new Template({
        ...req.body,
        createdBy: req.user.id
      });

      await template.save();
      res.status(201).json(template);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update template
  update: async (req, res) => {
    try {
      const template = await Template.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.status(200).json(template);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete template
  delete: async (req, res) => {
    try {
      await Template.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Template deleted' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = templateController;
