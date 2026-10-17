import React from 'react';

/**
 * LoadingFallback Component
 * Rendered by React <Suspense> boundary while a dynamic route chunk is downloading.
 */
function LoadingFallback({ message = 'Loading page component chunk...' }) {
  return (
    <div className="route-loading-container">
      <div className="route-loading-card">
        <div className="route-loading-spinner-ring"></div>
        <h3 className="route-loading-title">{message}</h3>
        <p className="route-loading-subtitle">
          Code-splitting in progress via <code>React.lazy()</code> &amp; <code>&lt;Suspense&gt;</code>
        </p>

        {/* Skeleton pulse blocks simulating page content structure */}
        <div className="route-skeleton-box">
          <div className="skeleton-bar skeleton-title"></div>
          <div className="skeleton-bar skeleton-text"></div>
          <div className="skeleton-bar skeleton-text short"></div>
          <div className="skeleton-cards-grid">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        </div>

        <div className="route-loading-badge">
          ⚡ Practical 8: On-Demand Chunk Loading
        </div>
      </div>
    </div>
  );
}

export default LoadingFallback;
