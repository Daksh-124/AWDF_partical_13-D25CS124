/**
 * Practical 13: AI Service Integration Module
 * Student: Daksh Digashia (Roll No: D25CS124) | Course: AWDF
 *
 * Implements:
 * 1. Secure Server-Side Third-Party AI API Calls (OpenAI / Gemini)
 * 2. Rate Limiting Middleware (max 1 AI request per task per minute)
 * 3. Graceful Degradation & Intelligent Local Fallback Engine
 * 4. Responsible AI Disclaimers & Privacy Guardrails
 */

const OpenAI = require('openai');

// Rate limit tracker: Key -> timestamp (ms)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute per task title per client

/**
 * Intelligent Local Fallback Generator
 * Generates context-aware task descriptions and priority suggestions
 * when third-party AI APIs are unreachable, unconfigured, or rate-limited.
 */
function generateLocalFallback(title) {
  const lower = (title || '').toLowerCase();
  let description = '';
  let suggestedPriority = 'medium';

  if (lower.includes('auth') || lower.includes('jwt') || lower.includes('login') || lower.includes('security')) {
    description = 'Implement secure authentication pipeline, bcrypt password hashing, and JWT authorization middleware for protected routes.';
    suggestedPriority = 'high';
  } else if (lower.includes('cache') || lower.includes('redis') || lower.includes('performance')) {
    description = 'Configure in-memory caching layer with TTL expiration and cache invalidation strategies to optimize database read latency.';
    suggestedPriority = 'medium';
  } else if (lower.includes('docker') || lower.includes('container') || lower.includes('compose')) {
    description = 'Containerize application components using multi-stage Dockerfiles and orchestrate services via Docker Compose with bridge networking.';
    suggestedPriority = 'medium';
  } else if (lower.includes('ci') || lower.includes('cd') || lower.includes('pipeline') || lower.includes('github action')) {
    description = 'Automate testing, linting, and continuous integration workflow using GitHub Actions to validate code quality on every push.';
    suggestedPriority = 'high';
  } else if (lower.includes('event') || lower.includes('notification') || lower.includes('async')) {
    description = 'Implement non-blocking event-driven background processing using Node.js native EventEmitter for asynchronous task lifecycle events.';
    suggestedPriority = 'medium';
  } else if (lower.includes('test') || lower.includes('jest') || lower.includes('supertest')) {
    description = 'Develop comprehensive automated unit and integration tests with assertion coverage for HTTP status codes and error paths.';
    suggestedPriority = 'medium';
  } else if (lower.includes('bug') || lower.includes('fix') || lower.includes('error') || lower.includes('issue')) {
    description = 'Investigate root cause of reported defect, reproduce in isolated test environment, apply corrective patch, and verify fix.';
    suggestedPriority = 'high';
  } else if (lower.includes('ui') || lower.includes('frontend') || lower.includes('css') || lower.includes('react')) {
    description = 'Design and implement responsive, accessible UI components with loading states, error boundaries, and seamless user interaction.';
    suggestedPriority = 'low';
  } else {
    description = `Review technical requirements, implement core functionality, and conduct validation testing for "${title}".`;
    suggestedPriority = 'medium';
  }

  return { description, suggestedPriority };
}

/**
 * Rate Limiting Middleware
 * Enforces: Maximum 1 AI request per task title per IP/client per minute
 */
function aiRateLimiter(req, res, next) {
  const clientIp = req.ip || req.headers['x-forwarded-for'] || 'client';
  const taskTitle = (req.body.title || '').trim().toLowerCase();

  if (!taskTitle) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Task title is required to generate an AI description.',
      fallback: true
    });
  }

  const rateKey = `${clientIp}::${taskTitle}`;
  const now = Date.now();
  const lastRequest = rateLimitMap.get(rateKey);

  if (lastRequest && (now - lastRequest) < RATE_LIMIT_WINDOW_MS) {
    const remainingSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - lastRequest)) / 1000);
    return res.status(429).json({
      error: 'Rate Limit Exceeded',
      message: `Rate limit active: Please wait ${remainingSeconds}s before requesting another AI description for this task title.`,
      retryAfterSeconds: remainingSeconds,
      fallback: false
    });
  }

  // Update timestamp
  rateLimitMap.set(rateKey, now);

  // Periodic cleanup of stale rate-limit entries (older than 5 minutes)
  if (rateLimitMap.size > 200) {
    for (const [key, timestamp] of rateLimitMap.entries()) {
      if (now - timestamp > 5 * 60 * 1000) {
        rateLimitMap.delete(key);
      }
    }
  }

  next();
}

/**
 * Generates an AI-assisted description for a given task title.
 * Connects to OpenAI if OPENAI_API_KEY is present;
 * otherwise gracefully falls back to an intelligent local generator.
 */
async function generateDescription(title, currentDescription = '') {
  const apiKey = process.env.OPENAI_API_KEY;
  const isKeyConfigured = apiKey && apiKey.trim() !== '' && !apiKey.includes('your_key_here');

  // If no OpenAI API key is configured, activate graceful fallback immediately
  if (!isKeyConfigured) {
    console.log(`[AI SERVICE] OPENAI_API_KEY unconfigured. Utilizing intelligent graceful fallback for: "${title}"`);
    const fallback = generateLocalFallback(title);
    return {
      description: fallback.description,
      suggestedPriority: fallback.suggestedPriority,
      fallback: true,
      provider: 'Local Graceful Fallback Engine (Offline Mode)',
      reason: 'No third-party OpenAI API key configured in backend .env',
      disclaimer: '⚠️ AI-generated suggestion: Please review, edit, and verify before saving.'
    };
  }

  // Attempt OpenAI API Call with a timeout guard
  try {
    const client = new OpenAI({
      apiKey: apiKey.trim(),
      timeout: 8000 // 8 second timeout to prevent hanging
    });

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an agile software development task assistant. Given a task title, write a concise 1-2 sentence description explaining the goal and deliverables. Suggest a priority ("low", "medium", or "high"). Respond in valid JSON with keys: "description" and "suggestedPriority".'
        },
        {
          role: 'user',
          content: `Task Title: "${title}"`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const rawContent = completion.choices[0]?.message?.content || '{}';
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      parsed = { description: rawContent, suggestedPriority: 'medium' };
    }

    return {
      description: parsed.description || rawContent,
      suggestedPriority: parsed.suggestedPriority || 'medium',
      fallback: false,
      provider: 'OpenAI (gpt-4o-mini)',
      disclaimer: '⚠️ AI-generated suggestion: Please review, edit, and verify before saving.'
    };
  } catch (err) {
    console.warn(`[AI SERVICE WARNING] OpenAI API call failed (${err.name || 'Error'}: ${err.message}). Activating graceful degradation.`);

    // Graceful degradation: The application continues to function normally
    const fallback = generateLocalFallback(title);
    return {
      description: fallback.description,
      suggestedPriority: fallback.suggestedPriority,
      fallback: true,
      provider: 'Local Graceful Fallback Engine (Degraded Mode)',
      reason: `Third-party API error (${err.status || err.message}). Graceful fallback activated.`,
      disclaimer: '⚠️ AI-generated suggestion: Please review, edit, and verify before saving.'
    };
  }
}

module.exports = {
  generateDescription,
  aiRateLimiter,
  generateLocalFallback
};
