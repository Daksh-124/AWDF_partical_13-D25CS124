const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Task = require('./models/Task');
const User = require('./models/User');
const authMiddleware = require('./middleware/auth');
const taskEvents = require('./events');
const { getEventHistory, clearEventHistory } = require('./listeners');
const { validateRegister, validateLogin, validateTaskInput } = require('./middleware/validate');
const {
  cache,
  cacheStats,
  getCached,
  setCached,
  invalidateTaskCaches,
  getStatsSummary,
  resetStats
} = require('./cache');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_practical7_daksh_d25cs124';

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
  serverSelectionTimeoutMS: 5000
})
  .then(async () => {
    isDbConnected = true;
    console.log('✅ MongoDB connected successfully via Mongoose ODM');
    // Ensure default demo user exists for easy lab evaluation
    try {
      const demoUser = await User.findOne({ email: 'daksh@example.com' });
      if (!demoUser) {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
          name: 'Daksh Digashia',
          email: 'daksh@example.com',
          password: hashedPassword
        });
        console.log('👤 Demo user created: daksh@example.com / password123');
      }
    } catch (e) {
      console.warn('Demo user setup skipped:', e.message);
    }
  })
  .catch((err) => {
    console.warn('⚠️ MongoDB connection warning:', err.message);
    console.warn('⚡ Operating in Mongoose Fallback Mode for Lab Testing.');
  });

// Database and Auth status endpoint
app.get('/api/db-status', (req, res) => {
  res.json({
    connected: isDbConnected,
    connectionState: mongoose.connection.readyState,
    readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
    mongoUri: MONGO_URI,
    authMode: 'JWT Bearer Authentication Active (Practical 7)',
    cachingEngine: 'node-cache in-memory (Practical 9)'
  });
});

// GET /api/cache-stats - Monitoring endpoint for in-memory cache metrics (Practical 9)
// GET /api/event-logs - Fetch background event history audit trail (Practical 10)
app.get('/api/event-logs', (req, res) => {
  res.status(200).json({
    total: getEventHistory().length,
    events: getEventHistory(),
    architecture: 'Node.js built-in EventEmitter (non-blocking async background processing)'
  });
});

// POST /api/test-slow-event - Demonstrate non-blocking 2000ms slow background listener (Practical 10 Supplementary)
app.post('/api/test-slow-event', (req, res) => {
  const emittedAt = new Date().toISOString();
  const label = (req.body && req.body.label) ? req.body.label : 'Simulated Heavy Task ' + Date.now();
  
  console.log(`[API] Response sent (200) for /api/test-slow-event at ${emittedAt}`);
  res.status(200).json({
    message: 'API responded immediately (< 5ms)! Background listener is processing for 2000ms asynchronously.',
    responseSentAt: emittedAt,
    label
  });

  // Emitted asynchronously after response sent
  taskEvents.emit('slow-notification', {
    label,
    emittedAt,
    user: req.user ? (req.user.name || req.user.email) : 'Lab Evaluator'
  });
});

app.get('/api/cache-stats', (req, res) => {
  res.status(200).json(getStatsSummary());
});

// POST /api/cache-flush - Flush cache and reset counters (For lab testing)
app.post('/api/cache-flush', (req, res) => {
  resetStats();
  res.status(200).json({ message: 'In-memory cache flushed and stats reset successfully.' });
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

// In-memory fallback arrays for offline DB lab environments
let fallbackUsers = [];
let fallbackTasks = [
  { _id: '64f1a2b3c4d5e6f7a8b9c0d1', title: 'Implement JWT Authentication', description: 'Secure Express API with jsonwebtoken and bcryptjs', completed: true, priority: 'high', createdAt: new Date() },
  { _id: '64f1a2b3c4d5e6f7a8b9c0d2', title: 'Input Validation Pipeline', description: 'Reject malformed requests before database operations', completed: true, priority: 'medium', createdAt: new Date() }
];

// Seed fallback demo user
(async () => {
  const hash = await bcrypt.hash('password123', 10);
  fallbackUsers.push({
    _id: '64f1a2b3c4d5e6f7a8b9c000',
    name: 'Daksh Digashia',
    email: 'daksh@example.com',
    password: hash,
    createdAt: new Date()
  });
})();

// ==========================================
// 5. AUTHENTICATION ROUTES (Practical 7)
// ==========================================

// POST /register - Register a new user with bcrypt password hashing
app.post('/register', validateRegister, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({
          error: 'User Already Exists',
          message: `An account with email ${normalizedEmail} already exists. Please login.`,
          status: 409
        });
      }

      // Hash password using bcryptjs (salt rounds: 10)
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name: name || 'Student User',
        email: normalizedEmail,
        password: hashedPassword
      });

      // Sign JWT token
      const token = jwt.sign(
        { id: newUser._id, email: newUser.email, name: newUser.name },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.status(201).json({
        message: 'User registered successfully with hashed password',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt
        }
      });
    }

    // Fallback mode for offline DB
    const existing = fallbackUsers.find((u) => u.email === normalizedEmail);
    if (existing) {
      return res.status(409).json({
        error: 'User Already Exists',
        message: 'Account already exists. Please login.',
        status: 409
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: name || 'Student User',
      email: normalizedEmail,
      password: hashedPassword,
      createdAt: new Date()
    };
    fallbackUsers.push(newUser);

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /login - Verify password with bcrypt.compare and return JWT token
app.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: normalizedEmail });
    } else {
      user = fallbackUsers.find((u) => u.email === normalizedEmail);
    }

    if (!user) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password credentials.',
        status: 401
      });
    }

    // Compare plain password with bcrypt hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Authentication Failed',
        message: 'Invalid email or password credentials.',
        status: 401
      });
    }

    // Sign JWT token with 1 hour expiration
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /me - Return currently logged in user from decoded JWT (Supplementary Problem)
app.get('/me', authMiddleware, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ error: 'User Not Found', status: 404 });
      }
      return res.status(200).json({ user });
    }

    const user = fallbackUsers.find((u) => u._id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User Not Found', status: 404 });
    }
    const { password, ...safeUser } = user;
    res.status(200).json({ user: safeUser });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 6. PROTECTED TASK ROUTES (Requires JWT authMiddleware)
// ==========================================

// GET /tasks - Protected with In-Memory Caching (Practical 9)
app.get('/tasks', authMiddleware, async (req, res, next) => {
  const startTime = Date.now();
  try {
    const cacheKey = req.user ? `tasks_${req.user.id}` : 'all_tasks';
    const { data: cachedTasks, isHit } = getCached(cacheKey);

    if (isHit && cachedTasks) {
      const duration = Date.now() - startTime;
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Key', cacheKey);
      res.set('X-Response-Time-Ms', duration.toString());
      return res.status(200).json(cachedTasks);
    }

    res.set('X-Cache', 'MISS');
    res.set('X-Cache-Key', cacheKey);

    if (mongoose.connection.readyState === 1) {
      // Find tasks belonging to current user or shared tasks
      const tasks = await Task.find({
        $or: [{ user: req.user.id }, { user: null }]
      }).sort({ createdAt: -1 });

      setCached(cacheKey, tasks, 60);
      const duration = Date.now() - startTime;
      res.set('X-Response-Time-Ms', duration.toString());
      return res.status(200).json(tasks);
    }

    setCached(cacheKey, fallbackTasks, 60);
    const duration = Date.now() - startTime;
    res.set('X-Response-Time-Ms', duration.toString());
    res.status(200).json(fallbackTasks);
  } catch (err) {
    next(err);
  }
});

// GET /tasks/:id - Protected with Single-Task In-Memory Caching (Practical 9 Supplementary)
app.get('/tasks/:id', authMiddleware, async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { id } = req.params;
    const cacheKey = `task_${id}`;
    const { data: cachedTask, isHit } = getCached(cacheKey);

    if (isHit && cachedTask) {
      const duration = Date.now() - startTime;
      res.set('X-Cache', 'HIT');
      res.set('X-Cache-Key', cacheKey);
      res.set('X-Response-Time-Ms', duration.toString());
      return res.status(200).json(cachedTask);
    }

    res.set('X-Cache', 'MISS');
    res.set('X-Cache-Key', cacheKey);

    if (mongoose.connection.readyState === 1) {
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({
          error: 'Task Not Found',
          message: `No task found with ID ${id}`,
          status: 404
        });
      }
      setCached(cacheKey, task, 60);
      const duration = Date.now() - startTime;
      res.set('X-Response-Time-Ms', duration.toString());
      return res.status(200).json(task);
    }

    const task = fallbackTasks.find((t) => t._id === id || t.id === id);
    if (!task) {
      return res.status(404).json({
        error: 'Task Not Found',
        message: `No task found with ID ${id}`,
        status: 404
      });
    }
    setCached(cacheKey, task, 60);
    const duration = Date.now() - startTime;
    res.set('X-Response-Time-Ms', duration.toString());
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

// POST /tasks - Protected & Input Validated: Create task
app.post('/tasks', authMiddleware, validateTaskInput, async (req, res, next) => {
  try {
    const taskData = {
      ...req.body,
      user: req.user.id
    };

    if (mongoose.connection.readyState === 1) {
      const newTask = await Task.create(taskData);
      // Invalidate in-memory cache after write operation (Practical 9)
      invalidateTaskCaches(req.user.id);
      const responseTimestamp = new Date().toISOString();
      console.log(`[API] POST /tasks response sent (201) at ${responseTimestamp}`);
      res.status(201).json(newTask);

      // Asynchronous background notification via EventEmitter (Practical 10)
      taskEvents.emit('task-created', {
        task: newTask,
        emittedAt: responseTimestamp,
        user: req.user
      });
      return;
    }

    const newTask = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: req.body.title.trim(),
      description: req.body.description || '',
      completed: req.body.completed || false,
      priority: req.body.priority || 'medium',
      user: req.user.id,
      createdAt: new Date()
    };
    fallbackTasks.unshift(newTask);
    invalidateTaskCaches(req.user.id);
    const responseTimestamp = new Date().toISOString();
    console.log(`[API] POST /tasks fallback response sent (201) at ${responseTimestamp}`);
    res.status(201).json(newTask);

    taskEvents.emit('task-created', {
      task: newTask,
      emittedAt: responseTimestamp,
      user: req.user
    });
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id - Protected & Input Validated: Update task
app.put('/tasks/:id', authMiddleware, validateTaskInput, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });

      if (!updatedTask) {
        return res.status(404).json({
          error: 'Task Not Found',
          message: `Cannot update. No task found with ID ${id}`,
          status: 404
        });
      }
      // Invalidate in-memory cache for all tasks and updated single task (Practical 9)
      invalidateTaskCaches(req.user.id, id);
      const responseTimestamp = new Date().toISOString();
      console.log(`[API] PUT /tasks/${id} response sent (200) at ${responseTimestamp}`);
      res.status(200).json(updatedTask);

      // Asynchronous background notification via EventEmitter (Practical 10)
      taskEvents.emit('task-updated', {
        task: updatedTask,
        emittedAt: responseTimestamp,
        user: req.user
      });
      return;
    }

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

    invalidateTaskCaches(req.user.id, id);
    res.status(200).json(fallbackTasks[taskIndex]);
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id - Protected: Delete task
app.delete('/tasks/:id', authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const deletedTask = await Task.findByIdAndDelete(id);
      if (!deletedTask) {
        return res.status(404).json({
          error: 'Task Not Found',
          message: `Cannot delete. No task found with ID ${id}`,
          status: 404
        });
      }
      // Invalidate in-memory cache for all tasks and deleted task (Practical 9)
      invalidateTaskCaches(req.user.id, id);
      const responseTimestamp = new Date().toISOString();
      console.log(`[API] DELETE /tasks/${id} response sent (200) at ${responseTimestamp}`);
      res.status(200).json({
        message: 'Task deleted successfully from MongoDB',
        deletedTask
      });

      // Asynchronous background notification via EventEmitter (Practical 10)
      taskEvents.emit('task-deleted', {
        task: deletedTask,
        emittedAt: responseTimestamp,
        user: req.user
      });
      return;
    }

    const taskIndex = fallbackTasks.findIndex((t) => t._id === id || t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({
        error: 'Task Not Found',
        message: `Cannot delete. Task with ID ${id} does not exist`,
        status: 404
      });
    }

    const deletedTask = fallbackTasks.splice(taskIndex, 1)[0];
    invalidateTaskCaches(req.user.id, id);
    res.status(200).json({
      message: 'Task deleted successfully',
      deletedTask
    });
  } catch (err) {
    next(err);
  }
});

// Test endpoint for 500 error handler
app.get('/api/error-test', (req, res, next) => {
  next(new Error('Deliberate test error for global error handler pipeline.'));
});

// ==========================================
// 7. CUSTOM 404 HANDLER FOR UNDEFINED ROUTES
// ==========================================
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Route Not Found',
    message: `The requested path '${req.url}' does not exist on this server.`,
    status: 404
  });
});

// ==========================================
// 8. STRUCTURED GLOBAL ERROR HANDLER (Must be defined LAST)
// ==========================================
app.use((err, req, res, next) => {
  console.error('[ERROR HANDLER LOG]:', err.name, err.message);

  if (err.name === 'ValidationError') {
    const errorDetails = Object.values(err.errors || {}).map((e) => e.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Mongoose schema validation failed',
      details: errorDetails.length > 0 ? errorDetails : [err.message],
      status: 400
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID Format',
      message: `The provided ID value '${err.value}' is not a valid MongoDB ObjectId.`,
      status: 400
    });
  }

  res.status(500).json({
    error: 'Something went wrong',
    message: err.message || 'Internal Server Error',
    status: 500
  });
});

// ==========================================
// SERVER START
// ==========================================
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Practical 7: Express + JWT Auth + MongoDB Task API on port ${PORT}`);
    console.log(`🌐 Web Client Tester UI: http://localhost:${PORT}`);
    console.log(`🔑 Auth Endpoints: POST /register, POST /login, GET /me`);
    console.log(`🔒 Protected Task Routes: /tasks (Requires Bearer Token)`);
    console.log(`==================================================`);
  });
}

module.exports = app;
