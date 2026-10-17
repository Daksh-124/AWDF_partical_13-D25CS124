// Centralized API service for Practical 6 & Practical 7 JWT Authentication
const BASE_URL = 'http://localhost:5000';

// Token Management
export const getAuthToken = () => {
  return localStorage.getItem('jwt_token') || '';
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('jwt_token', token);
  } else {
    localStorage.removeItem('jwt_token');
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('jwt_user');
};

export const getSavedUser = () => {
  try {
    const raw = localStorage.getItem('jwt_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

export const saveUser = (user) => {
  if (user) {
    localStorage.setItem('jwt_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('jwt_user');
  }
};

// Headers with optional Auth token
const getHeaders = (includeJson = true) => {
  const headers = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Check MongoDB Database Connection Status
export const getDbStatus = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/db-status`);
    if (!res.ok) throw new Error('Failed to fetch DB status');
    return await res.json();
  } catch (err) {
    return { connected: false, error: err.message };
  }
};

// ==========================================
// AUTHENTICATION API METHODS (Practical 7)
// ==========================================

// Register a new user
export const registerUser = async (name, email, password) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Registration failed');
  }
  if (data.token) {
    setAuthToken(data.token);
    saveUser(data.user);
  }
  return data;
};

// Login user and store JWT token
export const loginUser = async (email, password) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Invalid credentials');
  }
  if (data.token) {
    setAuthToken(data.token);
    saveUser(data.user);
  }
  return data;
};

// Fetch currently logged-in user profile (/me)
export const getCurrentUser = async () => {
  const token = getAuthToken();
  if (!token) return null;

  const res = await fetch(`${BASE_URL}/me`, {
    headers: getHeaders(false)
  });

  if (res.status === 401) {
    clearAuthToken();
    return null;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch user');
  return data.user;
};

// ==========================================
// PROTECTED TASK API METHODS (Requires JWT)
// ==========================================

// Fetch all tasks
export const getTasks = async () => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    headers: getHeaders(false)
  });

  if (res.status === 401) {
    clearAuthToken();
    const errorData = await res.json().catch(() => ({}));
    const err = new Error(errorData.message || 'Unauthorized: Please login to view your tasks.');
    err.status = 401;
    throw err;
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP Error ${res.status}: Failed to fetch tasks`);
  }
  return res.json();
};

// Create a new task
export const createTask = async (taskData) => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(taskData)
  });

  if (res.status === 401) {
    clearAuthToken();
    throw new Error('Authentication expired. Please log in again.');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP Error ${res.status}: Failed to create task`);
  }
  return data;
};

// Update an existing task
export const updateTask = async (id, taskData) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(taskData)
  });

  if (res.status === 401) {
    clearAuthToken();
    throw new Error('Authentication expired. Please log in again.');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP Error ${res.status}: Failed to update task`);
  }
  return data;
};

// Delete a task
export const deleteTask = async (id) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getHeaders(false)
  });

  if (res.status === 401) {
    clearAuthToken();
    throw new Error('Authentication expired. Please log in again.');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP Error ${res.status}: Failed to delete task`);
  }
  return data;
};

// ==========================================
// CACHE MONITORING METHODS (Practical 9)
// ==========================================

export const getCacheStats = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/cache-stats`);
    if (!res.ok) throw new Error('Failed to fetch cache stats');
    return await res.json();
  } catch (err) {
    return {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRatio: '0.0%',
      invalidations: 0,
      activeKeysCount: 0,
      activeKeys: [],
      error: err.message
    };
  }
};

export const flushCache = async () => {
  const res = await fetch(`${BASE_URL}/api/cache-flush`, { method: 'POST' });
  return await res.json();
};
