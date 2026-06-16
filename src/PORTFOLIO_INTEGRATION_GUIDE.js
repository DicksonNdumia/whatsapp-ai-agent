/**
 * Portfolio Integration Guide
 *
 * This document shows how to integrate the portfolio feature into your WhatsApp AI Agent
 * The portfolio system allows the bot to answer questions about you, your services,
 * and projects WITHOUT calling Gemini/OpenAI.
 *
 * ARCHITECTURE:
 *
 * src/
 * ├── data/
 * │   ├── aboutMe.js          (Personal info, skills, services)
 * │   └── projects.js         (Portfolio projects)
 * │
 * ├── services/
 * │   └── portfolioService.js (Response generation logic)
 * │
 * ├── utils/
 * │   └── portfolioKeywords.js (Query detection & keywords)
 * │
 * └── controller/
 *     └── webHook.controller.js (UPDATED - integrates portfolio check)
 *
 */

/**
 * STEP 1: UPDATE webHook.controller.js
 *
 * Add portfolio service imports and check before calling Gemini
 */

// Add these imports at the top of webHook.controller.js:
// import { isPortfolioQuery, handlePortfolioQuery } from "../services/portfolioService.js";

/**
 * STEP 2: MODIFY handleWebhook function
 *
 * Insert portfolio check BEFORE calling generateReply (Gemini)
 */

/**
 * STEP 3: HOW IT WORKS
 *
 * USER SENDS: "Tell me about your projects"
 * │
 * ├─→ isPortfolioQuery() checks if message contains portfolio keywords
 * ├─→ YES: handlePortfolioQuery() detects query type as "projects"
 * ├─→ Calls generateProjectsResponse() from portfolioService
 * ├─→ Returns formatted WhatsApp response WITHOUT calling Gemini
 * ├─→ Message sent to user instantly
 * └─→ Response saved to database
 *
 * USER SENDS: "What is 2 + 2?"
 * │
 * ├─→ isPortfolioQuery() checks if message contains portfolio keywords
 * ├─→ NO: Continue to normal flow
 * ├─→ Call generateReply() (Gemini API)
 * ├─→ Return AI response
 * └─→ Message sent to user
 */

/**
 * STEP 4: AVAILABLE PORTFOLIO QUERIES
 *
 * The portfolio service responds to:
 *
 * • About Me:
 *   "who are you", "about you", "tell me about yourself"
 *   Response: Full intro, skills, services
 *
 * • Projects:
 *   "projects", "portfolio", "showcase", "recent work"
 *   Response: Project list with links and tech stack
 *
 * • Services:
 *   "services", "what do you do", "what can you build"
 *   Response: Services offered with contact info
 *
 * • Skills:
 *   "skills", "tech stack", "technologies"
 *   Response: Technical skills by category
 *
 * • Contact:
 *   "contact", "hire", "get in touch"
 *   Response: Email, links, contact information
 *
 * • GitHub:
 *   "github", "source code", "code repository"
 *   Response: GitHub profile link
 *
 * • Freelance:
 *   "freelance", "available", "hire me"
 *   Response: Services and contact info
 */

/**
 * STEP 5: CUSTOMIZATION
 *
 * Update personal information:
 * → Edit src/data/aboutMe.js
 *   - Update name, email, links
 *   - Add/remove skills
 *   - Modify services offered
 *
 * Update projects:
 * → Edit src/data/projects.js
 *   - Add new projects
 *   - Update project descriptions and links
 *   - Change technologies
 *
 * Update keywords:
 * → Edit src/utils/portfolioKeywords.js
 *   - Add new keywords to trigger portfolio responses
 *   - Create more specific query types
 *
 * Update response format:
 * → Edit src/services/portfolioService.js
 *   - Change emoji styles
 *   - Adjust response length
 *   - Add more sophisticated formatting
 */

/**
 * STEP 6: BENEFITS
 *
 * ✅ Cost Savings:
 *    - Avoid Gemini/OpenAI API calls for portfolio queries
 *    - Each API call saved = money saved
 *
 * ✅ Performance:
 *    - Instant response (no API latency)
 *    - Better user experience
 *
 * ✅ Consistency:
 *    - Guaranteed formatting and accuracy
 *    - No AI hallucinations about your portfolio
 *
 * ✅ Control:
 *    - Full control over portfolio information
 *    - Easy to update without code changes
 *
 * ✅ Scalability:
 *    - Modular architecture
 *    - Easy to add more query types
 *    - Simple to maintain
 */

/**
 * STEP 7: COMPLETE UPDATED CONTROLLER
 */
