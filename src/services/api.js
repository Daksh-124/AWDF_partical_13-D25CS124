// Centralized API service for Practical 6 Full-Stack Integration
const BASE_URL = 'http://localhost:5000';

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

// Fetch all tasks from Express + MongoDB backend
export const getTasks = async () => {
  const res = await fetch(`${BASE_URL}/tasks`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP Error ${res.status}: Failed to fetch tasks from backend`);
  }
  return res.json();
};

// Create a new task in MongoDB
export const createTask = async (taskData) => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP Error ${res.status}: Failed to create task`);
  }
  return data;
};

// Update an existing task in MongoDB
export const updateTask = async (id, taskData) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP Error ${res.status}: Failed to update task`);
  }
  return data;
};

// Delete a task from MongoDB
export const deleteTask = async (id) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE'
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `HTTP Error ${res.status}: Failed to delete task`);
  }
  return data;
};
