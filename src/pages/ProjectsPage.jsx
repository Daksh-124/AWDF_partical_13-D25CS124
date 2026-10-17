import React from 'react';
import Projects from '../components/Projects';

function ProjectsPage({ currentUser, onAuthSuccess }) {
  return (
    <div className="page-projects">
      <Projects currentUser={currentUser} onAuthSuccess={onAuthSuccess} />
    </div>
  );
}

export default ProjectsPage;
