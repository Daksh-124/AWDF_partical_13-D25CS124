import React, { useState } from 'react';

function Contact() {
  // useState 1: Controlled Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // useState 2: Toggle UI visibility (Help Tooltip / Info box)
  const [showHelp, setShowHelp] = useState(false);

  // Submitted state for feedback
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <section className="section contact-section">
      <h2>Contact Me</h2>
      <p className="subtitle">Practical 2: Controlled Form Input & State Management with <code>useState</code></p>

      {/* UI Visibility Toggle (useState requirement 2) */}
      <div className="help-toggle-box">
        <button 
          className="toggle-btn"
          onClick={() => setShowHelp(!showHelp)}
        >
          {showHelp ? 'Hide Form Instructions ⬆️' : 'Need Help? Show Instructions ℹ️'}
        </button>
        
        {showHelp && (
          <div className="help-content">
            <p>💡 <strong>Practical 2 Note:</strong> This form uses React <code>useState</code> to track user inputs in real time without refreshing the browser page. Try typing in the message box below to watch the live character counter!</p>
          </div>
        )}
      </div>

      {submitted ? (
        <div className="success-message">
          <h3>Thank you, {formData.name}! 🎉</h3>
          <p>Your message has been recorded via React state management.</p>
          <button onClick={() => setSubmitted(false)} className="reset-btn">Send Another Message</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Your Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Your Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Your Message:</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Type your message here..."
              rows="5"
              required
            ></textarea>
            {/* Live Character Count Requirement */}
            <div className="char-count">
              Live Character Count: <strong>{formData.message.length}</strong> characters
            </div>
          </div>

          <button type="submit" className="submit-btn">Send Message</button>
        </form>
      )}
    </section>
  );
}

export default Contact;
