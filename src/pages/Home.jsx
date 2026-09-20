import React from 'react';
import Header from '../components/Header';
import About from '../components/About';
import Skills from '../components/Skills';

function Home() {
  const studentName = "Daksh Digashia";
  const mySkills = ["HTML5", "CSS3", "JavaScript (ES6+)", "React.js", "Vite", "React Router", "Git & GitHub"];

  return (
    <div className="page-home">
      <Header name={studentName} title="Computer Science & Engineering Student | React Developer" />
      <About />
      <Skills skillList={mySkills} />
    </div>
  );
}

export default Home;
