import React from 'react';

function Header({ name, title }) {
  return (
    <header className="hero-header">
      <div className="hero-badge">
        <span className="pulse-indicator"></span> Practical 6 • Full-Stack React + Node + MongoDB
      </div>
      <div className="hero-profile">
        <div className="hero-avatar">DD</div>
        <div className="hero-info">
          <h1 className="hero-name">{name}</h1>
          <p className="hero-title">{title}</p>
          <div className="hero-tags">
            <span className="tag-pill">Roll No: <strong>D25CS124</strong></span>
            <span className="tag-pill">Frontend: <strong>React 18 + Vite</strong></span>
            <span className="tag-pill">Backend: <strong>Express.js (Port 5000)</strong></span>
            <span className="tag-pill">Database: <strong>MongoDB + Mongoose</strong></span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
