const axios = require("axios");
const { externalApiDurationSeconds } = require("../metrics");

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

async function generateResumeWithPerplexity(resumeData, templateInstructions) {
  const prompt = buildResumePrompt(resumeData, templateInstructions);

  try {
    // **Perplexity DOES NOT support vision/PDF uploads**
    // Use text-only with template instructions
    const endTimer = externalApiDurationSeconds.startTimer({ service: 'perplexity' });
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
    endTimer();

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
- LinkedIn: ${personalInfo.linkedin || personalInfo.links?.find((l) => l.platform?.toLowerCase() === "linkedin")?.url || "N/A"}
- GitHub: ${personalInfo.github || personalInfo.links?.find((l) => l.platform?.toLowerCase() === "github")?.url || "N/A"}
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

function buildReportPrompt(resumeText) {
  return `
Analyze the following resume text and rate it on these criteria:

1. Spellings & Grammar
2. Sections
3. Experience Chronological Order
4. Experience Details
5. Educational Details
6. Skill Relevance
7. CourseWork
8. Skill Match
9. Competency Match
10. Font Size & Choice
11. Margins
12. Line Spacing
13. Bullet Point Format
14. Date Format
15. Length
16. Contact Information
17. Pronouns

For each criterion, give a score from 0-100 and 1-2 sentence feedback.

THEN propose specific, small edits to improve the resume at the field/bullet level. 
Each suggestion must target an existing field path in the JSON schema (experience[i].bullets[j], education[i].degree, skills[k], etc.) and replace only that string with a better version.

Resume text:
${resumeText.substring(0, 4000)}

Return ONLY valid JSON in this exact structure:

{
  "overallScore": 82,
  "criteria": [
    {
      "name": "Spellings & Grammar",
      "score": 90,
      "feedback": "Short comment here.",
      "autoFixAvailable": false
    }
  ],
  "aiSuggestions": [
    {
      "fieldPath": "experience[0].bullets[1]",
      "type": "suggestion",
      "originalValue": "Existing text exactly as in the resume",
      "suggestedValue": "Improved SINGLE-LINE version with action verb and metrics",
      "note": "Why this is better."
    }
  ]
}

Rules:
- suggestedValue MUST be a single-line string (no line breaks).
- Do NOT rewrite entire sections; only edit individual bullets/fields.
- Keep feedback professional and ATS-friendly.
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

  const endTimer = externalApiDurationSeconds.startTimer({ service: 'perplexity' });
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
  endTimer();

  return JSON.parse(response.data.choices[0].message.content);
}

module.exports = { generateResumeWithPerplexity, generateJobAnalysis, buildReportPrompt };
