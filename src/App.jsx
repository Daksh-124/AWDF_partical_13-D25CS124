import React from 'react';
import NavBar from './components/NavBar';
import Header from './components/Header';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Footer from './components/Footer';
import './App.css';

function App() {
  const studentName = "Daksh Digashia";
  const mySkills = ["HTML", "CSS", "JavaScript", "React", "Git"];

  return (
    <div className="container">
      <NavBar />
      <Header name={studentName} title="Student Portfolio" />
      <About />
      <Skills skillList={mySkills} />
      <Projects />
      <Footer />
    </div>
  );
}

export default App;
