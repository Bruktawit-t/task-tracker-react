const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'; // fallback if not defined

export const fetchTasks = async () => {
  try {
    const res = await fetch(`${API_BASE}/tasks`);
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTask),
    });
    if (!res.ok) throw new Error('Failed to update task');
    return await res.json();
  } catch (error) {
    console.error('Error updating task:', error.message);
    throw error;
  }
};
