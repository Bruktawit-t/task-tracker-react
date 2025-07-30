const API_BASE = process.env.REACT_APP_API_BASE;

export const fetchTasks = async () => {
  const response = await fetch(`${API_BASE}/tasks`);
  if (!response.ok) throw new Error('Failed to fetch tasks');
  return await response.json();
};

export const addTask = async (task) => {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  if (!response.ok) throw new Error('Failed to add task');
  return await response.json();
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete task');
};

export const updateTask = async (id, updatedTask) => {
  const response = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedTask),
  });
  if (!response.ok) throw new Error('Failed to update task');
  return await response.json();
};
