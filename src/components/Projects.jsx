import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import Toast from './Toast';
import { getTasks, createTask, updateTask, deleteTask, getDbStatus } from '../services/api';

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

function Projects() {
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

  // Fetch Tasks from MongoDB Backend
  const fetchTaskList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(Array.isArray(data) ? data : []);
      checkDatabase();
    } catch (err) {
      setError(err.message || 'Unable to connect to Express backend on port 5000. Ensure server.js is running.');
      setDbStatus({ connected: false, checking: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskList();
    checkDatabase();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Form Submit: Create (POST) or Update (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Task title is required by Mongoose schema!', 'error');
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
        showToast('New task persisted to MongoDB!', 'success');
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
            Practical 6: End-to-end integration between React Frontend (<code>:5173</code>), Express Backend (<code>:5000</code>), and MongoDB database.
          </p>
        </div>

        <div className="status-badge-container">
          <div className={`db-live-badge ${dbStatus.connected ? 'badge-connected' : 'badge-disconnected'}`}>
            <span className="live-dot"></span>
            {dbStatus.connected ? '🟢 MongoDB Connected' : '🟠 DB Fallback / Connecting'}
          </div>
          <button onClick={fetchTaskList} className="btn-icon-refresh" title="Refresh data from MongoDB">
            🔄 Refresh
          </button>
        </div>
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
                placeholder="e.g. Implement full-stack CORS authentication"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="input-group flex-3">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g. Verify CRUD requests in browser Network tab"
                disabled={isSubmitting}
              />
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
              {isSubmitting ? 'Saving to Database...' : editingId ? '💾 Update Task (PUT)' : '🚀 Add Task to MongoDB (POST)'}
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
              {filteredTasks.map((task) => {
                const id = task._id || task.id;
                const isCompleted = task.completed === true;
                const priority = task.priority || 'medium';

                return (
                  <div
                    key={id}
                    className={`task-modern-card priority-border-${priority} ${isCompleted ? 'is-completed' : ''}`}
                  >
                    <div className="card-top-row">
                      <div className="card-title-group">
                        <h4 className="task-title-text">{task.title}</h4>
                        <span className={`badge-pill badge-${priority}`}>
                          {priority === 'high' ? '🔴 HIGH' : priority === 'medium' ? '🟡 MEDIUM' : '🔵 LOW'}
                        </span>
                      </div>
                    </div>

                    <p className="task-desc-text">
                      {task.description || 'No additional details provided.'}
                    </p>

                    {/* Status Checkbox & Relative Time Row matching reference image */}
                    <div className="card-status-time-row">
                      <div
                        className="status-clickable-toggle"
                        onClick={() => handleToggleComplete(task)}
                      >
                        <span className={`status-checkbox-icon ${isCompleted ? 'checked' : ''}`}>
                          {isCompleted ? '☑' : '☐'}
                        </span>
                        <span className="status-label-text">
                          {isCompleted ? 'Completed' : 'Mark Complete'}
                        </span>
                      </div>

                      <span className="task-relative-time">
                        {timeAgo(task.createdAt)}
                      </span>
                    </div>

                    {/* Prominent Edit and Delete Buttons matching reference image */}
                    <div className="card-actions-prominent">
                      <button
                        onClick={() => handleEditClick(task)}
                        className="btn-pill-action btn-pill-edit"
                        title="Edit Task"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteTask(task)}
                        className="btn-pill-action btn-pill-delete"
                        title="Delete Task from MongoDB"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Projects;
