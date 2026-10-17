import { lazy } from 'react';

/**
 * Enhanced React.lazy with an optional minimum delay.
 * Avoids visual flickering/jitter of loading spinners on fast connections
 * by ensuring the fallback displays smoothly.
 *
 * @param {Function} importFunc - Dynamic import function, e.g. () => import('./Component')
 * @param {number} minDelayMs - Minimum duration to show fallback (default: 300ms)
 * @returns {React.LazyExoticComponent}
 */
export function lazyWithDelay(importFunc, minDelayMs = 300) {
  return lazy(() =>
    Promise.all([
      importFunc(),
      new Promise((resolve) => setTimeout(resolve, minDelayMs))
    ]).then(([moduleExports]) => moduleExports)
  );
}

export default lazyWithDelay;
