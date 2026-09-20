import React from 'react';

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">API Fetch Error</h3>
      <p className="error-message">{message || 'Failed to fetch repositories from GitHub API.'}</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-btn">
          🔄 Retry Fetching Repositories
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
