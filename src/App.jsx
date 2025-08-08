import React, { useEffect, useState } from 'react';
import {
  fetchTasks,
  addTask,
  updateTask,
  deleteTask,
} from './api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaSun, FaMoon } from 'react-icons/fa';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import './components/AuthForm.css'; // Auth form styling

function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );
  const [activeTab, setActiveTab] = useState('view');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: '',
  });

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem('token')
  );
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks()
        .then(setTasks)
        .catch((err) => console.error('Fetch error:', err.message));
    }
  }, [isLoggedIn]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.priority) {
      alert('Title and Priority are required');
      return;
    }

    try {
      const added = await addTask({ ...newTask, completed: false });
      setTasks((prev) => [added, ...prev]);
      setNewTask({
        title: '',
        description: '',
        due_date: '',
        priority: '',
      });
      setActiveTab('view');
    } catch (err) {
      console.error('Add error:', err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Delete error:', err.message);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      const updated = await updateTask(id, { completed: !completed });
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error('Update error:', err.message);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const updated = Array.from(tasks);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    setTasks(updated);
  };

  if (!isLoggedIn) {
    return (
      <div className="auth-wrapper">
        {showRegister ? (
          <>
            <RegisterForm onRegister={() => setIsLoggedIn(true)} />
            <p className="switch-link">
              Already have an account?{' '}
              <button onClick={() => setShowRegister(false)}>Login</button>
            </p>
          </>
        ) : (
          <>
            <LoginForm onLogin={() => setIsLoggedIn(true)} />
            <p className="switch-link">
              Don't have an account?{' '}
              <button onClick={() => setShowRegister(true)}>Register</button>
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 transition-colors duration-300 bg-white dark:bg-gray-900 dark:text-white">
      <div className="flex justify-between items-center mb-6">
        <div className="space-x-2">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded ${activeTab === 'add'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700'
              }`}
          >
            Add Task
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 rounded ${activeTab === 'view'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700'
              }`}
          >
            View Tasks
          </button>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-300 dark:bg-gray-700"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              setIsLoggedIn(false);
            }}
            className="p-2 px-4 rounded bg-red-500 text-white"
          >
            Logout
          </button>
        </div>
      </div>

      {activeTab === 'add' && (
        <form
          onSubmit={handleAddTask}
          className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-6 space-y-4"
        >
          <input
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            placeholder="Title"
            required
            className="w-full p-2 rounded"
          />
          <input
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full p-2 rounded"
          />
          <input
            name="due_date"
            type="date"
            value={newTask.due_date}
            onChange={handleInputChange}
            className="w-full p-2 rounded"
          />
          <select
            name="priority"
            value={newTask.priority}
            onChange={handleInputChange}
            required
            className="w-full p-2 rounded"
          >
            <option value="">Select Priority</option>
            <option value="high">High 🔴</option>
            <option value="medium">Medium 🟡</option>
            <option value="low">Low 🟢</option>
          </select>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded"
          >
            Add Task
          </button>
        </form>
      )}

      {activeTab === 'view' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="taskList">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {tasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                    {(provided) => (
                      <li
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        className={`p-4 rounded shadow-md ${task.priority === 'high'
                          ? 'bg-red-200 dark:bg-red-500'
                          : task.priority === 'medium'
                            ? 'bg-yellow-200 dark:bg-yellow-500'
                            : 'bg-green-200 dark:bg-green-500'
                          }`}
                      >
                        <h3 className="font-bold text-lg">{task.title}</h3>
                        <p>{task.description}</p>
                        <p>Due: {task.due_date?.slice(0, 10)}</p>
                        <p>Status: {task.completed ? '✅ Done' : '❌ Pending'}</p>
                        <p>Priority: {task.priority}</p>
                        <div className="flex space-x-2 mt-2">
                          <button
                            onClick={() => handleToggleComplete(task.id, task.completed)}
                            className="px-3 py-1 bg-blue-600 text-white rounded"
                          >
                            {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}

export default App;
