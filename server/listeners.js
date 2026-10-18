const taskEvents = require('./events');

// In-memory buffer storing recent background event execution records (Practical 10)
const eventHistory = [];
const MAX_HISTORY = 60;

function recordEvent(entry) {
  eventHistory.unshift(entry);
  if (eventHistory.length > MAX_HISTORY) {
    eventHistory.pop();
  }
}

/**
 * 1. Listener for 'task-created' event
 * Handles notification logging asynchronously without delaying HTTP response.
 */
taskEvents.on('task-created', (payload) => {
  const handledAt = new Date().toISOString();
  const task = payload.task || payload;
  const emittedAt = payload.emittedAt || handledAt;
  const user = payload.user ? (payload.user.name || payload.user.email) : 'System/Admin';

  console.log(`[Notification Listener] Task "${task.title}" created at ${handledAt} | Assigned: ${user}`);

  // Simulate non-blocking asynchronous I/O (e.g. email dispatch / external webhook)
  setTimeout(() => {
    const completedAt = new Date().toISOString();
    console.log(`[Background Worker] Async email notification completed for "${task.title}" at ${completedAt}`);

    recordEvent({
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type: 'task-created',
      title: task.title,
      taskId: task._id || task.id,
      user,
      emittedAt,
      handledAt,
      completedAt,
      details: 'Async email notification dispatched successfully in background',
      status: 'completed'
    });
  }, 120);
});

/**
 * 2. Listener for 'task-deleted' event (Supplementary Requirement)
 */
taskEvents.on('task-deleted', (payload) => {
  const handledAt = new Date().toISOString();
  const task = payload.task || payload;
  const emittedAt = payload.emittedAt || handledAt;
  const user = payload.user ? (payload.user.name || payload.user.email) : 'System/Admin';

  console.log(`[Notification Listener] Task "${task.title || task._id}" DELETED at ${handledAt} by ${user}`);

  setTimeout(() => {
    const completedAt = new Date().toISOString();
    console.log(`[Background Worker] Audit log archived for deleted task "${task.title || task._id}" at ${completedAt}`);

    recordEvent({
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type: 'task-deleted',
      title: task.title || 'Task #' + (task._id || task.id),
      taskId: task._id || task.id,
      user,
      emittedAt,
      handledAt,
      completedAt,
      details: 'Task deletion audit recorded in background archive',
      status: 'completed'
    });
  }, 100);
});

/**
 * 3. Listener for 'task-updated' event
 */
taskEvents.on('task-updated', (payload) => {
  const handledAt = new Date().toISOString();
  const task = payload.task || payload;
  const emittedAt = payload.emittedAt || handledAt;
  const user = payload.user ? (payload.user.name || payload.user.email) : 'System/Admin';

  console.log(`[Notification Listener] Task "${task.title}" UPDATED at ${handledAt} | Status: ${task.completed ? 'Completed' : 'Pending'}`);

  setTimeout(() => {
    const completedAt = new Date().toISOString();
    recordEvent({
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type: 'task-updated',
      title: task.title,
      taskId: task._id || task.id,
      user,
      emittedAt,
      handledAt,
      completedAt,
      details: `Status: ${task.completed ? 'Completed' : 'Pending'}, Priority: ${task.priority || 'medium'}`,
      status: 'completed'
    });
  }, 80);
});

/**
 * 4. Listener for 'slow-notification' event (Supplementary Requirement)
 * Simulates a heavy 2000ms background process to empirically prove non-blocking behavior.
 */
taskEvents.on('slow-notification', (payload) => {
  const handledAt = new Date().toISOString();
  const emittedAt = payload.emittedAt || handledAt;
  console.log(`[Heavy Worker] Started 2000ms background processing for "${payload.label}" at ${handledAt}`);

  setTimeout(() => {
    const completedAt = new Date().toISOString();
    console.log(`[Heavy Worker] FINISHED 2000ms background processing for "${payload.label}" at ${completedAt}`);

    recordEvent({
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      type: 'slow-notification',
      title: payload.label,
      taskId: 'sim_' + Date.now(),
      user: payload.user || 'Demo User',
      emittedAt,
      handledAt,
      completedAt,
      details: 'Simulated heavy background report generation (2000ms delay without blocking API response)',
      status: 'completed'
    });
  }, 2000);
});

/**
 * 5. Global Error Listener (Supplementary Requirement)
 * Catches unhandled event errors to safeguard server reliability.
 */
taskEvents.on('error', (err) => {
  console.error('[Event Error Handler] Caught EventEmitter exception:', err.message);
  recordEvent({
    id: 'evt_err_' + Date.now(),
    type: 'error',
    title: 'Event Exception Caught',
    details: err.message,
    emittedAt: new Date().toISOString(),
    handledAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    status: 'error'
  });
});

console.log('✅ Event listeners registered: [task-created, task-deleted, task-updated, slow-notification, error]');

module.exports = {
  getEventHistory: () => [...eventHistory],
  clearEventHistory: () => { eventHistory.length = 0; }
};
