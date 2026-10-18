import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import Toast from './Toast';
import AuthCard from './AuthCard';
import TaskCardItem from './TaskCardItem';
import { getTasks, createTask, updateTask, deleteTask, getDbStatus, generateAiDescription } from '../services/api';

// Helper function for relative timestamps (e.g., "1 hour ago", "1 day ago")
function timeAgo(dateString) {
  if (!dateString) return 'recently';
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function Projects({ currentUser, onAuthSuccess }) {
  // 1. Core States for Data, Loading & Error Handling
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Database Status State
  const [dbStatus, setDbStatus] = useState({ connected: false, checking: true });

  // 3. Form Input State (Controlled Inputs)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  // 4. Edit & Submitting State
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 5. Search & Filter Tab States
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'pending', 'completed', 'high'

  // 6. Toast Notification State (Supplementary Problem)
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // 7. Practical 13: AI Suggestion & Rate Limit States
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiCooldown, setAiCooldown] = useState(0);
  const [aiSuggestionState, setAiSuggestionState] = useState({
    active: false,
    provider: '',
    disclaimer: '',
    fallback: false,
    reason: ''
  });

  // Cooldown countdown timer for AI requests (Supplementary Rate Limit)
  useEffect(() => {
    let timer;
    if (aiCooldown > 0) {
      timer = setInterval(() => {
        setAiCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [aiCooldown]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: 'info' });
    }, 4000);
  };

  // Check Database Status
  const checkDatabase = async () => {
    const status = await getDbStatus();
    setDbStatus({
      connected: status.connected || status.connectionState === 1,
      checking: false,
      details: status
    });
  };

  // Fetch Tasks from MongoDB Backend (Protected with JWT)
  const fetchTaskList = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(Array.isArray(data) ? data : []);
      checkDatabase();
    } catch (err) {
      if (err.status === 401) {
        setError('Authentication session expired or missing token. Please sign in again.');
      } else {
        setError(err.message || 'Unable to connect to Express backend on port 5000. Ensure server.js is running.');
      }
      setDbStatus({ connected: false, checking: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchTaskList();
    } else {
      setLoading(false);
    }
    checkDatabase();
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle AI Description Generation (Practical 13)
  const handleGenerateAiDescription = async () => {
    if (!formData.title.trim()) {
      showToast('Please enter a task title first before generating an AI description!', 'error');
      return;
    }

    if (aiCooldown > 0) {
      showToast(`Rate limit active: Please wait ${aiCooldown}s before requesting another AI suggestion.`, 'info');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const result = await generateAiDescription(formData.title.trim(), formData.description);
      if (result.description) {
        setFormData((prev) => ({
          ...prev,
          description: result.description,
          priority: result.suggestedPriority || prev.priority
        }));
        setAiSuggestionState({
          active: true,
          provider: result.provider || (result.fallback ? 'Local Graceful Fallback' : 'OpenAI gpt-4o-mini'),
          disclaimer: result.disclaimer || '⚠️ AI-generated suggestion: Please review, edit, and verify before saving.',
          fallback: Boolean(result.fallback),
          reason: result.reason || ''
        });
        setAiCooldown(60); // 60s rate limit window
        showToast(
          result.fallback
            ? 'Intelligent fallback description applied (graceful degradation)!'
            : 'AI description generated and applied to form!',
          'success'
        );
      }
    } catch (err) {
      showToast(err.message || 'AI request failed. You can still type a description manually.', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Handle Form Submit: Create (POST) or Update (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Task title is required by validation middleware!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        // PUT /tasks/:id
        const updated = await updateTask(editingId, formData);
        setTasks((prev) => prev.map((t) => ((t._id || t.id) === editingId ? updated : t)));
        showToast('Task updated successfully in MongoDB!', 'success');
        setEditingId(null);
      } else {
        // POST /tasks with optimistic UI
        const optimisticId = 'temp-' + Date.now();
        const optimisticTask = {
          _id: optimisticId,
          title: formData.title.trim(),
          description: formData.description,
          priority: formData.priority,
          completed: false,
          createdAt: new Date().toISOString()
        };

        setTasks((prev) => [optimisticTask, ...prev]);

        const serverTask = await createTask(formData);
        setTasks((prev) => prev.map((t) => (t._id === optimisticId ? serverTask : t)));
        showToast('New task persisted to MongoDB with JWT auth!', 'success');
      }

      setFormData({ title: '', description: '', priority: 'medium' });
    } catch (err) {
      fetchTaskList();
      showToast(err.message || 'Operation failed on server', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Mode Setup
  const handleEditClick = (task) => {
    const id = task._id || task.id;
    setEditingId(id);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium'
    });
    const formEl = document.getElementById('task-form-anchor');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', description: '', priority: 'medium' });
  };

  // Toggle Complete (Optimistic PUT)
  const handleToggleComplete = async (task) => {
    const id = task._id || task.id;
    const newStatus = !task.completed;

    setTasks((prev) =>
      prev.map((t) => ((t._id || t.id) === id ? { ...t, completed: newStatus } : t))
    );

    try {
      const updated = await updateTask(id, { completed: newStatus });
      setTasks((prev) => prev.map((t) => ((t._id || t.id) === id ? updated : t)));
      showToast(`Task marked as ${newStatus ? 'Completed' : 'Pending'}!`, 'success');
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => ((t._id || t.id) === id ? { ...t, completed: !newStatus } : t))
      );
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Delete Task with Confirmation Dialog (Supplementary Problem)
  const handleDeleteTask = async (task) => {
    const id = task._id || task.id;
    const confirmed = window.confirm(`Are you sure you want to delete "${task.title}" permanently from MongoDB?`);
    if (!confirmed) return;

    const previous = [...tasks];
    setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));

    try {
      await deleteTask(id);
      showToast('Task removed from MongoDB collection!', 'success');
    } catch (err) {
      setTasks(previous);
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  // Filtering Logic
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'pending') return !t.completed;
    if (activeFilter === 'completed') return t.completed;
    if (activeFilter === 'high') return t.priority === 'high';
    return true;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;
  const highPriorityCount = tasks.filter((t) => t.priority === 'high').length;

  return (
    <section id="projects" className="section-card task-manager-section">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'info' })}
      />

      {/* Header & Status Banner */}
      <div className="task-header-block">
        <div>
          <h2 className="section-heading">Full-Stack Task Management</h2>
          <p className="section-subtext">
            Practical 7: Express Middleware Pipeline with JWT-based Authentication & Input Validation.
          </p>
        </div>

        <div className="status-badge-container">
          <div className={`db-live-badge ${dbStatus.connected ? 'badge-connected' : 'badge-disconnected'}`}>
            <span className="live-dot"></span>
            {dbStatus.connected ? '🟢 MongoDB + JWT Active' : '🟠 DB Fallback / Connecting'}
          </div>
          {currentUser && (
            <button onClick={fetchTaskList} className="btn-icon-refresh" title="Refresh data from MongoDB">
              🔄 Refresh
            </button>
          )}
        </div>
      </div>

      {/* If User Not Authenticated: Render Practical 7 Auth Card Requirement */}
      {!currentUser ? (
        <div className="auth-required-container">
          <div className="auth-lock-banner">
            <span className="lock-icon">🔒</span>
            <div>
              <h3>Authentication Required (Practical 7)</h3>
              <p>
                All task endpoints (<code>/tasks</code>) are protected by Express JWT authentication middleware. Please sign in or register below to generate a secure Bearer token.
              </p>
            </div>
          </div>

          <AuthCard onAuthSuccess={onAuthSuccess} />
        </div>
      ) : (
        <>
          {/* Authenticated User Session Bar */}
          <div className="auth-user-session-bar">
            <div className="session-user-info">
              <span className="session-user-avatar">👤</span>
              <span>
                Authenticated as: <strong>{currentUser.name || currentUser.email}</strong> ({currentUser.email})
              </span>
            </div>
            <span className="token-expiry-tag">🔒 JWT Bearer Token Active (1h Expiry)</span>
          </div>

          {/* Metrics Cards Bar */}
          <div className="metrics-grid">
            <div className="metric-box">
              <span className="metric-num">{totalCount}</span>
              <span className="metric-label">Total Tasks</span>
            </div>
            <div className="metric-box">
              <span className="metric-num text-success">{completedCount}</span>
              <span className="metric-label">Completed</span>
            </div>
            <div className="metric-box">
              <span className="metric-num text-warning">{pendingCount}</span>
              <span className="metric-label">Pending</span>
            </div>
            <div className="metric-box">
              <span className="metric-num text-danger">{highPriorityCount}</span>
              <span className="metric-label">High Priority</span>
            </div>
          </div>

          {/* Task Creation & Edit Form */}
          <div id="task-form-anchor" className="modern-form-card">
            <div className="form-card-header">
              <h3>{editingId ? '✏️ Edit Task Details' : '➕ Create New Task in MongoDB'}</h3>
              {editingId && (
                <button onClick={cancelEdit} className="btn-cancel-small">
                  Cancel Edit ✖
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="task-styled-form">
              <div className="form-row-main">
                <div className="input-group flex-2">
                  <label htmlFor="title">Task Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g. Implement JWT authentication middleware"
                    disabled={isSubmitting}
                    required
                  />
                </div>

                <div className="input-group flex-3">
                  <div className="label-with-ai-action">
                    <label htmlFor="description">Description</label>
                    <button
                      type="button"
                      className="btn-ai-generate"
                      onClick={handleGenerateAiDescription}
                      disabled={isGeneratingAi || aiCooldown > 0 || isSubmitting}
                      title={aiCooldown > 0 ? `Rate limit cooldown active: ${aiCooldown}s remaining` : 'Generate description with AI'}
                    >
                      {isGeneratingAi ? (
                        <>
                          <span className="spinner-dots">⏳</span> Generating AI...
                        </>
                      ) : aiCooldown > 0 ? (
                        <>
                          <span>⏳</span> Cooldown ({aiCooldown}s)
                        </>
                      ) : (
                        <>
                          <span>✨</span> Generate description
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g. Validate bcrypt password hashing and token generation"
                    disabled={isSubmitting}
                  />
                  {aiSuggestionState.active && (
                    <div className="ai-suggestion-box">
                      <div className="ai-suggestion-header">
                        <span className="ai-badge-chip">
                          ✨ {aiSuggestionState.provider}
                        </span>
                        {aiSuggestionState.fallback && (
                          <span className="ai-badge-fallback">Graceful Fallback Mode</span>
                        )}
                      </div>
                      <p className="ai-disclaimer-text">{aiSuggestionState.disclaimer}</p>
                      <small className="ai-hint-text">💡 This suggestion is editable — feel free to customize the text above before saving.</small>
                    </div>
                  )}
                </div>

                <div className="input-group flex-1">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  >
                    <option value="low">🔵 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>

              <div className="form-footer-actions">
                <button type="submit" className="btn-primary-gradient" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving to Database...' : editingId ? '💾 Update Task (PUT)' : '🚀 Add Task with JWT Auth (POST)'}
                </button>
              </div>
            </form>
          </div>

          {/* Filter Tabs & Search Bar */}
          <div className="filter-and-search-bar">
            <div className="filter-pills">
              <button
                className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All ({totalCount})
              </button>
              <button
                className={`filter-pill ${activeFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveFilter('pending')}
              >
                Pending ({pendingCount})
              </button>
              <button
                className={`filter-pill ${activeFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveFilter('completed')}
              >
                Completed ({completedCount})
              </button>
              <button
                className={`filter-pill ${activeFilter === 'high' ? 'active' : ''}`}
                onClick={() => setActiveFilter('high')}
              >
                High Priority ({highPriorityCount})
              </button>
            </div>

            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or description..."
                disabled={loading}
              />
              {searchTerm && (
                <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* "Your Tasks" Header matching reference image */}
          <div className="your-tasks-header-row">
            <h3 className="your-tasks-title">Your Tasks</h3>
          </div>

          {/* Async State Rendering */}
          {loading && <Spinner />}

          {!loading && error && (
            <ErrorMessage message={error} onRetry={fetchTaskList} />
          )}

          {!loading && !error && (
            <>
              {filteredTasks.length === 0 ? (
                <div className="empty-state-box">
                  <span className="empty-icon">📭</span>
                  <h4>No tasks found</h4>
                  <p>
                    {searchTerm
                      ? `No tasks match your search "${searchTerm}".`
                      : activeFilter !== 'all'
                      ? `No tasks match the "${activeFilter}" filter.`
                      : 'Start by creating your first task in MongoDB using the form above!'}
                  </p>
                </div>
              ) : (
                <div className="task-cards-grid">
                  {filteredTasks.map((task) => (
                    <TaskCardItem
                      key={task._id || task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteTask}
                      timeAgoText={timeAgo(task.createdAt)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}

export default Projects;
