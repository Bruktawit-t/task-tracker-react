import React, { useEffect, useState } from 'react';
import {
  fetchTasks,
  addTask,
  updateTask,
  deleteTask,
} from './api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaSun, FaMoon, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import './components/AuthForm.css';

function App() {
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  const [activeTab, setActiveTab] = useState('view');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: '',
  });

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editFields, setEditFields] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: '',
    completed: false,
  });

  const [filter, setFilter] = useState('all');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const loadTasks = async () => {
      if (isLoggedIn && token) {
        try {
          const fetchedTasks = await fetchTasks(token);
          const normalized = (fetchedTasks || []).map((t) => ({
            ...t,
            completed: t.completed === 1 || t.completed === true ? true : false,
          }));
          setTasks(normalized);
        } catch (err) {
          console.error('Fetch error:', err.message);
        }
      }
    };
    loadTasks();
  }, [isLoggedIn, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFields((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditFields({
      title: task.title || '',
      description: task.description || '',
      due_date: task.due_date ? (task.due_date.slice ? task.due_date.slice(0, 10) : task.due_date) : '',
      priority: task.priority || '',
      completed: task.completed === 1 || task.completed === true ? true : false,
    });
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditFields({
      title: '',
      description: '',
      due_date: '',
      priority: '',
      completed: false,
    });
  };

  const saveEdits = async (taskId) => {
    if (!editFields.title || !editFields.priority) {
      alert('Title and Priority are required');
      return;
    }

    try {
      const payload = {
        title: editFields.title,
        description: editFields.description || null,
        due_date: editFields.due_date || null,
        priority: editFields.priority,
        completed: editFields.completed ? 1 : 0,
      };

      await updateTask(taskId, payload, token);

      const refreshed = await fetchTasks(token);
      const normalized = (refreshed || []).map((t) => ({
        ...t,
        completed: t.completed === 1 || t.completed === true ? true : false,
      }));
      setTasks(normalized);
      cancelEditing();
    } catch (err) {
      console.error('Save edit error:', err);
      alert('Failed to save changes. Check console for details.');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!token) return alert('You must be logged in');
    if (!newTask.title || !newTask.priority) {
      return alert('Title and Priority are required');
    }

    try {
      const addedTask = await addTask(
        { ...newTask, completed: 0 },
        token
      );

      const taskToInsert = (
        addedTask && addedTask.id
      ) ? { ...addedTask, completed: addedTask.completed === 1 || addedTask.completed === true ? true : false } :
        { id: addedTask.id || Date.now(), ...newTask, completed: false };

      setTasks((prev) => [taskToInsert, ...prev]);
      setNewTask({
        title: '',
        description: '',
        due_date: '',
        priority: '',
      });
      setActiveTab('view');
    } catch (err) {
      console.error('Add error:', err.message || err);
      alert('Failed to add task');
    }
  };

  const handleDeleteTask = async (id) => {
    if (!token) return alert('You must be logged in');
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(id, token);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Delete error:', err.message || err);
      alert('Failed to delete task');
    }
  };

  const handleToggleComplete = async (taskId, currentCompleted) => {
    if (!token) return alert('You must be logged in');

    try {
      const taskToUpdate = tasks.find(t => t.id === taskId);
      if (!taskToUpdate) return;

      const payload = {
        title: taskToUpdate.title,
        description: taskToUpdate.description || null,
        due_date: taskToUpdate.due_date || null,
        priority: taskToUpdate.priority,
        completed: currentCompleted ? 0 : 1,
      };

      await updateTask(taskId, payload, token);

      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, completed: !currentCompleted } : t
        )
      );

      const refreshed = await fetchTasks(token);
      const normalized = (refreshed || []).map((t) => ({
        ...t,
        completed: t.completed === 1 || t.completed === true ? true : false,
      }));
      setTasks(normalized);
    } catch (err) {
      console.error('Toggle complete error:', err);
      alert('Failed to update task status');
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTasks(items);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

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
    <div className="min-h-screen p-6 transition-colors duration-300 bg-white dark:bg-gray-900 dark:text-white max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="space-x-2">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-4 py-2 rounded ${
              activeTab === 'add'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Add Task
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`px-4 py-2 rounded ${
              activeTab === 'view'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            View Tasks
          </button>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-300 dark:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              setIsLoggedIn(false);
              setTasks([]);
              cancelEditing();
            }}
            className="p-2 px-4 rounded bg-red-600 hover:bg-red-700 text-white"
          >
            Logout
          </button>
        </div>
      </div>

      {activeTab === 'add' && (
        <form onSubmit={handleAddTask} className="bg-gray-100 dark:bg-gray-800 p-4 rounded mb-6 space-y-4">
          <input
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            placeholder="Title"
            required
            className="w-full p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            name="due_date"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={newTask.due_date}
            onChange={handleInputChange}
            className="w-full p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <select
            name="priority"
            value={newTask.priority}
            onChange={handleInputChange}
            required
            className="w-full p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select Priority</option>
            <option value="high">High 🔴</option>
            <option value="medium">Medium 🟡</option>
            <option value="low">Low 🟢</option>
          </select>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">
            Add Task
          </button>
        </form>
      )}

      {activeTab === 'view' && (
        <>
          {/* Filter Buttons */}
          <div className="mb-4 space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded ${
                filter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded ${
                filter === 'completed'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              Completed
            </button>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="taskList">
              {(provided) => (
                <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {filteredTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                      {(provided) => (
                        <li
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          className={`p-4 rounded shadow-md flex flex-col md:flex-row md:items-center md:justify-between transition-colors ${
                            task.priority === 'high'
                              ? 'bg-red-300 dark:bg-red-700'
                              : task.priority === 'medium'
                              ? 'bg-yellow-300 dark:bg-yellow-700'
                              : 'bg-green-300 dark:bg-green-700'
                          } ${task.completed ? 'opacity-70' : ''}`}
                        >
                          {editingTaskId === task.id ? (
                            <div className="flex flex-col w-full space-y-2">
                              <input
                                type="text"
                                name="title"
                                value={editFields.title}
                                onChange={handleEditInputChange}
                                className="w-full p-1 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Title"
                                required
                              />
                              <textarea
                                name="description"
                                value={editFields.description}
                                onChange={handleEditInputChange}
                                className="w-full p-1 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Description"
                              />
                              <input
                                type="date"
                                name="due_date"
                                value={editFields.due_date}
                                onChange={handleEditInputChange}
                                className="w-full p-1 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                              <select
                                name="priority"
                                value={editFields.priority}
                                onChange={handleEditInputChange}
                                required
                                className="w-full p-1 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              >
                                <option value="">Select Priority</option>
                                <option value="high">High 🔴</option>
                                <option value="medium">Medium 🟡</option>
                                <option value="low">Low 🟢</option>
                              </select>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`completed-${task.id}`}
                                  name="completed"
                                  checked={editFields.completed}
                                  onChange={handleEditInputChange}
                                  className="rounded"
                                />
                                <label htmlFor={`completed-${task.id}`}>Mark as Completed</label>
                              </div>
                              <div className="flex space-x-2 mt-2">
                                <button
                                  type="button"
                                  onClick={() => saveEdits(task.id)}
                                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2"
                                >
                                  <FaCheck /> Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded flex items-center gap-2"
                                >
                                  <FaTimes /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div
                                className="flex-1 cursor-pointer"
                                onClick={() => startEditing(task)}
                              >
                                <h3 className={`font-bold text-lg ${task.completed ? 'line-through' : ''}`}>
                                  {task.title}
                                </h3>
                                {task.description && <p>{task.description}</p>}
                                {task.due_date && <p>Due: {String(task.due_date).slice(0, 10)}</p>}
                                <p>Status: {task.completed ? 'Completed' : 'Pending'}</p>
                                <p>Priority: {task.priority}</p>
                              </div>

                              <div className="flex space-x-2 mt-2 md:mt-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleComplete(task.id, task.completed);
                                  }}
                                  className={`px-3 py-1 rounded flex items-center gap-1 ${
                                    task.completed
                                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                      : 'bg-blue-700 hover:bg-blue-600 text-white'
                                  }`}
                                  title={task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                                >
                                  <FaCheck />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask(task.id);
                                  }}
                                  className="px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded flex items-center gap-1"
                                  title="Delete task"
                                >
                                  <FaTrash />
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(task);
                                  }}
                                  className="px-3 py-1 bg-yellow-700 hover:bg-yellow-600 text-white rounded flex items-center gap-1"
                                  title="Edit task"
                                >
                                  <FaEdit />
                                </button>
                              </div>
                            </>
                          )}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}
    </div>
  );
}

export default App;
