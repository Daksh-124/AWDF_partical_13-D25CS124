import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';

function Projects() {
  // Practical 3 State Variables
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Supplementary problem states: Search filter & Error simulation
  const [searchTerm, setSearchTerm] = useState('');
  const [shouldSimulateError, setShouldSimulateError] = useState(false);

  const githubUsername = 'Daksh-124';

  const fetchRepositories = () => {
    setLoading(true);
    setError(null);

    // Endpoint URL (uses broken endpoint if error simulation is toggled)
    const apiUrl = shouldSimulateError
      ? 'https://api.github.com/users/invalid_user_name_test_12345/repos'
      : `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=30`;

    fetch(apiUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP Error ${res.status}: ${res.statusText || 'User or repositories not found'}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setRepos(data);
        } else {
          throw new Error('API returned invalid data format.');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch repositories.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // useEffect triggers fetch on mount
  useEffect(() => {
    fetchRepositories();
  }, [shouldSimulateError]);

  // Filter repositories based on search input
  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <section id="projects" className="section projects-api-section">
      <div className="section-header-api">
        <h2>GitHub Repositories (REST API)</h2>
        <p className="subtitle">
          Practical 3: Consuming REST API (<code>api.github.com/users/{githubUsername}/repos</code>) with <code>useEffect</code> & <code>useState</code>.
        </p>
      </div>

      {/* Controls & Search Filter Bar */}
      <div className="api-controls-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search repositories by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading || error !== null}
          />
        </div>

        <button
          className={`simulate-error-btn ${shouldSimulateError ? 'active' : ''}`}
          onClick={() => setShouldSimulateError(!shouldSimulateError)}
        >
          {shouldSimulateError ? '🟢 Reset to Live API' : '🧪 Test Error State'}
        </button>
      </div>

      {/* Conditional Rendering based on state */}
      {loading && <Spinner />}

      {!loading && error && (
        <ErrorMessage
          message={error}
          onRetry={fetchRepositories}
        />
      )}

      {!loading && !error && (
        <>
          <div className="repo-count-badge">
            Showing {filteredRepos.length} of {repos.length} repositories
          </div>

          {filteredRepos.length === 0 ? (
            <p className="no-repos-text">No repositories match your search criteria "{searchTerm}".</p>
          ) : (
            <div className="projects-grid">
              {filteredRepos.map((repo) => (
                <div key={repo.id} className="project-card repo-card">
                  <div className="repo-card-header">
                    <h3 className="repo-name">{repo.name}</h3>
                    <span className="star-badge" title="GitHub Stars">
                      ⭐ {repo.stargazers_count}
                    </span>
                  </div>

                  <p className="repo-description">
                    {repo.description || 'No description provided for this repository.'}
                  </p>

                  <div className="repo-meta font-small">
                    {repo.language && (
                      <span className="language-badge">🏷️ {repo.language}</span>
                    )}
                    <span className="updated-date">
                      📅 Updated: {new Date(repo.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="repo-link-btn"
                  >
                    View on GitHub &rarr;
                  </a>
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
