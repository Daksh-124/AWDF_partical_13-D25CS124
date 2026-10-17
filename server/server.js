const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. CORE MIDDLEWARE
// ==========================================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// 2. REQUEST LOGGING MIDDLEWARE
// ==========================================
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[LOG] ${req.method} ${req.url} - ${timestamp}`);
  next();
});

// ==========================================
// 3. MONGODB DATABASE CONNECTION
// ==========================================
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager';

let isDbConnected = false;

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // Fast failover if local DB service is offline
})
  .then(() => {
    isDbConnected = true;
    console.log('✅ MongoDB connected successfully via Mongoose ODM');
  })
  .catch((err) => {
    console.warn('⚠️ MongoDB connection warning:', err.message);
    console.warn('⚡ Operating in Mongoose Fallback Mode for Lab Testing.');
  });

// Database status endpoint
app.get('/api/db-status', (req, res) => {
  res.json({
    connected: isDbConnected,
    connectionState: mongoose.connection.readyState,
    readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
    mongoUri: MONGO_URI
  });
});

// ==========================================
// 4. CONTENT-TYPE VALIDATION MIDDLEWARE
// ==========================================
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Header "Content-Type: application/json" is required for POST and PUT requests.',
        status: 400
      });
    }
  }
  next();
};

app.use(validateContentType);

// In-memory fallback array for lab environments without active MongoDB service
let fallbackTasks = [
  { _id: '64f1a2b3c4d5e6f7a8b9c0d1', title: 'Connect MongoDB with Mongoose', description: 'Configure MONGO_URI and Mongoose connection', completed: true, priority: 'high', createdAt: new Date() },
  { _id: '64f1a2b3c4d5e6f7a8b9c0d2', title: 'Define Task Schema with Enums', description: 'Enforce title required, completed default, and priority enum', completed: false, priority: 'medium', createdAt: new Date() }
];

// Helper to simulate Mongoose validation locally if DB is offline
function validateTaskSchemaFallback(data, isUpdate = false) {
  if (!isUpdate && (!data.title || typeof data.title !== 'string' || !data.title.trim())) {
    const err = new Error('Task validation failed: title: Task title is required');
    err.name = 'ValidationError';
    err.errors = { title: { message: 'Task title is required', path: 'title' } };
    throw err;
  }
  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    const err = new Error('Task validation failed: priority: Priority must be either low, medium, or high');
    err.name = 'ValidationError';
    err.errors = { priority: { message: 'Priority must be either low, medium, or high', path: 'priority' } };
    throw err;
  }
}

// ==========================================
// 5. MONGOOSE CRUD ROUTES
// ==========================================

// GET /tasks - Retrieve all tasks from MongoDB
app.get('/tasks', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const tasks = await Task.find().sort({ createdAt: -1 });
      return res.status(200).json(tasks);
    }
    // Fallback mode
    res.status(200).json(fallbackTasks);
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id - Retrieve a single task by ID
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({
          error: 'Task Not Found',
          message: `No task found in MongoDB with ID ${id}`,
          status: 404
        });
      }
      return res.status(200).json(task);
    }

    // Fallback mode
    const task = fallbackTasks.find((t) => t._id === id || t.id === id);
    if (!task) {
      return res.status(404).json({
        error: 'Task Not Found',
        message: `No task found with ID ${id}`,
        status: 404
      });
    }
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

// POST /tasks - Create a new task using Mongoose model (Task.create)
app.post('/tasks', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const newTask = await Task.create(req.body);
      return res.status(201).json(newTask);
    }

    // Fallback mode with schema validation
    validateTaskSchemaFallback(req.body);
    const newTask = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: req.body.title.trim(),
      description: req.body.description || '',
      completed: req.body.completed || false,
      priority: req.body.priority || 'medium',
      createdAt: new Date()
    };
    fallbackTasks.unshift(newTask);
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id - Update an existing task using Mongoose (findByIdAndUpdate)
app.put('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true // Enforces Mongoose schema validation on update
      });

      if (!updatedTask) {
        return res.status(404).json({
          error: 'Task Not Found',
          message: `Cannot update. No task found in MongoDB with ID ${id}`,
          status: 404
        });
      }
      return res.status(200).json(updatedTask);
    }

    // Fallback mode
    validateTaskSchemaFallback(req.body, true);
    const taskIndex = fallbackTasks.findIndex((t) => t._id === id || t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({
        error: 'Task Not Found',
        message: `Cannot update. Task with ID ${id} does not exist`,
        status: 404
      });
    }

    if (req.body.title !== undefined) fallbackTasks[taskIndex].title = req.body.title.trim();
    if (req.body.description !== undefined) fallbackTasks[taskIndex].description = req.body.description;
    if (req.body.completed !== undefined) fallbackTasks[taskIndex].completed = req.body.completed;
    if (req.body.priority !== undefined) fallbackTasks[taskIndex].priority = req.body.priority;

    res.status(200).json(fallbackTasks[taskIndex]);
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id - Delete a task using Mongoose (findByIdAndDelete)
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const deletedTask = await Task.findByIdAndDelete(id);
      if (!deletedTask) {
        return res.status(404).json({
          error: 'Task Not Found',
          message: `Cannot delete. No task found in MongoDB with ID ${id}`,
          status: 404
        });
      }
      return res.status(200).json({
        message: 'Task deleted successfully from MongoDB',
        deletedTask
      });
    }

    // Fallback mode
    const taskIndex = fallbackTasks.findIndex((t) => t._id === id || t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({
        error: 'Task Not Found',
        message: `Cannot delete. Task with ID ${id} does not exist`,
        status: 404
      });
    }

    const deletedTask = fallbackTasks.splice(taskIndex, 1)[0];
    res.status(200).json({
      message: 'Task deleted successfully',
      deletedTask
    });
  } catch (err) {
    next(err);
  }
});

// Test endpoint to trigger a deliberate 500 error
app.get('/api/error-test', (req, res, next) => {
  next(new Error('Deliberate test error for global error handler pipeline.'));
});

// ==========================================
// 6. CUSTOM 404 HANDLER FOR UNDEFINED ROUTES
// ==========================================
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Route Not Found',
    message: `The requested path '${req.url}' does not exist on this server.`,
    status: 404
  });
});

// ==========================================
// 7. STRUCTURED MONGOOSE & GLOBAL ERROR HANDLER
// Converts raw Mongoose errors into clean, structured JSON responses
// ==========================================
app.use((err, req, res, next) => {
  console.error('[ERROR HANDLER LOG]:', err.name, err.message);

  // Mongoose Validation Error (e.g. required field missing or invalid enum)
  if (err.name === 'ValidationError') {
    const errorDetails = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Mongoose schema validation failed',
      details: errorDetails.length > 0 ? errorDetails : [err.message],
      status: 400
    });
  }

  // Mongoose CastError (invalid ObjectId format)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID Format',
      message: `The provided ID value '${err.value}' is not a valid MongoDB ObjectId.`,
      status: 400
    });
  }

  // Generic 500 Internal Server Error
  res.status(500).json({
    error: 'Something went wrong',
    message: err.message || 'Internal Server Error',
    status: 500
  });
});

// ==========================================
// SERVER START
// ==========================================
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Practical 5: Express + MongoDB Task API running on port ${PORT}`);
  console.log(`🌐 Web Client Tester UI: http://localhost:${PORT}`);
  console.log(`📌 Tasks REST Endpoint: http://localhost:${PORT}/tasks`);
  console.log(`==================================================`);
});
