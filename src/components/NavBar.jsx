import React from 'react';
import { NavLink } from 'react-router-dom';

function NavBar({ isDarkMode, toggleTheme, currentUser, onLogout, onOpenAuth }) {
  return (
    <nav className="glass-navbar">
      <div className="nav-container">
        <NavLink to="/" className="brand-logo">
          <span className="brand-icon">⚡</span>
          <span className="brand-text">Daksh<span className="brand-accent">.dev</span></span>
          <span className="version-pill">AWDF P-7</span>
        </NavLink>

        <ul className="nav-menu">
          <li>
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/projects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Tasks
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Contact & Learn More
            </NavLink>
          </li>

          {/* User Auth Status / Button in Navbar */}
          <li>
            {currentUser ? (
              <div className="nav-user-badge">
                <span className="user-icon">👤</span>
                <span className="user-name-text">{currentUser.name || currentUser.email}</span>
                <button onClick={onLogout} className="btn-logout-nav" title="Sign out and clear JWT token">
                  Logout
                </button>
              </div>
            ) : (
              <button onClick={onOpenAuth} className="btn-login-nav" title="Sign in with JWT">
                🔑 Sign In
              </button>
            )}
          </li>

          <li>
            <button
              onClick={toggleTheme}
              className="theme-switch-btn"
              title="Toggle Light/Dark Theme"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;
