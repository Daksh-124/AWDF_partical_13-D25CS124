import React from 'react';

function Skills({ skillList }) {
  // Enhanced skill metadata for visual flair
  const skillIcons = {
    'HTML5': '🌐',
    'CSS3': '🎨',
    'JavaScript (ES6+)': '⚡',
    'React.js': '⚛️',
    'Vite': '⚡',
    'React Router': '🧭',
    'Node.js': '🟢',
    'Express.js': '🚂',
    'MongoDB': '🍃',
    'Mongoose ODM': '📦',
    'RESTful APIs': '📡',
    'Git & GitHub': '🐙'
  };

  const allSkills = skillList && skillList.length > 0 ? skillList : [
    'HTML5', 'CSS3', 'JavaScript (ES6+)', 'React.js', 'Vite', 'React Router',
    'Node.js', 'Express.js', 'MongoDB', 'Mongoose ODM', 'RESTful APIs', 'Git & GitHub'
  ];

  return (
    <section id="skills" className="section-card">
      <div className="section-title-wrapper">
        <h2 className="section-heading">Technical Skills & Stack</h2>
        <span className="section-subtext">Technologies applied across Practicals 1 through 6</span>
      </div>

      <div className="skills-grid">
        {allSkills.map((skill) => (
          <div key={skill} className="skill-chip">
            <span className="skill-icon">{skillIcons[skill] || '💻'}</span>
            <span className="skill-title">{skill}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Skills;
