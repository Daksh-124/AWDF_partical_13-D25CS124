const jwt = require('jsonwebtoken');

// Authentication Middleware for Practical 7
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token missing. Please provide Authorization: Bearer <token>',
        status: 401
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token is empty. Please provide a valid Bearer token.',
        status: 401
      });
    }

    const secret = process.env.JWT_SECRET || 'jwt_secret_practical7_daksh_d25cs124';
    const decoded = jwt.verify(token, secret);

    // Attach decoded user payload to request
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token Expired',
        message: 'Your authentication session has expired. Please log in again.',
        status: 401
      });
    }

    return res.status(401).json({
      error: 'Invalid Token',
      message: 'Invalid or malformed authentication token.',
      status: 401
    });
  }
};

module.exports = authMiddleware;
