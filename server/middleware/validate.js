// Input Validation Middleware for Practical 7

// Validate User Registration inputs
const validateRegister = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'A valid email address is required for registration.',
      status: 400
    });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Please provide a valid email format (e.g., student@example.com).',
      status: 400
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Password must be at least 6 characters long.',
      status: 400
    });
  }

  next();
};

// Validate User Login inputs
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Both email and password are required to login.',
      status: 400
    });
  }

  next();
};

// Validate Task inputs before reaching controller
const validateTaskInput = (req, res, next) => {
  const { title, priority } = req.body;

  // Title is required on creation
  if (req.method === 'POST') {
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Task title is required and cannot be empty.',
        status: 400
      });
    }
  }

  // Priority enum validation
  if (priority && !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Priority must be either "low", "medium", or "high".',
      status: 400
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateTaskInput
};
