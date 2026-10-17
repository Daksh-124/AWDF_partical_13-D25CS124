# Practical 7: Authentication and Middleware Pipeline (JWT + bcrypt + React + Express + MongoDB)

**Student Name**: Daksh Digashia  
**Roll No**: D25CS124  
**Course**: Advanced Web Development Frameworks (AWDF)  
**Repository**: [AWDF_partical_7-D25CS124](https://github.com/Daksh-124/AWDF_partical_7-D25CS124)

---

## 📌 Project Overview
This repository contains the complete implementation for **Practical 7**, introducing **JWT-based Authentication**, **Password Hashing with bcrypt**, and an **Express Middleware Pipeline** into our full-stack React + Node.js + Express + MongoDB Task Management architecture.

It protects CRUD task operations behind a secure authentication pipeline, validates incoming payloads before controllers are executed, and enables user-scoped task ownership with persistent session management on the React frontend.

---

## 🏗️ Architecture & Middleware Pipeline

`
POST /register ──> validateRegister ──> bcrypt.hash (salt 10) ──> save User ──> 201 Created
POST /login    ──> validateLogin    ──> bcrypt.compare ──> sign JWT (1h) ──> return Token + User

Protected Route Flow:
Client Request (Authorization: Bearer <token>)
   │
   ▼
[authMiddleware] (middleware/auth.js)
   ├── Verifies JWT via jwt.verify()
   ├── Handles TokenExpiredError & JsonWebTokenError
   └── Attaches req.user = { id, email, name }
   │
   ▼
[validateTaskInput] (middleware/validate.js)
   ├── Validates title, description, priority, completed
   └── Rejects malformed bodies with 400 Bad Request
   │
   ▼
Controller & MongoDB (models/Task.js)
   └── Performs task CRUD scoped to req.user.id
`

---

## 🚀 How to Run Locally

### Prerequisites
* **Node.js (v18+)** and **npm**
* **MongoDB** running on mongodb://127.0.0.1:27017 (or Atlas connection string via MONGO_URI)

---

### Step 1: Start the Backend (Express + JWT Auth + MongoDB)
`ash
# Navigate to backend directory
cd server

# Install dependencies (express, mongoose, cors, dotenv, bcryptjs, jsonwebtoken)
npm install

# Start Express server on port 5000
node server.js
`
> Server runs on: **http://localhost:5000**  
> Database status: **http://localhost:5000/api/db-status**  
> Pre-seeded demo user: **daksh@example.com** / **password123**

---

### Step 2: Start the Frontend (React + Vite)
`ash
# In the project root directory
npm install
npm run dev
`
> React client runs on: **http://localhost:5173**  
> Tasks & Auth dashboard: **http://localhost:5173/projects**

---

## 📡 RESTful API Endpoints (http://localhost:5000)

| HTTP Method | Route Endpoint | Auth Required | Description | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | /register | No | Registers user with email, name, hashed password | 201 Created / 400 |
| **POST** | /login | No | Authenticates credentials, returns signed JWT token | 200 OK / 400 / 401 |
| **GET** | /me | Yes (Bearer <token>) | Returns profile of currently authenticated user | 200 OK / 401 |
| **GET** | /tasks | Yes (Bearer <token>) | Retrieves tasks scoped to authenticated user | 200 OK / 401 |
| **POST** | /tasks | Yes (Bearer <token>) | Creates task assigned to authenticated user | 201 Created / 400 / 401 |
| **PUT** | /tasks/:id | Yes (Bearer <token>) | Updates user-owned task | 200 OK / 400 / 401 / 404 |
| **DELETE** | /tasks/:id | Yes (Bearer <token>) | Deletes user-owned task | 200 OK / 401 / 404 |
| **GET** | /api/db-status | No | MongoDB connection health check | 200 OK |

---

## ✨ Features Implemented in Practical 7

1. **Password Hashing with bcrypt**:
   - Salt rounds: 10
   - Passwords are encrypted before storage in MongoDB; raw passwords are never saved.

2. **JWT Authentication Pipeline**:
   - Issues signed JSON Web Tokens upon successful /login or /register.
   - Secret key configured via JWT_SECRET environment variable.
   - Tokens configured with a 1-hour expiration lifespan (1h).

3. **Custom Middleware Architecture**:
   - uthMiddleware: Extracts Authorization: Bearer <token>, verifies signature, handles expired tokens gracefully, and attaches decoded user to eq.user.
   - alidateRegister & alidateLogin: Validates email patterns and password requirements (minimum 6 characters).
   - alidateTaskInput: Sanitizes and validates task creation and update payloads before database operations.

4. **Frontend Auth Experience**:
   - Integrated tabbed authentication card (src/components/AuthCard.jsx) supporting Sign In and Sign Up.
   - 1-Click Demo Login button for test account (daksh@example.com / password123).
   - Profile badge and logout button in navigation bar.
   - Centralized token management via localStorage with automatic Bearer token injection on all /tasks API requests.
   - Automatic session invalidation and re-login prompt if server responds with 401 Token expired.

---

## 📜 Author
* **Student**: Daksh Digashia  
* **Roll No**: D25CS124  
* **Academic Year**: 2026
