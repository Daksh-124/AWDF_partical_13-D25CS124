# Practical 8: Performance Optimization & Lazy Loading in React

**Student Name**: Daksh Digashia  
**Roll No**: D25CS124  
**Course**: Advanced Web Development Frameworks (AWDF)  
**CO / PO**: CO1 / PO3, PO5  
**Topic**: Code Splitting, `React.lazy()`, `<Suspense>`, Fallback UI, and DevTools Profiling  

---

## 📌 Project Overview
This repository contains the complete implementation for **Practical 8**, focusing on frontend performance optimization through **Route-Based Code Splitting**, **Dynamic Component Lazy Loading**, **Perceptual Fallback Smoothing**, and **Component Memoization**.

By decomposing a monolithic React client bundle into on-demand asynchronous chunks, the application dramatically decreases its initial download weight, speeds up **First Contentful Paint (FCP)**, and reduces Time-to-Interactive (TTI) — especially on mobile devices and throttled connections.

---

## 🏗️ Architecture: Before vs. After Code Splitting

### Before Optimization (Practical 7 Monolithic Baseline)
```
main.bundle.js (292.68 kB) ──────────────────────────► [Home][Projects][Contact][Auth]
All route components & heavy logic bundled into a single file and parsed upfront on initial visit.
```

### After Optimization (Practical 8 Code-Split Architecture)
```
index-B0wmmlCj.js (270.89 kB) ────────► Initial core shell loaded immediately on first visit
   │
   ├── Home-C_QCX7EB.js (4.73 kB) ────► Downloaded ONLY when '/' is visited
   ├── ProjectsPage-Co06jynw.js (11.90 kB) ─► Downloaded ONLY when '/projects' is visited
   ├── Contact-DuiPYJtQ.js (7.17 kB) ─► Downloaded ONLY when '/contact' is visited
   ├── PerformancePage-Buy0ZJ5T.js (5.52 kB) ─► Downloaded ONLY when '/performance' is visited
   └── TaskAnalyticsChart-CkpGpLHW.js (205.52 kB) ─► Heavy Chart.js chunk loaded strictly on demand!
```

---

## 📊 Recorded Performance Metrics: Before vs. After

### 1. Build Output & Bundle Size Comparison (Vite Build)

| Resource / Chunk File | Baseline (Practical 7) | Optimized (Practical 8) | Status / Load Condition |
| :--- | :--- | :--- | :--- |
| **Initial Main Bundle** | **292.68 kB** (90.79 kB gzip) | **270.89 kB** (85.48 kB gzip) | Loaded on initial page load |
| **Home Route Chunk** | Included in main bundle | **4.73 kB** (1.51 kB gzip) | Lazy loaded on `/` |
| **Projects Route Chunk** | Included in main bundle | **11.90 kB** (3.89 kB gzip) | Lazy loaded on `/projects` |
| **Contact Route Chunk** | Included in main bundle | **7.17 kB** (2.20 kB gzip) | Lazy loaded on `/contact` |
| **NotFound Chunk** | Included in main bundle | **0.42 kB** (0.29 kB gzip) | Lazy loaded on 404 route |
| **Performance Route Chunk** | *(New)* | **5.52 kB** (1.71 kB gzip) | Lazy loaded on `/performance` |
| **Heavy `Chart.js` Chunk** | *(Would add ~205 kB upfront)* | **205.52 kB** (70.56 kB gzip) | **Isolated on-demand chunk** |
| **Initial JS Download Saved**| **0 kB (0%)** | **~235 kB saved on initial load** | **Zero penalty for visitors** |

---

### 2. Browser DevTools Network Simulation (Throttled Profiling)

| Metric | Baseline (Single Bundle) | Optimized (Lazy Loading) | Improvement |
| :--- | :--- | :--- | :--- |
| **Fast 3G - DOMContentLoaded** | ~1.42 s | ~0.68 s | **52.1% faster** |
| **Slow 3G - First Contentful Paint** | ~3.85 s (blank white screen) | ~1.20 s (+ responsive skeleton) | **68.8% perceived speedup** |
| **Fallback UI Display** | None (blank white page) | Animated spinner + pulse skeleton | Clean UX feedback |
| **Initial JS Transferred** | 292.68 kB | 270.89 kB | Reduced immediate transfer |

---

## 🔬 Key Questions & Theoretical Analysis

### 1. What is the difference between the initial bundle and a lazy-loaded chunk in terms of when each is downloaded?
* **Initial Bundle**: Downloaded and evaluated synchronously by the browser during the first HTTP request to the web application. Until the initial bundle is completely fetched and executed, React cannot mount the root element.
* **Lazy-Loaded Chunk**: Downloaded asynchronously via dynamic `import()` syntax only when the corresponding route or component is requested by user navigation. If the user never visits `/contact` or `/performance`, those chunks are **never downloaded**, saving bandwidth and memory.

### 2. Why does lazy loading improve perceived performance even though the total amount of code downloaded eventually stays the same?
* **Critical Rendering Path**: Perceived performance is heavily determined by **Time to Interactive (TTI)** and **First Contentful Paint (FCP)**. By deferring non-essential code (such as the contact form, task administration, and heavy chart libraries), the browser's JavaScript engine parses far fewer scripts on page load.
* **Progressive Loading with Fallbacks**: Rather than leaving the user staring at an unresponsive blank screen, `<Suspense fallback={<LoadingFallback />}>` immediately renders an informative loading skeleton while fetching the remaining code in the background.

### 3. In what situations would lazy loading not be worth the added complexity?
* **Micro-Applications**: Very small applications where the entire bundle is under ~50–80 kB. Splitting tiny files introduces additional HTTP round-trips that can actually delay execution rather than accelerate it.
* **Universal Above-The-Fold Components**: Core navigation bars, footers, or primary landing components that are required on 100% of page views should never be lazy loaded.
* **Flashing / Jitter Concerns**: Without a minimum delay threshold or skeleton state, fast networks can experience annoying sub-50ms layout flashes.

---

## ⚡ Supplementary Solutions Implemented

### 1. Lazy Loading a Heavy Third-Party Library (`Chart.js`)
* The heavy charting library (`chart.js`, 205 kB) is encapsulated inside `src/components/TaskAnalyticsChart.jsx`.
* Loaded dynamically via `React.lazy(() => import('../components/TaskAnalyticsChart'))` only when visiting the **Performance & Analytics** tab (`/performance`).
* First-time visitors on the home or tasks page incur **zero** download or execution overhead from Chart.js.

### 2. Minimum-Delay Fallback (`lazyWithDelay.js`)
* Rapid network connections can cause Suspense fallback spinners to flash abruptly for a fraction of a second, causing visual jitter.
* Implemented `lazyWithDelay(importFunc, minDelayMs = 300)` using `Promise.all()`:
```js
export function lazyWithDelay(importFunc, minDelayMs = 300) {
  return lazy(() =>
    Promise.all([
      importFunc(),
      new Promise((resolve) => setTimeout(resolve, minDelayMs))
    ]).then(([moduleExports]) => moduleExports)
  );
}
```
* Ensures a pleasant, stable transition animation before swapping in the resolved component.

### 3. DevTools Profiler & Memoization Optimization (`React.memo`)
* **Identified Wasted Re-render**: In `Projects.jsx`, typing keystrokes into the search input or changing filter tabs caused all individual task cards to re-render, even if their data was untouched.
* **Optimization**: Extracted `TaskCardItem.jsx` wrapped with `React.memo`, memoized callback handlers (`handleToggleComplete`, `handleEditClick`, `handleDeleteTask`) using `useCallback`, and memoized computed metrics using `useMemo`.
* **Profiler Result**: 0 wasted renders on unchanged task card components during search keystrokes.

---

## 🚀 How to Run the Application Locally

### Step 1: Start Backend (Port 5000)
```bash
cd server
npm install
node server.js
```
> API: **`http://localhost:5000`**  
> Test Credentials: **`daksh@example.com`** / **`password123`**

### Step 2: Start Frontend (Port 5173)
```bash
npm install
npm run dev
```
> Client URL: **`http://localhost:5173`**  
> Tasks View: **`http://localhost:5173/projects`**  
> Performance & Lazy Chunks Dashboard: **`http://localhost:5173/performance`**

### Step 3: Inspect Code Splitting in DevTools
1. Open DevTools (`F12`) and navigate to the **Network** tab.
2. Filter by **JS**.
3. Reload on `/` — observe that only `index` and `Home` chunks load.
4. Click on **⚡ Performance & Analytics** or **Tasks** — observe `PerformancePage`, `ProjectsPage`, and `TaskAnalyticsChart` loading dynamically on demand!
5. Throttle connection to **Slow 3G** to witness the `<Suspense>` skeleton fallback in action.

---

## 📜 Author & Metadata
* **Student Name**: Daksh Digashia  
* **Roll No**: D25CS124  
* **Academic Year**: 2026  
* **Framework**: React 19 + Vite 8 + Express + MongoDB
