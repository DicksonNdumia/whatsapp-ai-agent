/**
 * Portfolio Service
 * Handles all portfolio-related queries and response generation
 * Formats responses for WhatsApp with emojis and proper spacing
 */

import ABOUT_ME from "../data/aboutMe.js";
import PROJECTS from "../data/projects.js";
import { detectPortfolioQueryType } from "../utils/portfolioKeywords.js";

/**
 * Generate a formatted "About Me" response
 * @returns {string} Formatted about me response for WhatsApp
 */
export const generateAboutResponse = () => {
  const { name, title, bio, location, skills, services } = ABOUT_ME;

  let response = `👋 *Hi, I'm ${name}*\n\n`;

  response += `💻 *${title}*\n`;
  response += `📍 ${location}\n\n`;

  response += `*About Me:*\n${bio}\n\n`;

  response += `*🛠️ Key Skills:*\n`;
  skills.slice(0, 8).forEach((skill) => {
    response += `• ${skill}\n`;
  });
  response += `_...and more_\n\n`;

  response += `*🚀 Services:*\n`;
  services.slice(0, 6).forEach((service) => {
    response += `• ${service}\n`;
  });

  return response;
};

/**
 * Generate a formatted "Projects" response
 * @returns {string} Formatted projects list for WhatsApp
 */
export const generateProjectsResponse = () => {
  let response = `📂 *My Recent Projects*\n\n`;

  PROJECTS.forEach((project, index) => {
    response += `*${index + 1}. ${project.name}*\n`;
    response += `_${project.description}_\n`;
    response += `🌐 Live: ${project.liveLink}\n`;
    response += `💻 GitHub: ${project.githubLink}\n`;
    response += `Tech: ${project.technologies.join(", ")}\n\n`;
  });

  response += `See more projects on my portfolio:\n${ABOUT_ME.portfolio}`;

  return response;
};

/**
 * Generate a formatted "Services" response
 * @returns {string} Formatted services list for WhatsApp
 */
export const generateServicesResponse = () => {
  const { services } = ABOUT_ME;

  let response = `*🚀 Services I Offer*\n\n`;

  services.forEach((service) => {
    response += `✓ ${service}\n`;
  });

  response += `\n*Let's discuss your project!*\n`;
  response += `📧 Email: ${ABOUT_ME.email}\n`;
  response += `🔗 Portfolio: ${ABOUT_ME.portfolio}`;

  return response;
};

/**
 * Generate a formatted "Skills" response
 * @returns {string} Formatted skills list for WhatsApp
 */
export const generateSkillsResponse = () => {
  const { skills, title } = ABOUT_ME;

  let response = `*💡 My Technical Skills*\n`;
  response += `*${title}*\n\n`;

  // Group skills by category
  const frontendSkills = skills.filter((s) =>
    ["React", "JavaScript", "Tailwind", "Framer"].some((tech) =>
      s.includes(tech)
    )
  );
  const backendSkills = skills.filter((s) =>
    ["Node.js", "Express", "MongoDB", "PostgreSQL"].some((tech) =>
      s.includes(tech)
    )
  );
  const otherSkills = skills.filter(
    (s) => !frontendSkills.includes(s) && !backendSkills.includes(s)
  );

  if (frontendSkills.length > 0) {
    response += `*Frontend:*\n`;
    frontendSkills.forEach((skill) => {
      response += `• ${skill}\n`;
    });
    response += `\n`;
  }

  if (backendSkills.length > 0) {
    response += `*Backend:*\n`;
    backendSkills.forEach((skill) => {
      response += `• ${skill}\n`;
    });
    response += `\n`;
  }

  if (otherSkills.length > 0) {
    response += `*Other:*\n`;
    otherSkills.forEach((skill) => {
      response += `• ${skill}\n`;
    });
  }

  return response;
};

/**
 * Generate a formatted "Contact" response
 * @returns {string} Formatted contact information for WhatsApp
 */
export const generateContactResponse = () => {
  const { name, email, github, linkedin, portfolio } = ABOUT_ME;

  let response = `📞 *Get In Touch*\n\n`;

  response += `*Let's connect!*\n`;
  response += `I'm always interested in discussing new projects and opportunities.\n\n`;

  response += `📧 *Email:* ${email}\n`;
  response += `🔗 *Portfolio:* ${portfolio}\n`;
  response += `💼 *LinkedIn:* ${linkedin}\n`;
  response += `🐙 *GitHub:* ${github}\n\n`;

  response += `Feel free to reach out – I'd love to hear about your project! 🚀`;

  return response;
};

/**
 * Generate a formatted "GitHub" response
 * @returns {string} Formatted GitHub information for WhatsApp
 */
export const generateGitHubResponse = () => {
  const { name, github } = ABOUT_ME;

  let response = `🐙 *GitHub Profile*\n\n`;

  response += `Check out my work on GitHub:\n`;
  response += `${github}\n\n`;

  response += `You'll find all my open-source projects, code samples, and contributions there.\n`;
  response += `Feel free to explore and reach out if you'd like to collaborate! 👨‍💻`;

  return response;
};

/**
 * Generate a general "Portfolio" response
 * Combines all key information
 * @returns {string} Formatted general portfolio response for WhatsApp
 */
export const generatePortfolioResponse = () => {
  const { name, title, portfolio, email, github, skills, services } = ABOUT_ME;

  let response = `👋 *Hi, I'm ${name}*\n\n`;

  response += `💻 *${title}*\n\n`;

  response += `*What I Do:*\n`;
  services.slice(0, 5).forEach((service) => {
    response += `✓ ${service}\n`;
  });
  response += `...and more!\n\n`;

  response += `*Quick Skills Overview:*\n`;
  skills.slice(0, 6).forEach((skill) => {
    response += `• ${skill}\n`;
  });
  response += `\n`;

  response += `*🔗 Links:*\n`;
  response += `🌐 Portfolio: ${portfolio}\n`;
  response += `🐙 GitHub: ${github}\n`;
  response += `📧 Email: ${email}\n\n`;

  response += `📂 *Want to see my recent projects?*\n`;
  response += `Just ask me about my projects! I'd love to show you what I've built.\n\n`;

  response += `Let's build something awesome together! 🚀`;

  return response;
};

/**
 * Handle portfolio query by detecting the query type and returning appropriate response
 * @param {string} message - User message
 * @returns {string} Appropriate portfolio response
 */
export const handlePortfolioQuery = (message) => {
  const queryType = detectPortfolioQueryType(message);

  switch (queryType) {
    case "about":
      return generateAboutResponse();

    case "projects":
      return generateProjectsResponse();

    case "services":
      return generateServicesResponse();

    case "skills":
      return generateSkillsResponse();

    case "contact":
      return generateContactResponse();

    case "github":
      return generateGitHubResponse();

    case "freelance":
      return generateServicesResponse();

    default:
      return generatePortfolioResponse();
  }
};

export default {
  generateAboutResponse,
  generateProjectsResponse,
  generateServicesResponse,
  generateSkillsResponse,
  generateContactResponse,
  generateGitHubResponse,
  generatePortfolioResponse,
  handlePortfolioQuery,
};
