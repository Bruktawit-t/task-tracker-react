const API_BASE = 'https://task-tracker-backend-aczo.onrender.com/api';

// Register new user
export const register = async (userData) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
};

// Login user and receive token
export const login = async (credentials) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error('Login failed');
  return res.json(); // { token: '...' }
};

// Fetch all tasks for authenticated user
export const fetchTasks = async (token) => {
  const res = await fetch(`${API_BASE}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
};

// Add a new task
export const addTask = async (task, token) => {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(task),
  });
  if (!res.ok) throw new Error('Failed to add task');
  return res.json();
};

// Update an existing task (PUT)
export const updateTask = async (id, updatedFields, token) => {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT', // Must match backend route method
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedFields),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
};

// Delete a task by id
export const deleteTask = async (id, token) => {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to delete task');
  return res.json();
};
