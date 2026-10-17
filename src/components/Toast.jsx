import React from 'react';

function Toast({ message, type, onClose }) {
  if (!message) return null;

  return (
    <div className={`toast-notification toast-${type || 'info'}`}>
      <span className="toast-icon">
        {type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
      </span>
      <span className="toast-message">{message}</span>
      <button onClick={onClose} className="toast-close-btn">&times;</button>
    </div>
  );
}

export default Toast;
