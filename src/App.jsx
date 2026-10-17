import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import ProjectsPage from './pages/ProjectsPage';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import './App.css';

function App() {
  // useState for Dark / Light theme toggle (Supplementary Problem requirement)
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className={`container ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
      <NavBar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <main className="main-body">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/tasks" element={<ProjectsPage />} />
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
