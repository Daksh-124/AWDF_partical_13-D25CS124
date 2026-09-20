import React from 'react';

function Spinner() {
  return (
    <div className="spinner-container">
      <div className="spinner-circle"></div>
      <p className="spinner-text">Fetching repositories from GitHub API...</p>
    </div>
  );
}

export default Spinner;
