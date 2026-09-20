import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="section not-found-section">
      <h2>404 - Page Not Found</h2>
      <p>Oops! The page path you requested does not exist in this React Router application.</p>
      <Link to="/" className="home-link">
        &larr; Return to Home Page
      </Link>
    </section>
  );
}

export default NotFound;
