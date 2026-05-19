/**
 * Rule-based Job Role Matcher
 *
 * Matches resume skills & experience against a database of 50+ job roles.
 * Returns top matches sorted by relevance score.
 */

// --- Job Roles Database ---
const JOB_ROLES_DB = [
  {
    title: "Frontend Developer",
    keywords: ["react", "vue", "angular", "javascript", "typescript", "css", "html", "tailwind", "sass", "webpack", "vite", "next.js", "redux", "responsive design", "ui", "ux"],
    seniority: ["junior", "mid", "senior"],
    category: "Engineering",
  },
  {
    title: "Backend Developer",
    keywords: ["node.js", "express", "python", "django", "flask", "java", "spring", "api", "rest", "graphql", "sql", "database", "microservices", "redis", "rabbitmq"],
    seniority: ["junior", "mid", "senior"],
    category: "Engineering",
  },
  {
    title: "Full Stack Developer",
    keywords: ["react", "node.js", "javascript", "typescript", "api", "database", "sql", "mongodb", "express", "next.js", "docker", "git", "html", "css"],
    seniority: ["junior", "mid", "senior"],
    category: "Engineering",
  },
  {
    title: "DevOps Engineer",
    keywords: ["docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "terraform", "ansible", "jenkins", "linux", "monitoring", "infrastructure", "cloud", "devops", "pipeline"],
    seniority: ["mid", "senior"],
    category: "Engineering",
  },
  {
    title: "Data Scientist",
    keywords: ["python", "machine learning", "deep learning", "tensorflow", "pytorch", "pandas", "numpy", "statistics", "data analysis", "sql", "r", "visualization", "nlp"],
    seniority: ["junior", "mid", "senior"],
    category: "Data",
  },
  {
    title: "Data Analyst",
    keywords: ["sql", "excel", "tableau", "power bi", "python", "data analysis", "statistics", "visualization", "reporting", "etl", "data warehouse", "analytics"],
    seniority: ["junior", "mid", "senior"],
    category: "Data",
  },
  {
    title: "Data Engineer",
    keywords: ["python", "sql", "spark", "hadoop", "airflow", "etl", "data pipeline", "aws", "gcp", "kafka", "data warehouse", "big data", "database"],
    seniority: ["mid", "senior"],
    category: "Data",
  },
  {
    title: "Machine Learning Engineer",
    keywords: ["machine learning", "python", "tensorflow", "pytorch", "deep learning", "mlops", "model deployment", "feature engineering", "computer vision", "nlp", "aws", "docker"],
    seniority: ["mid", "senior"],
    category: "Data",
  },
  {
    title: "Mobile Developer",
    keywords: ["react native", "flutter", "swift", "kotlin", "ios", "android", "mobile", "java", "dart", "firebase", "app store", "xcode"],
    seniority: ["junior", "mid", "senior"],
    category: "Engineering",
  },
  {
    title: "Cloud Architect",
    keywords: ["aws", "azure", "gcp", "cloud", "infrastructure", "terraform", "kubernetes", "microservices", "security", "networking", "scalable", "serverless"],
    seniority: ["senior"],
    category: "Engineering",
  },
  {
    title: "UI/UX Designer",
    keywords: ["figma", "sketch", "adobe xd", "user research", "wireframe", "prototype", "design system", "usability", "a/b testing", "responsive", "ui", "ux", "interaction design"],
    seniority: ["junior", "mid", "senior"],
    category: "Design",
  },
  {
    title: "Product Manager",
    keywords: ["product", "roadmap", "agile", "scrum", "stakeholder", "requirements", "strategy", "analytics", "kpi", "a/b testing", "user stories", "jira", "market research"],
    seniority: ["mid", "senior"],
    category: "Product",
  },
  {
    title: "Project Manager",
    keywords: ["project management", "agile", "scrum", "waterfall", "jira", "budget", "timeline", "stakeholder", "risk management", "pmp", "cross-functional", "planning"],
    seniority: ["mid", "senior"],
    category: "Management",
  },
  {
    title: "QA Engineer",
    keywords: ["testing", "automation", "selenium", "cypress", "jest", "qa", "quality assurance", "test cases", "bug tracking", "regression", "performance testing", "api testing"],
    seniority: ["junior", "mid", "senior"],
    category: "Engineering",
  },
  {
    title: "Security Engineer",
    keywords: ["security", "penetration testing", "vulnerability", "firewall", "encryption", "compliance", "soc", "siem", "incident response", "owasp", "network security"],
    seniority: ["mid", "senior"],
    category: "Engineering",
  },
  {
    title: "Database Administrator",
    keywords: ["sql", "mysql", "postgresql", "oracle", "mongodb", "database", "backup", "replication", "performance tuning", "indexing", "stored procedures", "administration"],
    seniority: ["mid", "senior"],
    category: "Engineering",
  },
  {
    title: "Systems Administrator",
    keywords: ["linux", "windows server", "networking", "active directory", "vmware", "scripting", "bash", "powershell", "monitoring", "troubleshooting", "infrastructure"],
    seniority: ["junior", "mid", "senior"],
    category: "IT",
  },
  {
    title: "Technical Writer",
    keywords: ["documentation", "technical writing", "api documentation", "markdown", "confluence", "user guides", "content", "editing", "information architecture"],
    seniority: ["junior", "mid", "senior"],
    category: "Content",
  },
  {
    title: "Business Analyst",
    keywords: ["business analysis", "requirements", "sql", "data analysis", "process improvement", "stakeholder", "documentation", "agile", "use cases", "reporting"],
    seniority: ["junior", "mid", "senior"],
    category: "Business",
  },
  {
    title: "Solutions Architect",
    keywords: ["architecture", "cloud", "aws", "azure", "microservices", "enterprise", "integration", "scalable", "design patterns", "api", "stakeholder"],
    seniority: ["senior"],
    category: "Engineering",
  },
  {
    title: "Blockchain Developer",
    keywords: ["blockchain", "solidity", "ethereum", "smart contracts", "web3", "defi", "nft", "cryptocurrency", "dapp", "consensus"],
    seniority: ["mid", "senior"],
    category: "Engineering",
  },
  {
    title: "AI/ML Research Scientist",
    keywords: ["machine learning", "deep learning", "research", "publications", "nlp", "computer vision", "reinforcement learning", "pytorch", "tensorflow", "phd"],
    seniority: ["senior"],
    category: "Research",
  },
  {
    title: "Site Reliability Engineer",
    keywords: ["sre", "reliability", "monitoring", "kubernetes", "docker", "incident management", "automation", "linux", "python", "observability", "sla"],
    seniority: ["mid", "senior"],
    category: "Engineering",
  },
  {
    title: "Embedded Systems Engineer",
    keywords: ["c", "c++", "embedded", "rtos", "firmware", "microcontroller", "iot", "hardware", "debugging", "arm", "fpga"],
    seniority: ["mid", "senior"],
    category: "Engineering",
  },
  {
    title: "Game Developer",
    keywords: ["unity", "unreal engine", "c#", "c++", "game design", "3d", "opengl", "physics", "animation", "multiplayer"],
    seniority: ["junior", "mid", "senior"],
    category: "Engineering",
  },
  {
    title: "Marketing Manager",
    keywords: ["marketing", "seo", "sem", "social media", "content marketing", "analytics", "campaign", "branding", "email marketing", "google analytics", "strategy"],
    seniority: ["mid", "senior"],
    category: "Marketing",
  },
  {
    title: "Digital Marketing Specialist",
    keywords: ["seo", "sem", "google ads", "facebook ads", "social media", "content", "analytics", "email marketing", "conversion", "ppc", "marketing automation"],
    seniority: ["junior", "mid"],
    category: "Marketing",
  },
  {
    title: "Sales Engineer",
    keywords: ["sales", "technical", "demo", "presentation", "crm", "solution", "client", "customer", "negotiation", "revenue", "pipeline", "enterprise"],
    seniority: ["mid", "senior"],
    category: "Sales",
  },
  {
    title: "Customer Success Manager",
    keywords: ["customer success", "retention", "onboarding", "account management", "crm", "upsell", "churn", "relationship", "stakeholder", "kpi"],
    seniority: ["mid", "senior"],
    category: "Customer",
  },
  {
    title: "HR Manager",
    keywords: ["human resources", "recruitment", "hiring", "onboarding", "employee relations", "compliance", "performance management", "benefits", "training", "hris"],
    seniority: ["mid", "senior"],
    category: "HR",
  },
  {
    title: "Financial Analyst",
    keywords: ["financial analysis", "excel", "modeling", "forecasting", "budgeting", "accounting", "reporting", "valuation", "investment", "p&l"],
    seniority: ["junior", "mid", "senior"],
    category: "Finance",
  },
  {
    title: "Graphic Designer",
    keywords: ["photoshop", "illustrator", "indesign", "figma", "branding", "typography", "layout", "visual design", "creative", "adobe creative suite"],
    seniority: ["junior", "mid", "senior"],
    category: "Design",
  },
  {
    title: "Content Strategist",
    keywords: ["content strategy", "seo", "copywriting", "editorial", "cms", "content calendar", "audience", "analytics", "brand voice", "storytelling"],
    seniority: ["mid", "senior"],
    category: "Content",
  },
  {
    title: "Scrum Master",
    keywords: ["scrum", "agile", "sprint", "kanban", "jira", "facilitation", "retrospective", "coaching", "team", "velocity", "backlog"],
    seniority: ["mid", "senior"],
    category: "Management",
  },
  {
    title: "Network Engineer",
    keywords: ["networking", "cisco", "tcp/ip", "firewall", "vpn", "routing", "switching", "dns", "load balancer", "wan", "lan"],
    seniority: ["junior", "mid", "senior"],
    category: "IT",
  },
  {
    title: "Platform Engineer",
    keywords: ["platform", "kubernetes", "docker", "terraform", "aws", "infrastructure", "developer experience", "ci/cd", "automation", "internal tools"],
    seniority: ["mid", "senior"],
    category: "Engineering",
  },
  {
    title: "Technical Lead",
    keywords: ["leadership", "architecture", "code review", "mentoring", "technical", "design", "agile", "team lead", "strategy", "full stack"],
    seniority: ["senior"],
    category: "Engineering",
  },
  {
    title: "Engineering Manager",
    keywords: ["management", "leadership", "hiring", "mentoring", "agile", "roadmap", "cross-functional", "performance review", "strategy", "team building"],
    seniority: ["senior"],
    category: "Management",
  },
  {
    title: "Cybersecurity Analyst",
    keywords: ["cybersecurity", "siem", "threat analysis", "vulnerability", "incident response", "compliance", "risk assessment", "forensics", "malware", "ids"],
    seniority: ["junior", "mid", "senior"],
    category: "Security",
  },
  {
    title: "IT Support Specialist",
    keywords: ["it support", "helpdesk", "troubleshooting", "windows", "active directory", "ticketing", "hardware", "software", "networking", "customer service"],
    seniority: ["junior", "mid"],
    category: "IT",
  },
  {
    title: "SAP Consultant",
    keywords: ["sap", "erp", "abap", "s/4hana", "implementation", "configuration", "module", "integration", "consulting", "business process"],
    seniority: ["mid", "senior"],
    category: "Consulting",
  },
  {
    title: "Salesforce Developer",
    keywords: ["salesforce", "apex", "lightning", "soql", "crm", "visualforce", "integration", "admin", "workflow", "automation"],
    seniority: ["junior", "mid", "senior"],
    category: "Engineering",
  },
  {
    title: "Operations Manager",
    keywords: ["operations", "process improvement", "logistics", "supply chain", "lean", "six sigma", "budget", "team management", "kpi", "efficiency"],
    seniority: ["mid", "senior"],
    category: "Operations",
  },
  {
    title: "Technical Product Manager",
    keywords: ["product management", "technical", "api", "roadmap", "agile", "engineering", "requirements", "stakeholder", "data driven", "architecture"],
    seniority: ["senior"],
    category: "Product",
  },
  {
    title: "Research Scientist",
    keywords: ["research", "publications", "experiment", "analysis", "statistics", "methodology", "phd", "peer review", "data", "laboratory"],
    seniority: ["mid", "senior"],
    category: "Research",
  },
  {
    title: "Consultant",
    keywords: ["consulting", "strategy", "analysis", "client", "presentation", "project management", "stakeholder", "problem solving", "recommendation", "deliverable"],
    seniority: ["junior", "mid", "senior"],
    category: "Consulting",
  },
];

/**
 * Determine seniority level from resume content.
 */
function detectSeniority(resume) {
  const totalYears = estimateExperienceYears(resume.experience || []);
  const allText = [
    resume.summary || "",
    ...(resume.experience || []).flatMap((e) => [e.title || "", ...(e.bullets || [])]),
  ]
    .join(" ")
    .toLowerCase();

  if (
    totalYears >= 8 ||
    /\b(senior|lead|principal|staff|director|vp|head of|chief|architect|manager)\b/i.test(allText)
  ) {
    return "senior";
  }
  if (totalYears >= 3 || /\b(mid[-\s]?level|intermediate)\b/i.test(allText)) {
    return "mid";
  }
  return "junior";
}

/**
 * Rough estimate of total years of experience from date ranges.
 */
function estimateExperienceYears(experience) {
  let total = 0;
  const currentYear = new Date().getFullYear();

  for (const exp of experience) {
    const startYear = extractYear(exp.startDate);
    const endYear = exp.current ? currentYear : extractYear(exp.endDate) || currentYear;

    if (startYear) {
      total += Math.max(0, endYear - startYear);
    }
  }

  return total;
}

function extractYear(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/\b(19|20)\d{2}\b/);
  return match ? parseInt(match[0]) : null;
}

/**
 * Main job matching function.
 * @param {Object} resume - Normalized resume JSON
 * @returns {{ bestFitRoles: Array, detectedSeniority: string }}
 */
function matchJobs(resume) {
  const seniority = detectSeniority(resume);

  // Flatten all resume text for keyword matching
  const allText = [
    resume.summary || "",
    ...(resume.skills || []),
    ...(resume.experience || []).flatMap((e) => [
      e.title || "",
      e.company || "",
      ...(e.bullets || []),
    ]),
    ...(resume.projects || []).flatMap((p) => [
      p.name || "",
      p.description || "",
      ...(p.technologies || []),
    ]),
    ...(resume.certifications || []).map((c) => c.name || ""),
  ]
    .join(" ")
    .toLowerCase();

  const scores = JOB_ROLES_DB.map((role) => {
    // Keyword match score
    let matched = 0;
    const matchedKeywords = [];
    const missingKeywords = [];

    for (const keyword of role.keywords) {
      if (allText.includes(keyword.toLowerCase())) {
        matched++;
        matchedKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    }

    const keywordScore = (matched / role.keywords.length) * 100;

    // Seniority fit bonus
    let seniorityBonus = 0;
    if (role.seniority.includes(seniority)) seniorityBonus = 10;

    // Title match bonus (if resume experience titles overlap)
    let titleBonus = 0;
    for (const exp of resume.experience || []) {
      if (
        exp.title &&
        (exp.title.toLowerCase().includes(role.title.toLowerCase()) ||
          role.title.toLowerCase().includes(exp.title.toLowerCase()))
      ) {
        titleBonus = 15;
        break;
      }
    }

    const totalScore = Math.min(
      Math.round(keywordScore + seniorityBonus + titleBonus),
      100
    );

    return {
      title: role.title,
      category: role.category,
      matchScore: totalScore,
      matchedKeywords,
      missingKeywords: missingKeywords.slice(0, 5), // top 5 missing
      seniorityFit: role.seniority.includes(seniority),
    };
  });

  // Sort by score descending, return top 5
  scores.sort((a, b) => b.matchScore - a.matchScore);
  const bestFitRoles = scores.slice(0, 5);

  // Collect missing skills from top roles
  const missingSkillsSet = new Set();
  for (const role of bestFitRoles) {
    for (const skill of role.missingKeywords) {
      missingSkillsSet.add(skill);
    }
  }

  return {
    bestFitRoles,
    missingSkills: Array.from(missingSkillsSet).slice(0, 10),
    detectedSeniority: seniority,
  };
}

module.exports = { matchJobs, JOB_ROLES_DB };
