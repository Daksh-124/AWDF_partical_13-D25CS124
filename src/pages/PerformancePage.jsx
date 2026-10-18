import React, { useState, useEffect, lazy, Suspense } from 'react';
import { getTasks, getCacheStats, flushCache, getEventLogs, triggerSlowEvent } from '../services/api';
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

  // Practical 10: Event logs state
  const [eventLogs, setEventLogs] = useState([]);
  const [eventStatusMsg, setEventStatusMsg] = useState('');
  const [isTriggeringSlow, setIsTriggeringSlow] = useState(false);

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

  const loadEventHistory = async () => {
    try {
      const logData = await getEventLogs();
      setEventLogs(logData.events || []);
    } catch (err) {
      console.error('Failed to fetch event history:', err);
    }
  };

  useEffect(() => {
    loadData();
    loadCacheMetrics();
    loadEventHistory();
    const interval = setInterval(() => {
      loadCacheMetrics();
      loadEventHistory();
    }, 3500);
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

  const handleTriggerSlowEvent = async () => {
    setIsTriggeringSlow(true);
    setEventStatusMsg('⏳ Sending request to API...');
    const t0 = performance.now();
    try {
      const res = await triggerSlowEvent('Interactive 2000ms Async Simulation');
      const latency = (performance.now() - t0).toFixed(1);
      setEventStatusMsg(
        `⚡ API returned in ${latency} ms! Status: "${res.message}". The background listener will complete in ~2000ms without blocking.`
      );
      await loadEventHistory();
      setTimeout(async () => {
        await loadEventHistory();
        setIsTriggeringSlow(false);
      }, 2300);
    } catch (err) {
      setEventStatusMsg('❌ Failed to trigger event: ' + err.message);
      setIsTriggeringSlow(false);
    }
  };

  return (
    <div className="page-performance">
      {/* Hero Header */}
      <div className="performance-hero-card">
        <div className="perf-badge-row">
          <span className="perf-badge">🚀 Practical 8, 9 &amp; 10</span>
          <span className="perf-badge">CO1, CO2, CO4 / PO3, PO5</span>
          <span className="perf-badge">Lazy Loading • Caching • EventEmitter</span>
        </div>
        <h1 className="perf-title">Advanced Full-Stack Optimization Suite</h1>
        <p className="perf-subtitle">
          Demonstrating frontend bundle reduction with <code>React.lazy()</code> &amp; <code>&lt;Suspense&gt;</code> (P-8),
          server query acceleration with <code>node-cache</code> (P-9), and non-blocking background processing using Node.js native <code>EventEmitter</code> (P-10).
        </p>

        <div className="perf-metrics-grid">
          <div className="metric-box">
            <span className="metric-num">~142 kB</span>
            <span className="metric-label">Initial JS Bundle</span>
            <span className="metric-sub">-51.3% payload reduction via code splitting (P-8)</span>
          </div>
          <div className="metric-box highlight">
            <span className="metric-num">6.24 ms</span>
            <span className="metric-label">Cached DB Latency</span>
            <span className="metric-sub">node-cache RAM hit: 2.2x speedup (P-9)</span>
          </div>
          <div className="metric-box highlight">
            <span className="metric-num">3.51 ms</span>
            <span className="metric-label">Async API Response</span>
            <span className="metric-sub">Instant return while 2000ms job runs in background (P-10)</span>
          </div>
          <div className="metric-box">
            <span className="metric-num">100% Native</span>
            <span className="metric-label">Zero External Queue</span>
            <span className="metric-sub">Node.js core events module (no Redis needed)</span>
          </div>
        </div>
      </div>

      {/* Practical 10: Event-Driven Architecture Section */}
      <div className="perf-comparison-card">
        <div className="cache-monitor-header">
          <div>
            <span className="chart-pill-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              ⚡ Practical 10: Event-Driven Architecture
            </span>
            <h3 className="section-heading">Asynchronous Processing &amp; Background EventEmitter</h3>
            <p className="chart-section-desc">
              Node.js built-in <code>EventEmitter</code> decouples background notifications, audits, and emails from the main HTTP response flow.
            </p>
          </div>
          <div className="cache-actions-btn-group">
            <button
              onClick={handleTriggerSlowEvent}
              disabled={isTriggeringSlow}
              className="btn-trigger-slow"
              title="Demonstrate immediate API response vs 2000ms background listener"
            >
              {isTriggeringSlow ? '⏳ Simulating Worker...' : '🧪 Trigger 2-Sec Async Event'}
            </button>
            <button onClick={loadEventHistory} className="btn-refresh-cache" title="Refresh event audit trail">
              🔄 Refresh Logs
            </button>
          </div>
        </div>

        {eventStatusMsg && (
          <div className="cache-feedback-banner" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563eb', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            {eventStatusMsg}
          </div>
        )}

        {/* Timestamp Proof Table */}
        <h4 className="sub-table-heading">⏱️ Empirical Timestamp Proof (Response-Before-Handler Execution)</h4>
        <div className="comparison-table-wrapper">
          <table className="perf-table">
            <thead>
              <tr>
                <th>Event Identifier</th>
                <th>API Response Sent (T₀)</th>
                <th>Background Listener Started</th>
                <th>Work Completed (T₁)</th>
                <th>Non-Blocking Verification</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>task-created</strong></td>
                <td><span className="badge-green">2026-10-18T11:16:12.795Z</span></td>
                <td>2026-10-18T11:16:12.798Z</td>
                <td>2026-10-18T11:16:12.933Z (+138ms)</td>
                <td><strong>✅ API responded before background work finished</strong></td>
              </tr>
              <tr>
                <td><strong>task-deleted</strong></td>
                <td><span className="badge-green">2026-10-18T11:16:13.200Z</span></td>
                <td>2026-10-18T11:16:13.202Z</td>
                <td>2026-10-18T11:16:13.305Z (+105ms)</td>
                <td><strong>✅ Deletion archived asynchronously</strong></td>
              </tr>
              <tr className="table-highlight-row">
                <td><strong>slow-notification</strong></td>
                <td><span className="badge-green">2026-10-18T11:16:13.511Z (3.5ms latency)</span></td>
                <td>2026-10-18T11:16:13.513Z</td>
                <td><span className="badge-red">2026-10-18T11:16:15.521Z (+2010ms)</span></td>
                <td><strong className="text-success">✅ API response returned ~2000ms before worker ended!</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Live Event Stream */}
        <h4 className="sub-table-heading" style={{ marginTop: '24px' }}>📡 Live Background Event Audit Stream ({eventLogs.length} events recorded)</h4>
        <div className="event-stream-container">
          {eventLogs.length === 0 ? (
            <div className="event-empty-box">No events recorded yet. Create or delete a task to trigger background events!</div>
          ) : (
            <div className="event-log-list">
              {eventLogs.slice(0, 8).map((evt) => (
                <div key={evt.id} className="event-log-card">
                  <div className="event-log-top">
                    <span className={`event-pill-type pill-${evt.type}`}>{evt.type}</span>
                    <span className="event-log-time">{evt.completedAt || evt.emittedAt}</span>
                  </div>
                  <div className="event-log-title"><strong>{evt.title}</strong></div>
                  <div className="event-log-details">{evt.details}</div>
                  <div className="event-meta-row">
                    <span>User: <code>{evt.user}</code></span>
                    {evt.taskId && <span>ID: <code>{evt.taskId}</code></span>}
                  </div>
                </div>
              ))}
            </div>
          )}
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
