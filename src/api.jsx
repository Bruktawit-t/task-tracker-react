const API_BASE = import.meta.env.VITE_API_BASE || 'http://task-tracker-backend-production-ce42.up.railway.app'; // or your backend URL

export const fetchTasks = async () => {
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    return await res.json();
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
    throw error;
  }
};

export const addTask = async (task) => {
  try {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(true)
      },
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to add task');
    return await res.json();
  } catch (error) {
    console.error('Error adding task:', error.message);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete task');
  } catch (error) {
    console.error('Error deleting task:', error.message);
    throw error;
  }
};

export const updateTask = async (id, updatedTask) => {
  try {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(true)
      },
      body: JSON.stringify(updatedTask),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return await res.json();
  } catch (error) {
    console.error('Error updating task:', error.message);
    throw error;
  }
};

// Auth API calls remain unchanged
export const registerUser = async (userData) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error('Failed to register');
  return await res.json();
};

export const loginUser = async (credentials) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error('Failed to login');
  return await res.json();
};

// Modified: No Authorization headers sent anymore
function getAuthHeaders(includeContentType = false) {
  const headers = {};
  if (includeContentType) headers['Content-Type'] = 'application/json';
  return headers;
}
