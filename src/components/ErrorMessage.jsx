import React from 'react';

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Failed to Fetch Data</h3>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="retry-btn" onClick={onRetry}>
          🔄 Retry Fetch
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
