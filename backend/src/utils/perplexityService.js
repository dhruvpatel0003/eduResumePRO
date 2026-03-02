// services/perplexityService.js
const axios = require('axios');
const FormData = require('form-data');

async function generateResumeWithPerplexity(resumeData, templateInstructions, templatePdfBuffer) {
  const prompt = buildResumePrompt(resumeData, templateInstructions);

  // **NEW: Multi-modal request with PDF template as visual reference**
  const form = new FormData();
  form.append('model', 'sonar-pro'); // Supports vision
  form.append('messages', JSON.stringify([{
    role: 'system',
    content: `
You are a professional resume generator that matches professor templates EXACTLY.

Your job:
1. Analyze the provided professor template PDF visually
2. Extract: section order, fonts, spacing, layout, bullet styles
3. Fill student data into EXACT same structure
4. Generate identical-looking resume in Markdown + LaTeX tables
    `,
  }, {
    role: 'user',
    content: [
      { type: 'text', text: prompt },
      ...(templatePdfBuffer ? [{
        type: 'image_url',
        image_url: {
          url: `data:application/pdf;base64,${templatePdfBuffer.toString('base64')}`
        }
      }] : [])
    ]
  }]));

  form.append('temperature', '0.1'); // Very consistent
  form.append('max_tokens', '6000');

  try {
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Perplexity vision API error:', error.response?.data);
    
    // **FALLBACK: Text-only if vision fails**
    console.log('Falling back to text-only generation...');
    return await generateResumeTextOnly(resumeData, templateInstructions);
  }
}

async function generateResumeTextOnly(resumeData, templateInstructions) {
  // Same as original but without image
  const prompt = buildResumePrompt(resumeData, templateInstructions);
  
  const response = await axios.post(
    'https://api.perplexity.ai/chat/completions',
    {
      model: 'sonar-pro',
      messages: [
        {
          role: 'system',
          content: 'Generate professional resume matching template instructions.',
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 4000,
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
}

function buildResumePrompt(resumeData, templateInstructions) {
  const { personalInfo, education, experience, projects, skills } = resumeData.templateInfo;

  return `
**STUDENT RESUME DATA:**

Personal: ${JSON.stringify(personalInfo, null, 2)}
Education: ${JSON.stringify(education, null, 2)}
Experience: ${JSON.stringify(experience, null, 2)}
Projects: ${JSON.stringify(projects, null, 2)}
Skills: ${skills?.join(', ') || ''}

${templateInstructions}

**INSTRUCTIONS:**
1. Match professor template EXACTLY (analyze uploaded PDF)
2. Same section order, fonts, spacing, bullet styles
3. Use LaTeX tables for Education/Experience/Projects
4. Professional, ATS-friendly, single-column
5. Output in clean Markdown with LaTeX formatting

Generate COMPLETE resume now.
`;
}

module.exports = { generateResumeWithPerplexity };
