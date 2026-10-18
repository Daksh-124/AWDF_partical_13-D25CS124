# Practical 10: Asynchronous Processing with Event-Driven Architecture

**Student Name**: Daksh Digashia  
**Roll No**: D25CS124  
**Course**: Advanced Web Development Frameworks (AWDF)  
**CO / PO**: CO4 / PO3, PO5  
**Topic**: Node.js Built-in `EventEmitter`, Non-Blocking Background Processing, and Event-Driven Decoupling  

---

## 📌 Project Overview
This repository contains the complete implementation for **Practical 10**, introducing **event-driven asynchronous background processing** using Node.js native `EventEmitter` (from the core `events` module, requiring **zero** external dependencies).

By decoupling auxiliary side effects (such as notification logging, audit trail archiving, and simulated email dispatch) from the primary HTTP request-response lifecycle, the API responds immediately to clients without waiting for background tasks to finish.

---

## 🏗️ Architecture & Asynchronous Event Pipeline

```
Client Request: POST /tasks
      │
      ▼
   Write Task to MongoDB via Mongoose
      │
      ▼
   Send Immediate HTTP Response (201 Created) ──► Client Receives Response Immediately (~3-5 ms)
      │
      ▼ (Asynchronous Dispatch via Node.js Event Loop)
   taskEvents.emit('task-created', taskData)
      │
      ▼
   [Notification Listener (listeners.js)]
      ├── Logs task title, assigned user, and handled timestamp
      └── Triggers non-blocking background I/O (email/audit dispatch)
```

---

## ⏱️ Empirical Timestamp Evidence (Response-Before-Handler Proof)

Empirical execution readings captured via the automated test suite demonstrating that the **API response was dispatched BEFORE the background event handler completed**:

| Operation / Event | API Response Sent ($T_0$) | Background Listener Started | Background Work Completed ($T_1$) | Elapsed Background Time | Non-Blocking Verification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`task-created`** | **11:16:12.795Z** | 11:16:12.798Z | **11:16:12.933Z** | +138 ms | **✅ API responded before background worker finished** |
| **`task-deleted`** | **11:16:13.200Z** | 11:16:13.202Z | **11:16:13.305Z** | +105 ms | **✅ Deletion audit archived asynchronously** |
| **`slow-notification`** (2000ms simulation) | **11:16:13.511Z** (3.51 ms latency) | 11:16:13.513Z | **11:16:15.521Z** | **+2010 ms** | **✅ API returned in 3.5ms; worker finished ~2s later!** |

> **Key Takeaway**: Even when a heavy background worker takes over 2,000 milliseconds to complete its task, the client experiences zero blocking latency, receiving an instant HTTP 200/201 response.

---

## 🔬 Key Questions & Theoretical Analysis (Viva / Lab Evaluation)

### 1. Why does emitting an event not block the API response, even though both run on the same Node.js process?
* **Asynchronous Scheduling in the Event Loop**: Emitting an event via `EventEmitter` synchronously invokes the listener callbacks registered on that event. However, when the listener delegates its heavy operations to asynchronous APIs (such as `setTimeout`, `setImmediate`, or asynchronous I/O promises), Node.js registers the callback into the event loop's timer or poll phase and immediately returns control.
* **Separation from Response Pipeline**: Because the response has already been flushed to the network socket (`res.status(201).json(...)`), the HTTP transaction is terminated from the client's perspective while the background task finishes asynchronously in a later event loop tick.

### 2. What would happen to API response time if the notification logic were placed directly inside the POST route instead of in an event handler?
* **Direct Execution Penalty**: If the notification logic (e.g. sending an email via SMTP or making an external webhook request taking 500–2,000 ms) were placed synchronously inside the `POST /tasks` route before sending the response, the client would be forced to wait for that entire duration.
* **Degraded Client Experience**: API response latency would skyrocket from **~5 ms to 2,000+ ms**, causing visible UI freezes, increased risk of client gateway timeouts, and poor mobile responsiveness.

### 3. Why is EventEmitter a reasonable choice for this scale of application, but not for a production system handling millions of events per day?
* **Why EventEmitter is Great Here**:
  - **Zero Overhead**: Built directly into Node.js core (`require('events')`) with zero external infrastructure, zero network serialization latency, and zero dependency overhead.
  - **Simplicity**: Extremely straightforward pub/sub pattern for single-process architectures.
* **Why it Fails at Enterprise Scale (Millions of Events/Day)**:
  - **In-Memory Volatility**: Events reside purely in process memory. If the Node.js server crashes or restarts, all pending in-memory events are permanently lost with no persistence or replay ability.
  - **No Distributed Capability**: Works exclusively inside a single OS process. In a distributed multi-pod Kubernetes or microservices cluster, an event emitted on Instance 1 cannot be received by listeners on Instance 2.
  - **No Backpressure or Rate-Limiting**: High event bursts can exhaust Node.js heap memory, leading to out-of-memory (OOM) crashes.
  - **Production Alternative**: Production systems use dedicated distributed message brokers (such as **RabbitMQ**, **Apache Kafka**, or **Redis BullMQ**) which provide persistent message queues, horizontal consumer scaling, automatic retries, and dead-letter queues.

---

## ⚡ Supplementary Problems Implemented

### 1. `task-deleted` Event & Listener
* Emitted upon deleting a task via `DELETE /tasks/:id`.
* Listener logs the deletion timestamp and asynchronously archives an audit entry.

### 2. `task-updated` Event & Listener
* Emitted upon editing a task via `PUT /tasks/:id`.
* Listener logs the updated title, completion status, and priority.

### 3. Global Error Event Listener (`'error'`)
* Registered a dedicated error handler (`taskEvents.on('error', ...)`) to prevent unhandled EventEmitter exceptions from crashing the server process.

### 4. 2000ms Slow Notification Simulation
* Exposed at `POST /api/test-slow-event`.
* Demonstrates immediate response (< 5 ms) while the simulated background worker runs a 2-second job.

### 5. Live Background Event Audit Stream
* Endpoint: `GET /api/event-logs`.
* Retains the last 60 background event execution records in memory.
* Integrated into the React frontend at `/performance` with an interactive trigger button and real-time polling stream.

---

## 📡 RESTful Endpoints Reference (`http://localhost:5000`)

| Method | Endpoint | Description | Event Emitted |
| :--- | :--- | :--- | :--- |
| **POST** | `/tasks` | Create new task in MongoDB | `task-created` |
| **PUT** | `/tasks/:id` | Update task in MongoDB | `task-updated` |
| **DELETE**| `/tasks/:id` | Delete task from MongoDB | `task-deleted` |
| **POST** | `/api/test-slow-event` | Simulate heavy 2000ms background worker | `slow-notification` |
| **GET** | `/api/event-logs` | Retrieve live background event audit history | None |
| **GET** | `/api/cache-stats` | Retrieve Practical 9 in-memory cache metrics | None |
| **POST** | `/api/cache-flush` | Reset in-memory cache for benchmarks | None |

---

## 🚀 How to Run and Test Locally

### Step 1: Start Express Backend (Port 5000)
```bash
cd server
npm install
node server.js
```
> API runs on: **`http://localhost:5000`**  
> Console will log: `✅ Event listeners registered: [task-created, task-deleted, task-updated, slow-notification, error]`

### Step 2: Start React Client (Port 5173)
```bash
npm install
npm run dev
```
> Client runs on: **`http://localhost:5173`**  
> Event Stream & Optimization Dashboard: **`http://localhost:5173/performance`**

### Step 3: Run Automated Test Script
```bash
node scratch/test_practical10_events.js
```
> Validates immediate HTTP response, timestamp ordering, and 2-second background execution.

---

## 📜 Author & Metadata
* **Student Name**: Daksh Digashia  
* **Roll No**: D25CS124  
* **Course**: Advanced Web Development Frameworks (AWDF)  
* **Academic Year**: 2026
