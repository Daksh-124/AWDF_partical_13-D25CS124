# Practical 13: AI API Integration into a Web Application

[![CI Pipeline](https://github.com/Daksh-124/AWDF_partical_13-D25CS124/actions/workflows/ci.yml/badge.svg)](https://github.com/Daksh-124/AWDF_partical_13-D25CS124/actions)

**Student Name**: Daksh Digashia  
**Roll No**: D25CS124  
**Course**: Advanced Web Development Frameworks (AWDF)  
**CO / PO**: CO6 / PO3, PO5, PO12  
**Topic**: Third-Party AI API Integration (OpenAI / Gemini), Server-Side Key Security, Graceful Degradation, Rate Limiting, and Responsible AI UI Patterns  

---

## 📌 Project Overview
This repository contains the complete implementation for **Practical 13**, integrating external Generative AI services into our full-stack Task Management application (React 19, Express.js, MongoDB, JWT authentication, in-memory caching, event-driven background processing, and Docker containerization).

The AI feature enables users to automatically generate concise, professional task descriptions and suggested priority levels based on a task title. The architecture enforces strict **server-side credential security**, **sliding window rate limiting**, and **graceful degradation**—ensuring that if external third-party AI APIs are unreachable, unconfigured, or rate-limited, the application continues to operate seamlessly with an intelligent local fallback engine.

---

## 🏗️ Architecture & Flow Diagram

```
                     React Frontend (Task Form)
                                 │
                 Click "✨ Generate description"
                                 ▼
         POST /api/ai/generate-description { title: "..." }
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
                ▼                                 ▼
   aiRateLimiter Middleware             Check OPENAI_API_KEY
  (Max 1 req/task/min/client)        (Stored server-side only)
        │                 │                       │
 Exceeded?             Allowed                    │
        │                 │                       ▼
   HTTP 429               └──────────► OpenAI SDK (gpt-4o-mini)
 (With cooldown)                                  │
                                         Success? │ Error / Outage
                                                  ├────────┐
                                                  ▼        ▼
                                             OpenAI Res  Intelligent Local Fallback
                                                  │        │
                                                  ▼        ▼
                                    HTTP 200 JSON Response
                 { description, suggestedPriority, fallback: true/false, disclaimer }
                                                  │
                                                  ▼
                                      React UI Form Display:
                         • Auto-populates editable description field
                         • Updates suggested priority
                         • Displays visible AI disclaimer badge
                         • Initiates 60-second cooldown timer
```

---

## 🧩 Core Technical Implementations

### 1. Secure Server-Side AI Service (`server/aiService.js`)
* **API Key Security**: The `OPENAI_API_KEY` is accessed exclusively in Node.js via `process.env`. The key is stored in server `.env` (excluded via `.gitignore` and `.dockerignore`) and is **never** exposed to client-side bundles or browser network requests.
* **OpenAI SDK Integration**: Connects via `openai` npm package using model `gpt-4o-mini` with strict JSON schema response formatting and an 8-second timeout guard.
* **Intelligent Local Fallback Engine**: If no API key is provided, or if the API key fails (e.g. invalid key 401, quota exceeded 429, network timeout), the engine analyzes title keywords (`auth`, `jwt`, `cache`, `docker`, `ci`, `test`, `bug`, etc.) to produce accurate technical task descriptions and priority recommendations without crashing the server.

### 2. Rate Limiting Middleware (`aiRateLimiter`)
* Implements a sliding window rate limiter tracking client IP and normalized task title.
* Limits generation requests to **1 AI request per task per minute**.
* Returns HTTP `429 Too Many Requests` with a descriptive message and `retryAfterSeconds` countdown when triggered.

### 3. Responsible AI React UI (`src/components/Projects.jsx`)
* **Loading State**: Displays a loading indicator (`⏳ Generating AI...`) and disables the button during inference to prevent duplicate submissions.
* **Editable Suggestion**: Injects the AI recommendation directly into the controlled `formData.description` input and updates priority, ensuring the user retains full agency to accept, edit, or customize the text.
* **Visible AI Disclaimer**: Renders an alert chip informing the user that the content was machine-generated and must be verified before saving.
* **Cooldown Countdown**: Tracks an active 60-second countdown timer on the button displaying the remaining cooldown period.

### 4. Automated Integration Test Suite (`server/tests/api.test.js`)
Comprehensive test suite verified with **Jest** and **Supertest** covering 10 integration test cases (10/10 passed):
1. `GET /api/db-status` — 200 OK connectivity status.
2. `GET /tasks` without token — 401 Unauthorized security check.
3. `POST /login` — 200 OK with signed JWT token.
4. `GET /tasks` with Bearer token — 200 OK with task list.
5. `GET /api/cache-stats` — 200 OK with cache hit/miss statistics (Practical 9).
6. `GET /api/event-logs` — 200 OK background event audit trail (Practical 10).
7. `GET /api/ai/status` — 200 OK with AI provider configuration metadata.
8. `POST /api/ai/generate-description` — 200 OK with generated description, priority, and disclaimer.
9. `POST /api/ai/generate-description` without title — 400 Bad Request validation check.
10. `POST /api/ai/generate-description` rapid repeat — 429 Too Many Requests rate-limiting enforcement.

---

## 🧪 Local Test Verification

Run the test suite from root or server:
```bash
npm test
```

### Verified Output:
```
PASS server/tests/api.test.js
  ✓ GET /api/db-status returns 200 and connectivity details (152 ms)
  ✓ GET /tasks without JWT token returns 401 Unauthorized (45 ms)
  ✓ POST /login with valid credentials returns 200 and signed JWT token (210 ms)
  ✓ GET /tasks with valid Bearer token returns 200 and task array (78 ms)
  ✓ GET /api/cache-stats returns 200 with hit/miss counters (32 ms)
  ✓ GET /api/event-logs returns 200 with background audit trail (35 ms)
  ✓ GET /api/ai/status returns 200 with AI provider configuration (28 ms)
  ✓ POST /api/ai/generate-description returns 200 with description and disclaimer (41 ms)
  ✓ POST /api/ai/generate-description without title returns 400 Bad Request (25 ms)
  ✓ POST /api/ai/generate-description triggers 429 on rapid repeat request for same title (36 ms)

Test Suites: 1 passed, 1 total
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        9.106 s
Ran all test suites.
```

---

## 🔬 Key Questions & Theoretical Analysis (Viva / Rubric)

### 1. Why must the AI API key be called from the backend rather than directly from the React frontend?
* **Public Client Exposure:** Frontend JavaScript runs in the user's browser. Any API key embedded in React code or passed in browser HTTP requests is fully visible in browser DevTools (Network tab and Source bundles).
* **Credential Theft & Financial Drain:** Third-party AI services bill per token consumed. If an API key is exposed publicly, malicious actors can extract the key and abuse the institution's account with automated scrapers or costly workloads.
* **Server-Side Reverse Proxy:** Calling the AI provider exclusively from the Express backend keeps credentials safe in `.env`, allowing the server to enforce authentication, rate limiting, and payload sanitization before reaching the AI API.

### 2. What does 'graceful degradation' mean in this context, and why does it matter for a feature that depends on a third-party service?
* **Resilience Against External Failures:** Graceful degradation ensures that when an external dependency (OpenAI API) is unavailable, slow, or returning errors (e.g. 401 invalid key, 429 quota reached, 503 outage), the core application continues functioning smoothly.
* **Implementation:** The backend catches all AI API errors within a `try/catch` block, logs the event, and falls back to an intelligent local heuristic generator. The frontend task form remains completely functional, allowing users to create and edit tasks without interruption.

### 3. What are the privacy and governance implications of sending task data to an external AI API, and what kind of data should never be sent?
* **Data Retention & Model Training:** External AI providers may log input prompts or use them for model training unless protected by enterprise Zero-Data-Retention agreements.
* **Prohibited Data Categories:**
  1. **Personally Identifiable Information (PII):** User passwords, email addresses, phone numbers, government IDs, and biometric data.
  2. **Security Credentials:** API keys, database connection strings, JWT secret keys, and encryption certificates.
  3. **Confidential Business Data:** Proprietary trade secrets, financial records, and confidential IP.
* **Governance Best Practices:** Always sanitize inputs before forwarding them to AI endpoints, enforce strict rate limiting, and clearly display an AI disclaimer informing users that suggestions are machine-generated and must be manually verified.

---

## 🚀 Running the Application

### 1. Start the Express Backend (Port 5000)
```bash
cd server
npm install
node server.js
```

### 2. Start the React Frontend (Port 5173)
```bash
npm install
npm run dev
```

### 3. Access the Application
* **Frontend Web Application**: [http://localhost:5173](http://localhost:5173)
* **Backend API & Health**: [http://localhost:5000/api/db-status](http://localhost:5000/api/db-status)
* **AI Configuration Status**: [http://localhost:5000/api/ai/status](http://localhost:5000/api/ai/status)

---

## 📜 Author & Metadata
* **Student Name**: Daksh Digashia  
* **Roll No**: D25CS124  
* **Course**: Advanced Web Development Frameworks (AWDF)  
* **Repository**: [https://github.com/Daksh-124/AWDF_partical_13-D25CS124](https://github.com/Daksh-124/AWDF_partical_13-D25CS124)  
* **Academic Year**: 2026
