# Practical 6: Full Stack Integration (React + Node.js + Express + MongoDB)

**Student Name**: Daksh Digashia  
**Roll No**: D25CS124  
**Course**: Advanced Web Development Frameworks (AWDF)  
**Repository**: [AWDF_partical_6-D25CS124](https://github.com/Daksh-124/AWDF_partical_6-D25CS124)

---

## 📌 Project Overview
This repository contains the complete full-stack integration for **Practical 6**, connecting a modern **React 18 Single-Page Application (Vite)** to a **Node.js / Express RESTful API** and **MongoDB database (via Mongoose ODM)**.

It provides end-to-end CRUD functionality (Create, Read, Update, Delete) with real-time optimistic UI updates, delete confirmation dialogues, floating toast notifications, and persistent MongoDB database storage.

---

## 🏗️ Architecture & Data Flow

```
React Frontend (localhost:5173)
   │
   │ Fetch API requests via CORS
   ▼
Express Backend (localhost:5000)
   ├── server/server.js (Middleware Pipeline, CORS, Logging, Validation)
   └── server/models/Task.js (Mongoose Schema & Pre-save Hooks)
   │
   │ Mongoose ODM Driver
   ▼
MongoDB Database
   └── tasks collection (Title, Description, Priority, Completed, CreatedAt)
```

---

## 🚀 How to Run the Full-Stack Application Locally

### Prerequisites
* **Node.js (v18+)** and **npm** installed
* **MongoDB** service running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas connection string)

---

### Step 1: Start the Backend (Express + MongoDB)
Open a terminal and run:
```bash
# Navigate to the backend directory
cd server

# Install backend dependencies
npm install

# Start the Express server on port 5000
node server.js
```
> The backend server will start on: **`http://localhost:5000`**  
> Tasks endpoint: **`http://localhost:5000/tasks`**  
> Database status: **`http://localhost:5000/api/db-status`**

---

### Step 2: Start the Frontend (React + Vite)
Open a second terminal in the project root directory and run:
```bash
# Install frontend dependencies
npm install

# Start the Vite React development server
npm run dev
```
> The frontend application will run on: **`http://localhost:5173`**

---

## 📡 RESTful Endpoints (Backend: `http://localhost:5000`)

| HTTP Method | Route Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| **GET** | `/tasks` | Fetch all tasks from MongoDB | `200 OK` |
| **GET** | `/tasks/:id` | Fetch a single task by ID | `200 OK` / `404 Not Found` |
| **POST** | `/tasks` | Create a new task in MongoDB | `201 Created` / `400 Bad Request` |
| **PUT** | `/tasks/:id` | Update an existing task (or toggle status) | `200 OK` / `400` / `404` |
| **DELETE** | `/tasks/:id` | Permanently remove a task from MongoDB | `200 OK` / `404 Not Found` |
| **GET** | `/api/db-status` | Verify live MongoDB connection health | `200 OK` |

---

## ✨ Key Features Implemented

1. **Full-Stack CRUD Persistence**:
   - Create, view, edit, and delete tasks directly from the React interface with changes saved into MongoDB. Data persists across browser refreshes.

2. **Centralized API Service (`src/services/api.js`)**:
   - Single point of configuration for the backend base URL (`http://localhost:5000`), abstracting fetch requests and HTTP error handling.

3. **Optimistic UI Updates**:
   - Instant visual update upon creating tasks and toggling completion status, ensuring zero UI lag.

4. **Confirmation Safeguards**:
   - Confirmation dialog prompt before executing `DELETE` requests to prevent accidental deletion.

5. **Toast Notifications (`src/components/Toast.jsx`)**:
   - Animated floating alert banner for real-time feedback on successful and failed API operations.

6. **Filter & Search Dashboard**:
   - Real-time search filter and tab filters (`All`, `Pending`, `Completed`, `High Priority`).

7. **Contact & Learn More Page (`/contact`)**:
   - Structured portfolio page with controlled contact form, key learning outcomes, technologies used, and dev run-down.

8. **Dual Theme Support**:
   - Toggle smoothly between Dark Mode and Light Mode.

---

## 📜 License & Author
* **Author**: Daksh Digashia (Roll No: **D25CS124**)  
* **Academic Year**: 2026
