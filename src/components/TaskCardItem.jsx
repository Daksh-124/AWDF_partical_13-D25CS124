import React from 'react';

/**
 * TaskCardItem Component
 * Wrapped with React.memo to prevent unnecessary re-renders when
 * parent components re-render (e.g. typing in search filter, toggling other tasks).
 * Profiling evidence for Practical 8 post-laboratory requirements.
 */
function TaskCardItem({ task, onToggleComplete, onEdit, onDelete, timeAgoText }) {
  const id = task._id || task.id;
  const isCompleted = task.completed === true;
  const priority = task.priority || 'medium';

  return (
    <div className={`task-modern-card priority-border-${priority} ${isCompleted ? 'is-completed' : ''}`}>
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

      {/* Status Checkbox & Relative Time Row */}
      <div className="card-status-time-row">
        <div
          className="status-clickable-toggle"
          onClick={() => onToggleComplete(task)}
        >
          <span className={`status-checkbox-icon ${isCompleted ? 'checked' : ''}`}>
            {isCompleted ? '☑' : '☐'}
          </span>
          <span className="status-label-text">
            {isCompleted ? 'Completed' : 'Mark Complete'}
          </span>
        </div>

        <span className="task-relative-time">
          {timeAgoText}
        </span>
      </div>

      {/* Prominent Action Buttons */}
      <div className="card-actions-prominent">
        <button
          onClick={() => onEdit(task)}
          className="btn-pill-action btn-pill-edit"
          title="Edit Task"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(task)}
          className="btn-pill-action btn-pill-delete"
          title="Delete Task from MongoDB"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

// React.memo prevents re-rendering if task props and handler references did not change
export default React.memo(TaskCardItem);
