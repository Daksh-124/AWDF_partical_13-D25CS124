const EventEmitter = require('events');

/**
 * TaskEvents - Centralized Event Emitter (Practical 10)
 * Decouples asynchronous side-effects (logging, notifications, auditing)
 * from the synchronous HTTP request-response pipeline.
 */
class TaskEvents extends EventEmitter {}

const taskEvents = new TaskEvents();

// Set appropriate max listener limit
taskEvents.setMaxListeners(30);

module.exports = taskEvents;
