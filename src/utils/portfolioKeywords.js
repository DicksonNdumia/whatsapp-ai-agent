/**
 * Portfolio Keywords Utility
 * Keywords and phrases that trigger portfolio-related responses
 * instead of sending requests to Gemini/OpenAI
 */

/**
 * List of keywords and phrases that match portfolio queries
 * Used for case-insensitive matching
 */
export const PORTFOLIO_KEYWORDS = [
  "who are you",
  "who am i talking to",
  "about you",
  "about me",
  "portfolio",
  "projects",
  "services",
  "services offered",
  "skills",
  "developer",
  "github",
  "contact",
  "hire",
  "freelance",
  "what do you do",
  "what can you build",
  "your experience",
  "your skills",
  "tell me about yourself",
  "what services",
  "your projects",
  "linkedin",
  "email",
  "reach you",
  "contact info",
  "get in touch",
  "work experience",
  "professional background",
  "your background",
  "what technologies",
  "tech stack",
  "recent work",
  "showcase",
  "portfolio link",
  "github link",
  "your website",
  "personal website",
];

/**
 * Keywords for specific portfolio query types
 */
export const SPECIFIC_KEYWORDS = {
  about: ["who are you", "about you", "tell me about yourself", "your background", "professional background"],
  projects: ["projects", "portfolio", "recent work", "showcase", "your work", "what have you built"],
  services: ["services", "services offered", "what do you do", "what can you help with", "what can you build"],
  skills: ["skills", "tech stack", "technologies", "technical skills", "programming languages"],
  contact: ["contact", "hire", "email", "reach you", "get in touch", "contact info", "reach out"],
  github: ["github", "github link", "source code", "code repository"],
  freelance: ["freelance", "available", "hire me", "contract", "work with"],
};

/**
 * Check if a message is asking about portfolio/about me
 * Performs case-insensitive matching against keywords
 * @param {string} message - User message to check
 * @returns {boolean} True if message is a portfolio query
 */
export const isPortfolioQuery = (message) => {
  if (!message || typeof message !== "string") {
    return false;
  }

  const normalizedMessage = message.toLowerCase().trim();

  return PORTFOLIO_KEYWORDS.some((keyword) =>
    normalizedMessage.includes(keyword)
  );
};

/**
 * Detect the type of portfolio query
 * @param {string} message - User message
 * @returns {string} Query type: 'about', 'projects', 'services', 'skills', 'contact', 'github', or 'general'
 */
export const detectPortfolioQueryType = (message) => {
  if (!message || typeof message !== "string") {
    return "general";
  }

  const normalizedMessage = message.toLowerCase().trim();

  // Check specific query types in order of priority
  for (const [type, keywords] of Object.entries(SPECIFIC_KEYWORDS)) {
    if (keywords.some((keyword) => normalizedMessage.includes(keyword))) {
      return type;
    }
  }

  return "general";
};

export default {
  PORTFOLIO_KEYWORDS,
  SPECIFIC_KEYWORDS,
  isPortfolioQuery,
  detectPortfolioQueryType,
};
