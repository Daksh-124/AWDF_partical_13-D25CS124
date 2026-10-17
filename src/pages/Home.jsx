import React from 'react';
import Header from '../components/Header';
import About from '../components/About';
import Skills from '../components/Skills';

function Home() {
  const studentName = "Daksh Digashia";
  const mySkills = [
    "React.js",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Mongoose ODM",
    "RESTful APIs",
    "React Router",
    "JavaScript (ES6+)",
    "HTML5",
    "CSS3",
    "Vite",
    "Git & GitHub"
  ];

  return (
    <div className="page-home">
      <Header
        name={studentName}
        title="Full-Stack Developer | CSE Student (Roll No: D25CS124)"
      />
      <About />
      <Skills skillList={mySkills} />
    </div>
  );
}

export default Home;
