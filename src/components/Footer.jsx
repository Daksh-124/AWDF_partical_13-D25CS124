import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="modern-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="brand-icon">⚡</span>
            <span>Daksh Digashia</span>
          </div>
          <p className="footer-tagline">
            B.Tech CSE Student • Roll No: <strong>D25CS124</strong>
          </p>
        </div>

        <div className="footer-info-col">
          <span className="footer-label">Course Practical</span>
          <p>AWDF Practical 6 • Full-Stack Integration (React + Express + MongoDB)</p>
        </div>

        <div className="footer-links-col">
          <span className="footer-label">Quick Links</span>
          <div className="footer-link-group">
            <a href="http://localhost:5000/tasks" target="_blank" rel="noreferrer" className="footer-link">
              📡 Express API (:5000)
            </a>
            <a href="http://localhost:5000/api/db-status" target="_blank" rel="noreferrer" className="footer-link">
              🍃 MongoDB Status
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <p>&copy; {currentYear} Daksh Digashia. Built with React 18, Vite, Express, and MongoDB.</p>
      </div>
    </footer>
  );
}

export default Footer;
