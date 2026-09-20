import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';

function Projects() {
  // Step 1: 3 core state variables for async API fetch
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Supplementary states: Search filter & Error simulation toggle for testing
  const [searchTerm, setSearchTerm] = useState('');
  const [simulateError, setSimulateError] = useState(false);

  // GitHub username to fetch from
  const githubUsername = 'Daksh-124';

  const fetchRepos = () => {
    setLoading(true);
    setError(null);

    // If simulateError toggle is enabled, simulate an intentional network error for lab testing
    const apiUrl = simulateError
      ? 'https://api.github.com/invalid-endpoint-for-testing-error'
      : `https://api.github.com/users/${githubUsername}/repos?sort=updated`;

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP Error ${res.status}: ${res.statusText || 'Failed to fetch repositories'}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(data);
        } else {
          throw new Error(data.message || 'Invalid API response format');
        }
      })
      .catch((err) => {
        setError(err.message || 'Network error occurred while fetching GitHub repositories.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Step 2: Trigger API fetch on component mount using useEffect with empty dependency array []
  useEffect(() => {
    fetchRepos();
  }, [simulateError]);

  // Filter repositories dynamically by search input
  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <section id="projects" className="section projects-section">
      <h2>GitHub Repositories (API Integration)</h2>
      <p className="subtitle">
        Practical 3: Consuming REST API (<code>https://api.github.com/users/{githubUsername}/repos</code>) with <code>useEffect</code>, <code>useState</code>, Loading & Error handling.
      </p>

      {/* Lab Testing Controls */}
      <div className="api-controls-bar">
        <div className="search-box">
          <label htmlFor="search-repo">🔍 Filter Repositories:</label>
          <input
            type="text"
            id="search-repo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by repo name or keyword..."
            disabled={loading || error !== null}
          />
        </div>

        <div className="error-test-box">
          <button
            onClick={() => setSimulateError(!simulateError)}
            className={`test-error-btn ${simulateError ? 'active' : ''}`}
            title="Click to test error state handling for lab evaluation"
          >
            {simulateError ? '🔴 Error Test Mode (Active)' : '🧪 Test Error State'}
          </button>
        </div>
      </div>

      {/* Conditional Rendering based on async state */}
      {loading && <Spinner />}

      {!loading && error && (
        <ErrorMessage message={error} onRetry={fetchRepos} />
      )}

      {!loading && !error && (
        <>
          <div className="repo-count-badge">
            Showing <strong>{filteredRepos.length}</strong> of <strong>{repos.length}</strong> repositories fetched live from GitHub
          </div>

          {filteredRepos.length === 0 ? (
            <div className="no-repos">
              <p>No repositories found matching "{searchTerm}".</p>
            </div>
          ) : (
            <div className="projects-container">
              {filteredRepos.map((repo) => (
                <div key={repo.id} className="project-card repo-card">
                  <div className="repo-header">
                    <h3 className="repo-name">
                      <a href={repo.html_url} target="_blank" rel="noreferrer">
                        📦 {repo.name}
                      </a>
                    </h3>
                    <span className="star-badge" title="GitHub Stars">
                      ⭐ {repo.stargazers_count}
                    </span>
                  </div>

                  <p className="repo-desc">
                    {repo.description || 'No description provided for this repository.'}
                  </p>

                  <div className="repo-footer">
                    {repo.language && (
                      <span className="language-tag">
                        <span className="lang-dot"></span> {repo.language}
                      </span>
                    )}
                    <a href={repo.html_url} target="_blank" rel="noreferrer" className="repo-link">
                      View on GitHub &rarr;
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Projects;
