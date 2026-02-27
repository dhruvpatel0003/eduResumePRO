const Description = require('../models/Description');
const axios = require('axios');

class DescriptionController {
  static async generateDescription(req, res) {
    try {
      const { type, brief, points, context } = req.body;
      
      if (!type || !['job', 'project'].includes(type)) {
        return res.status(400).json({ error: 'Type must be "job" or "project"' });
      }
      
      if (!brief && (!points || points.length === 0)) {
        return res.status(400).json({ error: 'Provide brief or points' });
      }

      const prompt = DescriptionController.buildPrompt(type, brief, points, context);
      
      const aiResponse = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar-pro',
          messages: [
            {
              role: 'system',
              content: 'You are ERA, a professional resume description generator. Create concise, impactful bullet points for resumes. Use action verbs and quantify achievements when possible.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 300,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const generatedText = aiResponse.data.choices[0].message.content.trim();
      
      const description = new Description({
        userId: req.user.id,
        type,
        input: { brief, points: points || [], context },
        generatedText,
      });
      
      res.json({
        success: true,
        descriptionId: description._id,
        generatedText,
        type,
        inputUsed: { brief, points: points?.length || 0, context }
      });

    } catch (error) {
      console.error('ERA generation error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        return res.status(401).json({ error: 'Invalid Perplexity API key' });
      }
      
      res.status(500).json({ 
        error: 'Failed to generate description',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static buildPrompt(type, brief, points, context) {
    const typePrefix = type === 'job' ? 'job experience' : 'project';
    
    let prompt = `Generate a professional resume bullet point for ${typePrefix}:\n\n`;
    
    if (brief) {
      prompt += `Brief: ${brief}\n`;
    }
    
    if (points && points.length > 0) {
      prompt += `Key points:\n${points.map(p => `• ${p}`).join('\n')}\n\n`;
    }
    
    if (context) {
      prompt += `Context: ${context}\n\n`;
    }
    
    prompt += `Output ONLY 1-2 impactful bullet points (max 2 lines each). Start with strong action verb. Be concise and professional.`;
    
    return prompt;
  }
}

module.exports = DescriptionController;
