import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import ProjectsPage from './pages/ProjectsPage';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import AuthCard from './components/AuthCard';
import { getSavedUser, getCurrentUser, clearAuthToken, saveUser } from './services/api';
import './App.css';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(getSavedUser());
  const [showAuthModal, setShowAuthModal] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Verify stored token on mount
  useEffect(() => {
    async function verifyUser() {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
          saveUser(user);
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        setCurrentUser(null);
      }
    }
    verifyUser();
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    clearAuthToken();
    setCurrentUser(null);
  };

  return (
    <div className={`container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <NavBar
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {/* Global Auth Modal if triggered from Navbar */}
      {showAuthModal && (
        <div className="auth-modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
            <AuthCard
              onAuthSuccess={handleAuthSuccess}
              onCancel={() => setShowAuthModal(false)}
            />
          </div>
        </div>
      )}

      <main className="main-body">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/projects"
            element={
              <ProjectsPage
                currentUser={currentUser}
                onAuthSuccess={handleAuthSuccess}
              />
            }
          />
          <Route
            path="/tasks"
            element={
              <ProjectsPage
                currentUser={currentUser}
                onAuthSuccess={handleAuthSuccess}
              />
            }
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/learn-more" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
