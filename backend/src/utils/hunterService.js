const { generateJobAnalysis } = require('./perplexityService');

function extractResumeText(templateInfo) {
  let text = '';
  text += templateInfo.personalInfo?.fullName || '';
  text += ' ' + (templateInfo.personalInfo?.summary || '');
  
  templateInfo.experience?.forEach(exp => {
    text += ' ' + exp.bullets?.join(' ') || '';
  });
  
  templateInfo.projects?.forEach(proj => {
    text += ' ' + proj.description || '';
  });
  
  templateInfo.skills?.forEach(skill => {
    text += ' ' + skill;
  });
  
  return text.toLowerCase();
}

async function analyzeJobMatch(resumeText, job) {
  // 1. Keyword matching (60%)
  const jobKeywords = extractKeywords(job.description);
  const resumeKeywords = resumeText.split(' ');
  let keywordMatches = 0;
  
  jobKeywords.forEach(keyword => {
    if (resumeKeywords.some(word => word.includes(keyword.toLowerCase()))) {
      keywordMatches++;
    }
  });
  
  const keywordScore = Math.min((keywordMatches / jobKeywords.length) * 60, 60);

  // 2. AI Semantic analysis (40%)
  const aiFeedback = await generateAIJobFeedback(resumeText, job);
  
  return {
    atsScore: Math.round(keywordScore + aiFeedback.matchScore),
    matchScore: aiFeedback.matchScore,
    feedback: aiFeedback.feedback,
    missingKeywords: jobKeywords.filter(kw => 
      !resumeKeywords.some(word => word.includes(kw.toLowerCase()))
    )
  };
}

function extractKeywords(text) {
  // Common tech keywords + custom
  const patterns = [
    /\b(react|node|docker|aws|java|python|javascript|typescript)\b/gi,
    /\b(api|rest|graphql|sql|nosql|mongodb)\b/gi,
    /\b(frontend|backend|fullstack|devops|ci\/cd)\b/gi
  ];
  
  let keywords = [];
  patterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    keywords.push(...matches.map(m => m.toLowerCase()));
  });
  
  return [...new Set(keywords)].slice(0, 10);
}

async function generateAIJobFeedback(resumeText, job) {

  return await generateJobAnalysis(resumeText, job.description);;
}

module.exports = { extractResumeText, analyzeJobMatch };
