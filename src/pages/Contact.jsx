import React, { useState } from 'react';

function Contact() {
  // Controlled Form State
  const [formData, setFormData] = useState({
    name: 'Daksh Digashia',
    email: 'daksh.digashia@gmail.com',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const maxChars = 250;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.message.trim()) {
      setSubmitted(true);
    }
  };

  const charCount = formData.message.length;

  return (
    <div className="contact-learn-page">
      {/* Page Header */}
      <div className="learn-page-header">
        <h1 className="learn-page-title">Contact & Learn More</h1>
        <p className="learn-page-subtitle">
          Get in touch or check out documentation and repository for Practical 6.
        </p>
        <div className="learn-header-actions">
          <a
            href="https://github.com/Daksh-124/AWDF_partical5-D25CS124"
            target="_blank"
            rel="noreferrer"
            className="learn-github-btn"
          >
            🐙 View on GitHub
          </a>
        </div>
      </div>

      {/* Card 1: Contact Form */}
      <div className="learn-card contact-box-card">
        <div className="contact-info-header">
          <span className="contact-email-badge">✉️ daksh.digashia@gmail.com</span>
        </div>

        {submitted ? (
          <div className="contact-alert-success">
            <span className="alert-icon">🎉</span>
            <div>
              <h4>Message Sent Successfully!</h4>
              <p>Thank you, {formData.name}. Your message has been captured via React state.</p>
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData((prev) => ({ ...prev, message: '' }));
              }}
              className="btn-reset-message"
            >
              Write Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="learn-contact-form">
            <div className="input-field-group">
              <label htmlFor="message">Your Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Send me a message here..."
                rows="4"
                required
              ></textarea>
              <div className="char-count-row">
                <span>{charCount} / {maxChars} characters</span>
              </div>
            </div>

            <button type="submit" className="btn-send-message">
              Send Message
            </button>
          </form>
        )}
      </div>

      {/* Card 2: About This Project */}
      <div className="learn-card about-project-card">
        <h2 className="card-section-title">About This Project</h2>

        <div className="project-meta-list">
          <div className="meta-item">
            <span className="meta-label">Course:</span>
            <span className="meta-value">Advanced Web Development Frameworks (AWDF)</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Practical:</span>
            <span className="meta-value">6 — Full-Stack Integration (React + Express + MongoDB)</span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Tech Stack:</span>
            <span className="meta-value">
              React 18, Vite | Express | Node.js | MongoDB, Mongoose 8
            </span>
          </div>
        </div>

        {/* Key Learning Outcomes */}
        <div className="outcomes-section">
          <h3 className="sub-section-title">Key Learning Outcomes</h3>
          <ul className="outcomes-list">
            <li>
              <span className="bullet-dot">•</span>
              <span><strong>How client-side state models hierarchical component data:</strong> Managing component lifecycle and state transitions cleanly using React <code>useState</code> and <code>useEffect</code>.</span>
            </li>
            <li>
              <span className="bullet-dot">•</span>
              <span><strong>How React UI and routing in frontend communicates to backend:</strong> Client-side multi-page routing with React Router without page reloads while querying REST endpoints.</span>
            </li>
            <li>
              <span className="bullet-dot">•</span>
              <span><strong>Building a centralized Fetch client to handle request lifecycle:</strong> Modular API service layer (<code>api.js</code>) abstracting base URLs, headers, and error parsing.</span>
            </li>
            <li>
              <span className="bullet-dot">•</span>
              <span><strong>Managing end-to-end CRUD operations:</strong> Create, Read, Update, and Delete tasks across the complete frontend-to-database pipeline.</span>
            </li>
            <li>
              <span className="bullet-dot">•</span>
              <span><strong>How live MongoDB backend stores and updates document data:</strong> Persistent NoSQL database storage running on MongoDB with Mongoose ODM schemas.</span>
            </li>
            <li>
              <span className="bullet-dot">•</span>
              <span><strong>Triggering asynchronous API operations & UI response:</strong> Asynchronous dispatch with async/await, Promise resolution, and error bubbling.</span>
            </li>
            <li>
              <span className="bullet-dot">•</span>
              <span><strong>Consumer response updates with optimistic updates or background:</strong> Immediately reflecting user changes on the screen while syncing with the server.</span>
            </li>
            <li>
              <span className="bullet-dot">•</span>
              <span><strong>Handling Mongoose validation errors with structured responses:</strong> Returning clear 400 JSON errors for missing required fields instead of raw server crashes.</span>
            </li>
          </ul>
        </div>

        {/* Technologies Used */}
        <div className="technologies-section">
          <h3 className="sub-section-title">Technologies Used</h3>
          <div className="tech-badge-container">
            <span className="tech-pill">React 18.x + Vite</span>
            <span className="tech-pill">Tailwind / Modern CSS</span>
            <span className="tech-pill">Express Server</span>
            <span className="tech-pill">MongoDB / Atlas</span>
            <span className="tech-pill">Mongoose 8</span>
            <span className="tech-pill">CORS Middleware</span>
            <span className="tech-pill">Node.js Runtime</span>
          </div>
        </div>

        {/* Dev Run-Down */}
        <div className="dev-rundown-section">
          <h3 className="sub-section-title">Dev Run-Down</h3>
          <ol className="rundown-steps">
            <li>1. Ensure the MongoDB service is running (<code>mongodb://127.0.0.1:27017/taskmanager</code>).</li>
            <li>2. Start the Node.js Express backend API on port 5000 (<code>node server.js</code>).</li>
            <li>3. Start the Vite React development server on port 5173 (<code>npm run dev</code>).</li>
            <li>4. Open the browser, interact with live tasks, create new items, and observe real-time database persistence!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default Contact;
