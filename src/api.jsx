const API_BASE = 'https://task-tracker-backend-aczo.onrender.com/api';

// ------------------- Helper: get Auth Header -------------------
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found. Please log in.');
  return { Authorization: `Bearer ${token}` };
};

// ------------------- Fetch Tasks -------------------
export const fetchTasks = async () => {
  const res = await fetch(`${API_BASE}/tasks`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) throw new Error('Failed to fetch tasks');
  return res.json();
};

// ------------------- Add Task -------------------
export const addTask = async (task) => {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || 'Failed to add task');
  }

  return res.json();
};

// ------------------- Update Task -------------------
export const updateTask = async (id, updatedTask) => {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    body: JSON.stringify(updatedTask),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || 'Failed to update task');
  }

  return res.json();
};

// ------------------- Delete Task -------------------
export const deleteTask = async (id) => {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || 'Failed to delete task');
  }

  return res.json();
};

// ------------------- Login -------------------
export const login = async (credentials) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || 'Login failed');
  }

  return res.json(); // { token: '...' }
};

// ------------------- Register -------------------
export const register = async (userData) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || 'Registration failed');
  }

  return res.json(); // { token: '...' }
};
