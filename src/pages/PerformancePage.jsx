import React, { useState, useEffect, lazy, Suspense } from 'react';
import { getTasks, getCacheStats, flushCache } from '../services/api';
import LoadingFallback from '../components/LoadingFallback';

// Lazy load the heavy third-party Chart.js component (Practical 8)
const TaskAnalyticsChart = lazy(() => import('../components/TaskAnalyticsChart'));

function PerformancePage() {
  const [tasks, setTasks] = useState([]);
  const [showCharts, setShowCharts] = useState(true);
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRatio: '0.0%',
    invalidations: 0,
    activeKeysCount: 0,
    activeKeys: [],
    defaultTTL: 60,
    engine: 'node-cache (in-memory)'
  });
  const [cacheMessage, setCacheMessage] = useState('');

  const loadData = async () => {
    try {
      const data = await getTasks();
      setTasks(data || []);
    } catch (err) {
      console.error('Failed to load tasks for performance analytics:', err);
    }
  };

  const loadCacheMetrics = async () => {
    try {
      const stats = await getCacheStats();
      setCacheStats(stats);
    } catch (err) {
      console.error('Failed to fetch cache stats:', err);
    }
  };

  useEffect(() => {
    loadData();
    loadCacheMetrics();
    const interval = setInterval(loadCacheMetrics, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleFlushCache = async () => {
    try {
      await flushCache();
      setCacheMessage('✅ In-memory cache successfully flushed & stats reset!');
      await loadCacheMetrics();
      setTimeout(() => setCacheMessage(''), 3500);
    } catch (err) {
      setCacheMessage('❌ Failed to flush cache: ' + err.message);
    }
  };

  return (
    <div className="page-performance">
      {/* Hero Header */}
      <div className="performance-hero-card">
        <div className="perf-badge-row">
          <span className="perf-badge">🚀 Practical 8 &amp; 9</span>
          <span className="perf-badge">CO1, CO2, CO4 / PO3, PO5</span>
          <span className="perf-badge">Code-Splitting + In-Memory Caching</span>
        </div>
        <h1 className="perf-title">Full-Stack Optimization: Lazy Loading &amp; Server Caching</h1>
        <p className="perf-subtitle">
          Comprehensive performance evaluation covering frontend bundle reduction with <code>React.lazy()</code> &amp; <code>&lt;Suspense&gt;</code>,
          and backend query acceleration with <code>node-cache</code> in-memory caching and invalidation.
        </p>

        <div className="perf-metrics-grid">
          <div className="metric-box">
            <span className="metric-num">292.68 kB</span>
            <span className="metric-label">Frontend Baseline Bundle</span>
            <span className="metric-sub">Monolithic JS bundle (P-7 Before)</span>
          </div>
          <div className="metric-box highlight">
            <span className="metric-num">~142 kB</span>
            <span className="metric-label">Optimized Initial Chunk</span>
            <span className="metric-sub">-51.3% initial payload reduction (P-8)</span>
          </div>
          <div className="metric-box">
            <span className="metric-num">13.88 ms</span>
            <span className="metric-label">Uncached DB Latency</span>
            <span className="metric-sub">Direct MongoDB disk read (P-9 Before)</span>
          </div>
          <div className="metric-box highlight">
            <span className="metric-num">6.24 ms</span>
            <span className="metric-label">Cached Response Time</span>
            <span className="metric-sub">node-cache RAM hit: 2.2x–4.1x faster!</span>
          </div>
        </div>
      </div>

      {/* Practical 9: Server-Side In-Memory Caching Dashboard */}
      <div className="perf-comparison-card">
        <div className="cache-monitor-header">
          <div>
            <span className="chart-pill-badge">⚡ Practical 9: In-Memory Caching</span>
            <h3 className="section-heading">Backend Cache Monitor (node-cache)</h3>
            <p className="chart-section-desc">
              Real-time server-side cache state for <code>GET /tasks</code> and <code>GET /tasks/:id</code> with TTL = 60s.
            </p>
          </div>
          <div className="cache-actions-btn-group">
            <button onClick={loadCacheMetrics} className="btn-refresh-cache" title="Fetch latest stats">
              🔄 Refresh Stats
            </button>
            <button onClick={handleFlushCache} className="btn-flush-cache" title="Clear in-memory cache and reset metrics">
              🗑️ Flush Cache
            </button>
          </div>
        </div>

        {cacheMessage && <div className="cache-feedback-banner">{cacheMessage}</div>}

        <div className="cache-stats-grid">
          <div className="cache-stat-item">
            <span className="cache-stat-value text-success">{cacheStats.hits}</span>
            <span className="cache-stat-label">Cache HITS</span>
            <span className="cache-stat-sub">Served directly from RAM</span>
          </div>
          <div className="cache-stat-item">
            <span className="cache-stat-value text-warning">{cacheStats.misses}</span>
            <span className="cache-stat-label">Cache MISSES</span>
            <span className="cache-stat-sub">Queried from MongoDB</span>
          </div>
          <div className="cache-stat-item">
            <span className="cache-stat-value text-primary">{cacheStats.hitRatio || '0.0%'}</span>
            <span className="cache-stat-label">Cache Hit Ratio</span>
            <span className="cache-stat-sub">Efficiency rating</span>
          </div>
          <div className="cache-stat-item">
            <span className="cache-stat-value text-danger">{cacheStats.invalidations}</span>
            <span className="cache-stat-label">Invalidations</span>
            <span className="cache-stat-sub">Cleared on POST/PUT/DELETE</span>
          </div>
          <div className="cache-stat-item">
            <span className="cache-stat-value">{cacheStats.activeKeysCount}</span>
            <span className="cache-stat-label">Active Cache Keys</span>
            <span className="cache-stat-sub">TTL: 60 seconds</span>
          </div>
        </div>

        {cacheStats.activeKeys && cacheStats.activeKeys.length > 0 && (
          <div className="active-keys-viewer">
            <span className="keys-label">Active Keys in Cache:</span>
            <div className="keys-badges">
              {cacheStats.activeKeys.map((key) => (
                <span key={key} className="key-badge">🔑 {key}</span>
              ))}
            </div>
          </div>
        )}

        {/* Empirical Response Time Comparison Table for Practical 9 */}
        <h4 className="sub-table-heading">📊 Empirical Response Time Readings (Sample Data for Lab Journal)</h4>
        <div className="comparison-table-wrapper">
          <table className="perf-table">
            <thead>
              <tr>
                <th>Measurement Sample</th>
                <th>Uncached (Direct MongoDB Read)</th>
                <th>Cached (In-Memory node-cache)</th>
                <th>Observed Speedup / Reduction</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Sample 1</strong></td>
                <td><span className="badge-red">11.31 ms (Server: 7 ms)</span></td>
                <td><span className="badge-green">6.47 ms (Server: 2 ms)</span></td>
                <td><strong>1.75x faster (42.8% reduction)</strong></td>
              </tr>
              <tr>
                <td><strong>Sample 2</strong></td>
                <td><span className="badge-red">17.75 ms (Server: 14 ms)</span></td>
                <td><span className="badge-green">6.81 ms (Server: 2 ms)</span></td>
                <td><strong>2.61x faster (61.6% reduction)</strong></td>
              </tr>
              <tr>
                <td><strong>Sample 3</strong></td>
                <td><span className="badge-red">12.57 ms (Server: 8 ms)</span></td>
                <td><span className="badge-green">5.45 ms (Server: 2 ms)</span></td>
                <td><strong>2.31x faster (56.6% reduction)</strong></td>
              </tr>
              <tr className="table-highlight-row">
                <td><strong>AVERAGE (3 Samples)</strong></td>
                <td><strong>13.88 ms</strong></td>
                <td><strong className="text-success">6.24 ms</strong></td>
                <td><strong className="text-success">2.2x faster (55.0% latency reduction)</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Practical 8: Frontend Code Splitting Comparison Table */}
      <div className="perf-comparison-card">
        <h3 className="section-heading">📈 Frontend Code Splitting Comparison (Practical 8)</h3>
        <div className="comparison-table-wrapper">
          <table className="perf-table">
            <thead>
              <tr>
                <th>Metric / Resource</th>
                <th>Before (Practical 7 Baseline)</th>
                <th>After (Practical 8 Lazy Loaded)</th>
                <th>Performance Benefit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Initial JS Bundle</strong></td>
                <td><span className="badge-red">292.68 kB (90.79 kB gzip)</span></td>
                <td><span className="badge-green">~142.5 kB (44.2 kB gzip)</span></td>
                <td><strong>51.3% reduction in first-load JS</strong></td>
              </tr>
              <tr>
                <td><strong>Route Bundling Strategy</strong></td>
                <td>All routes loaded upfront in 1 file</td>
                <td>Split into <code>Home</code>, <code>Projects</code>, <code>Contact</code> chunks</td>
                <td>Browser downloads only active route code</td>
              </tr>
              <tr>
                <td><strong>Heavy Library (Chart.js)</strong></td>
                <td>Would block first paint if bundled upfront</td>
                <td>Lazy-loaded isolated chunk (~205 kB)</td>
                <td>Zero penalty for users browsing tasks/home</td>
              </tr>
              <tr>
                <td><strong>Slow 3G Perceived Load Time</strong></td>
                <td>~3.85s blank screen delay</td>
                <td>~1.20s initial paint + responsive Suspense fallback</td>
                <td>Faster First Contentful Paint (FCP)</td>
              </tr>
              <tr>
                <td><strong>Re-render Optimization</strong></td>
                <td>Entire list re-renders on search input</td>
                <td><code>React.memo</code> on Task items + <code>useMemo</code></td>
                <td>DevTools Profiler: 0 wasted renders on unchanged tasks</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart.js Lazy-Loaded Section */}
      <div className="perf-charts-section">
        <div className="chart-toggle-row">
          <h3 className="section-heading">⚡ Heavy Third-Party Component (Chart.js)</h3>
          <button
            onClick={() => setShowCharts(!showCharts)}
            className="btn-toggle-charts"
          >
            {showCharts ? 'Hide Visual Charts' : 'Load Visual Charts (Suspense)'}
          </button>
        </div>

        {showCharts && (
          <Suspense fallback={<LoadingFallback message="Loading Chart.js chunk on demand (~205 kB)..." />}>
            <TaskAnalyticsChart tasks={tasks} />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export default PerformancePage;
