import React, { useState } from 'react';
import { loginUser, registerUser } from '../services/api';

function AuthCard({ onAuthSuccess, onCancel }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Daksh Digashia',
    email: 'daksh@example.com',
    password: 'password123'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const data = await registerUser(formData.name, formData.email, formData.password);
        if (onAuthSuccess) onAuthSuccess(data.user);
      } else {
        const data = await loginUser(formData.email, formData.password);
        if (onAuthSuccess) onAuthSuccess(data.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginUser('daksh@example.com', 'password123');
      if (onAuthSuccess) onAuthSuccess(data.user);
    } catch (err) {
      setError('Demo login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card-wrapper">
      <div className="auth-card-container">
        <div className="auth-header">
          <div className="auth-badge-pill">Practical 7 • JWT Authentication</div>
          <h3 className="auth-title">
            {isRegister ? 'Create Your Account' : 'Welcome Back'}
          </h3>
          <p className="auth-subtitle">
            {isRegister
              ? 'Register with bcrypt password hashing to access protected task routes.'
              : 'Sign in to generate a secure JWT token for API requests.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(false); setError(null); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${isRegister ? 'active' : ''}`}
            onClick={() => { setIsRegister(true); setError(null); }}
          >
            Register
          </button>
        </div>

        {/* One-Click Demo Login */}
        <div className="demo-login-box">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="btn-demo-login"
            disabled={loading}
          >
            ⚡ Quick Demo Login (Daksh Digashia)
          </button>
          <span className="demo-credentials-note">
            Pre-seeded user: <code>daksh@example.com</code> / <code>password123</code>
          </span>
        </div>

        {error && (
          <div className="auth-error-banner">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <div className="input-group">
              <label htmlFor="auth-name">Full Name</label>
              <input
                type="text"
                id="auth-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Daksh Digashia"
                disabled={loading}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              type="email"
              id="auth-email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g. daksh@example.com"
              disabled={loading}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="auth-password">Password {isRegister && '(Min 6 chars)'}</label>
            <input
              type="password"
              id="auth-password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <div className="auth-action-buttons">
            <button type="submit" className="btn-primary-gradient auth-submit-btn" disabled={loading}>
              {loading ? 'Authenticating...' : isRegister ? 'Register Account (POST /register)' : 'Sign In (POST /login)'}
            </button>
            {onCancel && (
              <button type="button" onClick={onCancel} className="btn-secondary auth-cancel-btn">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthCard;
