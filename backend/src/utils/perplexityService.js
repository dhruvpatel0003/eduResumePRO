const axios = require("axios");

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

async function generateResumeWithPerplexity(resumeData, templateInstructions) {
  const prompt = buildResumePrompt(resumeData, templateInstructions);

  try {
    // **Perplexity DOES NOT support vision/PDF uploads**
    // Use text-only with template instructions
    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: "sonar", // or 'sonar-pro'
        messages: [
          {
            role: "system",
            content:
              "You are an expert resume writer. Generate professional, ATS-friendly resumes with strong action verbs, quantifiable achievements, and proper formatting.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "Perplexity API error:",
      error.response?.data || error.message,
    );
    throw new Error("Failed to generate resume with Perplexity");
  }
}

function buildResumePrompt(resumeData, templateInstructions) {
  const {
    personalInfo,
    education,
    experience,
    projects,
    skills,
    certifications,
  } = resumeData.templateInfo;

  return `
Generate a professional resume in **Markdown format with tables** based on the following student data:

## PERSONAL INFORMATION
- Name: ${personalInfo.fullName || personalInfo.name}
- Email: ${personalInfo.email}
- Phone: ${personalInfo.phone}
- Location: ${personalInfo.location}
- LinkedIn: ${personalInfo.linkedin || personalInfo.links?.find((l) => l.includes("linkedin")) || "N/A"}
- GitHub: ${personalInfo.github || personalInfo.links?.find((l) => l.includes("github")) || "N/A"}
- Summary: ${personalInfo.summary || "Motivated software engineer"}

## EDUCATION
${education
  .map(
    (edu) => `
- **${edu.degree || edu.fieldOfStudy}** at ${edu.institution || edu.school}
  - Graduation: ${edu.graduationDate || edu.endDate}
  - GPA: ${edu.gpa || "N/A"}
  - Relevant Coursework: ${edu.coursework || "N/A"}
`,
  )
  .join("\n")}

## EXPERIENCE
${experience
  .map(
    (exp) => `
- **${exp.title || exp.position}** at ${exp.company}
  - Duration: ${exp.startDate} - ${exp.endDate || "Present"}
  - ${exp.description}
  - Technologies: ${exp.technologies?.join(", ") || "N/A"}
`,
  )
  .join("\n")}

## PROJECTS
${projects
  .map(
    (proj) => `
- **${proj.name}**
  - Description: ${proj.description}
  - Technologies: ${proj.technologies?.join(", ") || proj.languages || "N/A"}
  - Link: ${proj.link || proj.githubUrl || "N/A"}
  - Stars: ${proj.stars || "N/A"}
  ${proj.bullets ? `- Achievements:\n${proj.bullets.map((b) => `    * ${b}`).join("\n")}` : ""}
`,
  )
  .join("\n")}

## SKILLS
${skills?.join(", ") || "N/A"}

## CERTIFICATIONS
${certifications?.map((cert) => `- ${cert.name || cert.title} (${cert.issuer || cert.organization})`).join("\n") || "N/A"}

---

${templateInstructions}

**FORMATTING REQUIREMENTS:**
1. Use Markdown tables for Education and Experience sections:
   \`\`\`
   | School | Degree | Graduation |
   |--------|--------|------------|
   | ... | ... | ... |
   \`\`\`

2. **Projects** as bullet list with bold names
3. **Skills** grouped by category (Languages, Frameworks, Tools, Cloud)
4. Action verbs: Developed, Built, Implemented, Optimized, Designed
5. Quantify achievements: "Reduced load time 40%", "Served 10K users"
6. ATS-friendly: No special characters, simple formatting
7. Professional tone, no casual language
8. Single-column layout

**OUTPUT COMPLETE RESUME IN MARKDOWN FORMAT NOW.**
`;
}

// utils/perplexityService.js - ADD THIS FUNCTION
async function generateJobAnalysis(resumeText, jobDescription) {
  const prompt = `
ANALYZE ONLY INDIVIDUAL BULLETS. Return feedback for SPECIFIC fields:

RESUME: ${resumeText}
JOB: ${jobDescription}

Return ONLY JSON with bullet-level suggestions:
{
  "matchScore": 75,
  "feedback": [
    {
      "fieldPath": "experience[0].bullets[1]", 
      "type": "suggestion",
      "originalValue": "Built React app",
      "suggestedValue": "Engineered React dashboard (40% faster)",
      "note": "Add metrics"
    },
    {
      "fieldPath": "projects[0].description",   
      "type": "suggestion", 
      "originalValue": "Resume app",
      "suggestedValue": "AI-powered resume builder (50+ GitHub stars)",
      "note": "Quantify impact"
    }
  ]
}

CRITICAL: suggestedValue must be SINGLE LINE strings, never multi-line or full sections.
`;

  const response = await axios.post(
    "https://api.perplexity.ai/chat/completions",
    {
      model: "sonar",
      messages: [
        {
          role: "system",
          content: "Expert ATS analyst. Return structured JSON only.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 1500,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  return JSON.parse(response.data.choices[0].message.content);
}

module.exports = { generateResumeWithPerplexity, generateJobAnalysis };
