# Practical 9: In-Memory Caching and Query Optimization

**Student Name**: Daksh Digashia  
**Roll No**: D25CS124  
**Course**: Advanced Web Development Frameworks (AWDF)  
**CO / PO**: CO2, CO4 / PO3, PO5  
**Topic**: Server-Side Caching with `node-cache`, Cache Invalidation, Latency Profiling, and Query Optimization  

---

## 📌 Project Overview
This repository contains the complete implementation for **Practical 9**, integrating **in-memory caching** using `node-cache` into our Node.js / Express / MongoDB Task Management backend, and connecting it to our React frontend with live monitoring and cache control.

Database read operations (`GET /tasks` and `GET /tasks/:id`) are cached in server RAM with a standard **Time-To-Live (TTL) of 60 seconds**. When any write operation (`POST`, `PUT`, or `DELETE`) occurs, the associated cache keys are immediately invalidated to ensure that stale data is never served to clients.

---

## 🏗️ Architecture & Data Flow

```
Client Request: GET /tasks or GET /tasks/:id
        │
        ▼
   [Cache Check (node-cache)]
        ├── HIT  ──► Return cached JSON immediately from RAM (X-Cache: HIT)
        │            (Duration: ~5-7 ms | 0 MongoDB query overhead)
        │
        └── MISS ──► Query MongoDB Database (X-Cache: MISS)
                     ├── Fetch documents via Mongoose ODM (~12-18 ms)
                     ├── Store documents in node-cache (TTL: 60s)
                     └── Return data to client & set headers
```

### Cache Invalidation Flow (Write Pipeline)
```
Client Request: POST /tasks, PUT /tasks/:id, DELETE /tasks/:id
        │
        ▼
   Write to MongoDB via Mongoose
        │
        ▼
   [Invalidate Associated Cache Keys]
        ├── Invalidate 'all_tasks'
        ├── Invalidate 'tasks_<userId>'
        └── Invalidate 'task_<id>' (for PUT / DELETE)
        │
        ▼
   Return 200/201 response.
   Next GET request is guaranteed a MISS -> fetches fresh data from DB and recaches.
```

---

## 📊 Empirical Response Time Benchmark (Postman / Automated Suite)

Measurements recorded on `http://localhost:5000/tasks` with MongoDB running locally.

| Measurement Sample | Uncached (Direct MongoDB Read) | Cached (In-Memory node-cache) | Observed Speedup / Reduction |
| :--- | :--- | :--- | :--- |
| **Sample 1** | **11.31 ms** (Server internal: 7 ms) | **6.47 ms** (Server internal: 2 ms) | **1.75x faster (42.8% reduction)** |
| **Sample 2** | **17.75 ms** (Server internal: 14 ms)| **6.81 ms** (Server internal: 2 ms) | **2.61x faster (61.6% reduction)** |
| **Sample 3** | **12.57 ms** (Server internal: 8 ms) | **5.45 ms** (Server internal: 2 ms) | **2.31x faster (56.6% reduction)** |
| **AVERAGE (3 Samples)** | **13.88 ms** | **6.24 ms** | **2.2x faster (55.0% latency reduction)** |
| **Cold Cache (Warmup MISS)** | **18.30 ms** | Cached on next request | Sets `X-Cache: MISS` |
| **Post-Write Invalidation** | **15.12 ms** (Cache correctly invalidated)| **5.15 ms** on following read | Proves freshness & correctness |

> **Summary**: In-memory caching eliminates MongoDB query execution, connection pool queuing, and BSON deserialization, cutting response latency by **55.0%** on local testing and up to **80%+** under high database concurrency.

---

## 🔬 Key Questions & Theoretical Analysis (Viva / Lab Journal)

### 1. Why must the cache be invalidated on every write operation, and what would happen to data correctness if it were not?
* **Why Invalidation is Essential**: In a caching system, cached data is a transient snapshot of the persistent database. If a user creates, updates, or deletes a task and the cache is not invalidated, subsequent read requests will return the pre-existing snapshot from memory until the TTL expires.
* **Impact of Missing Invalidation (Stale Data Anomaly)**:
  - If a user completes a task or deletes an item, the UI would continue showing the old state, causing user confusion and duplicate writes.
  - Data correctness and consistency would be severely compromised (read-your-own-writes violation).

### 2. What is a reasonable TTL (time-to-live) for cached data in a task management context, and what trade-off does TTL length represent?
* **Reasonable TTL**: In a collaborative or user-interactive Task Management system, a TTL between **30 to 120 seconds** (default: **60 seconds**) is reasonable.
* **The TTL Trade-off**:
  - **Shorter TTL (e.g., 5–15 seconds)**: Higher data freshness, less risk of serving stale data even if invalidation logic fails, but lower cache hit ratio and increased query load on MongoDB.
  - **Longer TTL (e.g., 10–30 minutes)**: Extremely high cache hit ratio and minimal database load, but higher memory footprint in the Node process and greater risk of serving stale data if external database mutations occur outside the API server.

### 3. Why is in-memory caching (`node-cache`) not suitable for a multi-server/multi-instance deployment, even though it works fine in this lab?
* **Process-Local Memory Boundary**: `node-cache` stores cached objects in the **V8 heap memory of the specific Node.js process** running on that machine.
* **Multi-Instance Inconsistency**: If the application scales horizontally across 3 instances (Instance A, B, and C) behind a load balancer:
  1. A client writes to Instance A (`POST /tasks`), invalidating cache on Instance A only.
  2. The next client read is routed by the load balancer to Instance B.
  3. Instance B still holds the old cached data in its local memory and serves stale data!
* **Production Solution**: Multi-instance architectures require a **distributed centralized cache** (such as **Redis** or **Memcached**) shared across all server instances.

---

## ⚡ Supplementary Solutions Implemented

1. **Single-Task Caching (`GET /tasks/:id`)**:
   - Single task reads are cached under `task_<id>`.
   - Updating (`PUT /tasks/:id`) or deleting (`DELETE /tasks/:id`) the task invalidates both the single-task key and the all-tasks collection key.

2. **Cache Monitoring & Stats Debug Endpoint (`GET /api/cache-stats`)**:
   - Exposes real-time metrics:
     - `hits`: Total cache hits
     - `misses`: Total cache misses
     - `hitRatio`: Percentage of requests served from RAM
     - `invalidations`: Count of write-triggered cache clears
     - `activeKeysCount` and `activeKeys`: Currently cached keys
     - `defaultTTL`: 60 seconds

3. **Cache Flush Endpoint (`POST /api/cache-flush`)**:
   - Resets all cached keys and statistics for repeatable lab benchmarks.

4. **Frontend Real-Time Monitor UI**:
   - Accessible via the **⚡ Performance & Analytics** navigation link (`/performance`).
   - Displays live cache hit/miss statistics, active keys, and a button to flush cache directly from the browser.

---

## 📡 RESTful Endpoints Reference (`http://localhost:5000`)

| Method | Endpoint | Cache Behavior | Invalidation Triggered |
| :--- | :--- | :--- | :--- |
| **GET** | `/tasks` | Checks `tasks_<userId>`, returns HIT/MISS | None (read only) |
| **GET** | `/tasks/:id` | Checks `task_<id>`, returns HIT/MISS | None (read only) |
| **POST** | `/tasks` | Creates task in MongoDB | Invalidates `all_tasks` and `tasks_<userId>` |
| **PUT** | `/tasks/:id` | Updates task in MongoDB | Invalidates `tasks_<userId>` and `task_<id>` |
| **DELETE**| `/tasks/:id` | Deletes task in MongoDB | Invalidates `tasks_<userId>` and `task_<id>` |
| **GET** | `/api/cache-stats` | Returns real-time cache counters & metrics | None (debug) |
| **POST** | `/api/cache-flush` | Clears all keys & resets counters | Flushes entire cache |

---

## 🚀 How to Run and Test Locally

### 1. Start Express Backend with Caching
```bash
cd server
npm install
node server.js
```
> Server URL: **`http://localhost:5000`**  
> Cache Stats: **`http://localhost:5000/api/cache-stats`**

### 2. Start React Client
```bash
npm install
npm run dev
```
> Client URL: **`http://localhost:5173`**  
> Performance & Cache Dashboard: **`http://localhost:5173/performance`**

### 3. Verify Cache Headers in Browser or Postman
- Send `GET http://localhost:5000/tasks`
- **First request**: Check response headers -> `X-Cache: MISS` (Duration: ~15-20 ms)
- **Second request**: Check response headers -> `X-Cache: HIT` (Duration: ~5-7 ms)
- **Create task via POST**: Check headers -> Cache invalidated
- **Next request**: `X-Cache: MISS` (Fresh data returned!)

---

## 📜 Author & Academic Metadata
* **Student Name**: Daksh Digashia  
* **Roll No**: D25CS124  
* **Academic Year**: 2026  
* **Course**: Advanced Web Development Frameworks (AWDF)
