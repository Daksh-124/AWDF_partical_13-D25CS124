import React from 'react';

function Spinner() {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p className="loading-text">Fetching repositories from GitHub API...</p>
    </div>
  );
}

export default Spinner;
