# Practical 12: CI/CD Pipeline with GitHub Actions

[![CI Pipeline](https://github.com/Daksh-124/AWDF_partical_12-D25CS124/actions/workflows/ci.yml/badge.svg)](https://github.com/Daksh-124/AWDF_partical_12-D25CS124/actions)

**Student Name**: Daksh Digashia  
**Roll No**: D25CS124  
**Course**: Advanced Web Development Frameworks (AWDF)  
**CO / PO**: CO5 / PO3, PO5  
**Topic**: Continuous Integration (CI), GitHub Actions Workflow, Automated Jest & Supertest Testing, Code Quality Linting, and Container Build Verification  

---

## 📌 Project Overview
This repository contains the complete implementation for **Practical 12**, establishing an enterprise-grade **Continuous Integration & Automated Testing Pipeline** using **GitHub Actions**.

Whenever code is pushed or a pull request is submitted to the `main` branch, the CI pipeline automatically runs in a GitHub-hosted cloud virtual machine (`ubuntu-latest`). It checks out the codebase, sets up the Node.js runtime, installs dependencies, lints source code using `oxlint`, executes automated backend integration tests using **Jest** and **Supertest**, verifies the React Vite production build, and validates Docker Compose container buildability.

---

## 🔄 What Changed from Practical 11 to Practical 12?

| Feature / Aspect | Practical 11 (Containerization) | Practical 12 (CI/CD Pipeline) |
| :--- | :--- | :--- |
| **Primary Goal** | Package app & dependencies into reproducible Docker containers (`Dockerfile`, `docker-compose.yml`). | Automate linting, building, and running test assertions on every code push via GitHub Actions. |
| **Execution Context** | **Local Machine**: Developer manually executes `docker-compose up` to run containers locally. | **Cloud Runners**: Hosted virtual machines (`ubuntu-latest`) spin up automatically upon git events (`push` / `pull_request`). |
| **Automated Testing** | ❌ **No automated test assertions**. Containers only verified that services started and port 5000/5173 was open. | ✅ **Jest & Supertest Test Suite**: Programmatic test assertions verifying status codes, auth headers, token signing, cache hits, and event logging. |
| **Pipeline Workflow** | ❌ None. Manual multi-step build (`docker-compose build`). | ✅ **Declarative Workflow (`.github/workflows/ci.yml`)**: Automated multi-stage pipeline (`lint` ➔ `build-and-test` ➔ `docker-build-check`). |
| **Quality Gate / Barrier** | Broken code or logic regressions would still build and deploy into Docker containers undetected. | ❌ Broken tests or lint errors fail the build (Red ❌), blocking faulty code before reaching staging/production. |
| **Visibility & Feedback** | Console terminal outputs on localhost. | Green checkmark (✔) / Red X (✖) badges directly inside GitHub commits and pull requests. |

---

## 🏗️ GitHub Actions CI Pipeline Architecture

```
                   git push origin main / Pull Request
                                    │
                                    ▼
                     GitHub Actions Webhook Trigger
                                    │
                     ┌──────────────┴──────────────┐
                     │ Job 1: lint                 │
                     │ - Node 20 Setup             │
                     │ - oxlint (Code Quality)     │
                     └──────────────┬──────────────┘
                                    │ (needs: lint)
                                    ▼
                     ┌─────────────────────────────┐
                     │ Job 2: build-and-test       │
                     │ - Vite Frontend Build       │
                     │ - Jest + Supertest Suite    │
                     │   * 6 Automated Assertions  │
                     └──────────────┬──────────────┘
                                    │ (needs: build-and-test)
                                    ▼
                     ┌─────────────────────────────┐
                     │ Job 3: docker-build-check   │
                     │ - Docker Compose Build      │
                     │ - Container Syntax Validation│
                     └──────────────┬──────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
 ✅ Pipeline Passed (Green ✔)                         ❌ Pipeline Failed (Red ✖)
 Ready for deployment / merge                        Blocks merge; logs exact error
```

---

## 📁 CI/CD Pipeline Implementation Details

### 1. Workflow Configuration (`.github/workflows/ci.yml`)
Located at `.github/workflows/ci.yml`, configured with:
* **Triggers**: `push` and `pull_request` on `branches: [main]`.
* **Job 1 (`lint`)**: Installs dependencies and runs static analysis (`oxlint`) to catch syntax flaws, unused variables, and formatting issues early.
* **Job 2 (`build-and-test`)**: Depends on `lint`. Builds the production Vite bundle (`npm run build`) and runs the backend test suite via `npm test` with `NODE_ENV=test`.
* **Job 3 (`docker-build-check`)**: Verifies that the multi-container configuration from Practical 11 builds successfully (`docker compose build`) without runtime regressions.

### 2. Automated Integration Test Suite (`server/tests/api.test.js`)
Built with **Jest** and **Supertest** covering 6 core assertions:
1. `GET /api/db-status` ➔ Responds with status `200` and database connectivity metadata.
2. `GET /tasks` without token ➔ Verifies route security by expecting `401 Unauthorized`.
3. `POST /login` ➔ Authenticates test user and asserts a valid signed JWT token is returned.
4. `GET /tasks` with Bearer Token ➔ Authorizes with JWT and asserts status `200` returning the task array.
5. `GET /api/cache-stats` ➔ Validates In-Memory Cache metrics (Practical 9) returning hit/miss counters.
6. `GET /api/event-logs` ➔ Validates Native EventEmitter audit log (Practical 10) returning background events.

---

## 🧪 Local Test Verification

Run the test suite locally with:
```bash
npm test
```

### Verified Output:
```
> student-portfolio@0.0.0 test
> npm --prefix server test

> task-manager-api@1.0.0 test
> jest --detectOpenHandles --forceExit --runInBand

PASS server/tests/api.test.js
  ✓ GET /api/db-status returns 200 with connection state (152 ms)
  ✓ GET /tasks without token returns 401 Unauthorized (45 ms)
  ✓ POST /login returns 200 and a signed JWT token (210 ms)
  ✓ GET /tasks with valid Bearer token returns 200 and task array (78 ms)
  ✓ GET /api/cache-stats returns 200 with cache hit/miss statistics (32 ms)
  ✓ GET /api/event-logs returns 200 with background audit trail (35 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        7.362 s
Ran all test suites.
```

---

## 🔬 Key Questions & Theoretical Analysis (Viva / Rubric)

### 1. Difference between Continuous Integration (CI) and Continuous Delivery/Deployment (CD)
* **Continuous Integration (CI)**:
  - Focuses on developer code changes.
  - Automatically builds and tests code each time a commit is pushed.
  - Objective: Detect integration problems, regressions, and syntax bugs immediately.
* **Continuous Delivery (CD)**:
  - Takes tested code from CI and automatically packages/stages it in staging or testing environments.
  - Ensures software is in a deployable state at any given moment, with deployment to production gated by manual approval.
* **Continuous Deployment (CD)**:
  - Fully automates the entire progression from commit to live production without any human approval bottleneck, provided all tests in CI pass.

### 2. How Automated Testing on Every Push Catches Bugs Early
* **Immediate Feedback**: Feedback is given within minutes of pushing code rather than weeks later in QA.
* **Narrow Blast Radius**: Since tests run on small, incremental commits, finding which commit caused a bug is straightforward.
* **Regression Protection**: Ensures that new features added to the application do not break existing features (e.g. JWT auth, caching, event logging).
* **Automated Guardrails**: Teams can configure branch protection rules so GitHub prevents merging pull requests that fail automated tests.

### 3. Why Tests Should Not Check Only Valid (Happy Path) Inputs
* **Negative & Boundary Testing**: Real-world users and potential attackers send malformed, expired, or malicious inputs.
* **Security Validation**: Asserting that `GET /tasks` without a Bearer token returns `401 Unauthorized` ensures private user tasks cannot be accessed by unauthenticated callers.
* **Graceful Degradation**: Testing invalid routes or invalid parameters guarantees the server responds with clear HTTP client error codes (`400`, `401`, `404`) rather than crashing with unhandled exceptions (`500 Internal Server Error`).

---

## 📜 Author & Metadata
* **Student Name**: Daksh Digashia  
* **Roll No**: D25CS124  
* **Course**: Advanced Web Development Frameworks (AWDF)  
* **Repository**: [https://github.com/Daksh-124/AWDF_partical_12-D25CS124](https://github.com/Daksh-124/AWDF_partical_12-D25CS124)  
* **Academic Year**: 2026
