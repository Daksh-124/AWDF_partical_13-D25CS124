import React from 'react';

function Projects() {
  const projects = [
    { title: 'Portfolio Website', desc: 'Personal portfolio built using Vite and React.' },
    { title: 'Feedback Form', desc: 'Simple feedback application created with HTML & CSS.' },
    { title: 'Calculator App', desc: 'Basic JavaScript calculator.' }
  ];

  return (
    <section id="projects" className="section">
      <h2>Projects</h2>
      <div className="projects-container">
        {projects.map((proj, idx) => (
          <div key={idx} className="project-card">
            <h3>{proj.title}</h3>
            <p>{proj.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;
