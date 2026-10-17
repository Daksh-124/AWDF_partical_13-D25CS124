import React from 'react';

function About() {
  return (
    <section id="about" className="section-card">
      <div className="section-title-wrapper">
        <h2 className="section-heading">About This Project</h2>
        <span className="section-subtext">Practical 6 Coursework & Full-Stack System Architecture</span>
      </div>
      
      <p className="about-lead">
        Welcome to the integrated full-stack demonstration for <strong>Practical 6</strong>. This web application bridges a modern <strong>React SPA</strong> with an <strong>Express.js RESTful API</strong> and <strong>MongoDB</strong> database, establishing real-time synchronization, state consistency, and robust CRUD data persistence.
      </p>

      <div className="architecture-grid">
        <div className="arch-card">
          <div className="arch-icon">💻</div>
          <h3>React 18 Frontend</h3>
          <p>
            Client-side Single Page Application running on <code>localhost:5173</code> with React Router v6, <code>useState</code>, and <code>useEffect</code> hooks for reactive UI state.
          </p>
        </div>

        <div className="arch-card">
          <div className="arch-icon">🚀</div>
          <h3>Express REST API</h3>
          <p>
            Node.js backend running on <code>localhost:5000</code> configured with CORS, logging middleware, content validators, and centralized error handling.
          </p>
        </div>

        <div className="arch-card">
          <div className="arch-icon">🍃</div>
          <h3>MongoDB + Mongoose</h3>
          <p>
            NoSQL document persistence with strict Mongoose schema validation (required fields, priority enums, and pre-save hooks).
          </p>
        </div>

        <div className="arch-card">
          <div className="arch-icon">⚡</div>
          <h3>Full-Stack Sync</h3>
          <p>
            End-to-end CRUD operations with optimistic UI feedback, delete confirmation safeguards, and real-time toast alerts.
          </p>
        </div>
      </div>
    </section>
  );
}

export default About;
