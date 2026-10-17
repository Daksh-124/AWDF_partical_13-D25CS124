const NodeCache = require('node-cache');

/**
 * Shared In-Memory Cache Instance using node-cache (Practical 9)
 * stdTTL: 60 seconds (Time-To-Live before expiration)
 * checkperiod: 120 seconds (automatic cleanup interval)
 */
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// Empirical metrics tracking (Supplementary Problem requirement)
const cacheStats = {
  hits: 0,
  misses: 0,
  invalidations: 0,
  writesCached: 0
};

/**
 * Retrieve an item from the cache with stats tracking
 */
function getCached(key) {
  const data = cache.get(key);
  if (data !== undefined && data !== null) {
    cacheStats.hits++;
    return { data, isHit: true };
  }
  cacheStats.misses++;
  return { data: null, isHit: false };
}

/**
 * Store an item in the cache with optional custom TTL
 */
function setCached(key, val, ttl = 60) {
  cacheStats.writesCached++;
  return cache.set(key, val, ttl);
}

/**
 * Invalidate a specific key or list of keys
 */
function invalidateKey(keyOrKeys) {
  cacheStats.invalidations++;
  return cache.del(keyOrKeys);
}

/**
 * Invalidate all user task-related caches (e.g. on task create/update/delete)
 */
function invalidateTaskCaches(userId, taskId = null) {
  const keysToInvalidate = ['all_tasks'];
  if (userId) {
    keysToInvalidate.push(`tasks_${userId}`);
  }
  if (taskId) {
    keysToInvalidate.push(`task_${taskId}`);
    if (userId) {
      keysToInvalidate.push(`task_${userId}_${taskId}`);
    }
  }
  cacheStats.invalidations++;
  return cache.del(keysToInvalidate);
}

/**
 * Get current cache statistics and status summary
 */
function getStatsSummary() {
  const total = cacheStats.hits + cacheStats.misses;
  const hitRatio = total > 0 ? ((cacheStats.hits / total) * 100).toFixed(1) + '%' : '0.0%';
  const keys = cache.keys();
  
  return {
    hits: cacheStats.hits,
    misses: cacheStats.misses,
    totalRequests: total,
    hitRatio,
    invalidations: cacheStats.invalidations,
    writesCached: cacheStats.writesCached,
    activeKeysCount: keys.length,
    activeKeys: keys,
    defaultTTL: 60,
    engine: 'node-cache (in-memory)'
  };
}

/**
 * Reset stats counters (for testing and benchmarking)
 */
function resetStats() {
  cache.flushAll();
  cacheStats.hits = 0;
  cacheStats.misses = 0;
  cacheStats.invalidations = 0;
  cacheStats.writesCached = 0;
}

module.exports = {
  cache,
  cacheStats,
  getCached,
  setCached,
  invalidateKey,
  invalidateTaskCaches,
  getStatsSummary,
  resetStats
};
