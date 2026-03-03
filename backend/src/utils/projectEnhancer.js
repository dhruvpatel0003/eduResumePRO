const axios = require('axios');

async function enhanceProjectDescriptions(projects) {
  const enhancedProjects = [];
  
  for (const project of projects) {
    if (project.description && project.description.length > 50) {
      enhancedProjects.push(project);
      continue;
    }

    try {
      console.log(`✨ Enhancing project: ${project.name}`);
      
      const enhanced = await generateProfessionalDescription(project);
      enhancedProjects.push({
        ...project,
        description: enhanced.description,
        bullets: enhanced.bullets, // NEW: Add bullet points
      });
    } catch (err) {
      console.error(`Failed to enhance ${project.name}:`, err.message);
      // Fallback to original
      enhancedProjects.push(project);
    }
  }
  
  return enhancedProjects;
}

async function generateProfessionalDescription(project) {
  const prompt = `
Transform this GitHub project into 3-4 professional resume bullet points:

**Project:** ${project.name}
**GitHub Description:** ${project.description || 'No description'}
**Tech Stack:** ${project.technologies?.join(', ') || project.languages?.join(', ') || 'N/A'}
**Metrics:** ${project.stars} stars, ${project.forks} forks

**Requirements:**
- Action verbs (Developed, Built, Implemented, Optimized)
- Quantify impact (reduced load time 40%, served 10K users)
- ATS keywords (React, Node.js, Docker, AWS, etc.)
- 1 line per bullet, 15-25 words max
- Professional tone, no casual language

**Output format:**
{
  "description": "Professional 1-line summary",
  "bullets": [
    "ACTION: What you did with quantifiable result",
    "IMPACT: Business/user value delivered",
    "TECH: Key technologies leveraged"
  ]
}
`;

  try {
    // **OPTION 1: Perplexity (fast)**
    const response = await axios.post(
      'https://api.perplexity.ai/chat/completions',
      {
        model: 'sonar-small-online',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const aiResponse = JSON.parse(response.data.choices[0].message.content);
    return aiResponse;

  } catch (error) {
    // **OPTION 2: ERA-style rule-based generation (no API)**
    return generateRuleBasedDescription(project);
  }
}

// **FALLBACK: No-API rule-based enhancement**
function generateRuleBasedDescription(project) {
  const tech = project.technologies?.join(', ') || 'modern web technologies';
  const stars = project.stars || 0;
  
  return {
    description: `Developed ${project.name}, a full-stack ${tech} application (${stars} GitHub stars).`,
    bullets: [
      `Built ${project.name} using ${tech} from GitHub repository with ${stars} stars and active community engagement.`,
      `Implemented core features and deployed production-ready application demonstrating full-stack development skills.`,
      `Applied modern development practices including version control, testing, and documentation best practices.`
    ]
  };
}

module.exports = { enhanceProjectDescriptions };
