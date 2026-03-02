function deriveSectionsFromPdfText(text) {
  if (!text) return ['personalInfo', 'education', 'experience', 'skills', 'projects'];

  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  const detected = [];
  const addSection = (key) => {
    if (!detected.includes(key)) detected.push(key);
  };

  // Define patterns for headings
  const patterns = [
    {
      key: 'experience',
      regexes: [
        /^(work\s+experience)\b/i,
        /^(experience)\b/i,
        /^(professional\s+experience)\b/i,
        /^(employment\s+history)\b/i,
        /^(work\s+history)\b/i,
      ],
    },
    {
      key: 'education',
      regexes: [
        /^(education)\b/i,
        /^(academic\s+background)\b/i,
        /^(academic\s+qualifications)\b/i,
        /^(educational\s+background)\b/i,
      ],
    },
    {
      key: 'skills',
      regexes: [
        /^(skills)\b/i,
        /^(technical\s+skills)\b/i,
        /^(key\s+skills)\b/i,
        /^(core\s+competencies)\b/i,
      ],
    },
    {
      key: 'projects',
      regexes: [
        /^(projects)\b/i,
        /^(personal\s+projects)\b/i,
        /^(academic\s+projects)\b/i,
        /^(selected\s+projects)\b/i,
      ],
    },
    {
      key: 'certifications',
      regexes: [
        /^(certifications?)\b/i,
        /^(licenses\s+and\s+certifications?)\b/i,
      ],
    },
    {
      key: 'personalInfo',
      regexes: [
        /^(profile)\b/i,
        /^(summary)\b/i,
        /^(about\s+me)\b/i,
        /^(professional\s+summary)\b/i,
        /^(personal\s+information)\b/i,
      ],
    },
  ];

  // Scan lines and detect headings in order
  for (const line of lines) {
    for (const group of patterns) {
      if (group.regexes.some(r => r.test(line))) {
        addSection(group.key);
      }
    }
  }

  // Always ensure personalInfo is present and first
  if (!detected.includes('personalInfo')) {
    detected.unshift('personalInfo');
  } else {
    // Move personalInfo to front if found later
    const idx = detected.indexOf('personalInfo');
    if (idx > 0) {
      detected.splice(idx, 1);
      detected.unshift('personalInfo');
    }
  }

  // Fallback if nothing detected beyond personalInfo
  if (detected.length === 1) {
    return ['personalInfo', 'education', 'experience', 'skills', 'projects'];
  }

  return detected;
}

module.exports = { deriveSectionsFromPdfText };
