import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import AuthCard from './components/AuthCard';
import LoadingFallback from './components/LoadingFallback';
import { lazyWithDelay } from './utils/lazyWithDelay';
import { getSavedUser, getCurrentUser, clearAuthToken, saveUser } from './services/api';
import './App.css';

// ============================================================================
// Practical 8: Route-Based Code Splitting via React.lazy() & Suspense
// Each route component is compiled into a separate chunk downloaded on-demand.
// Minimum delay of 300ms applied via lazyWithDelay to ensure smooth transitions.
// ============================================================================
const Home = lazyWithDelay(() => import('./pages/Home'), 300);
const ProjectsPage = lazyWithDelay(() => import('./pages/ProjectsPage'), 300);
const PerformancePage = lazyWithDelay(() => import('./pages/PerformancePage'), 300);
const Contact = lazyWithDelay(() => import('./pages/Contact'), 300);
const NotFound = lazyWithDelay(() => import('./pages/NotFound'), 200);

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
        {/* Route-level Suspense Boundary with Meaningful Fallback UI */}
        <Suspense fallback={<LoadingFallback message="Loading requested page chunk dynamically..." />}>
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
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/analytics" element={<PerformancePage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/learn-more" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;
