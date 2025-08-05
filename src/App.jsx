import React, { useState, useEffect, useRef } from 'react';
import Login from './components/Login';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  FaSun, FaMoon, FaTrash,
  FaCheck, FaTimes, FaEdit, FaPlus
} from 'react-icons/fa';
import './App.css';

import { fetchTasks, addTask, updateTask, deleteTask as deleteTaskAPI } from './api'; // import API functions

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [tasks, setTasks] = useState([]);

  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [dueDateError, setDueDateError] = useState('');
  const [view, setView] = useState('list');

  const inputRef = useRef(null);
  const today = new Date().toISOString().split('T')[0];

  const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    fetchTasks().then(setTasks).catch(console.error);
  }, []);

  const handleAddTask = (e) => {
    e.preventDefault();
    const currentYear = new Date().getFullYear();

    if (!newTask.trim()) {
      setDueDateError('Task name is required.');
      return;
    }
    if (!newDueDate) {
      setDueDateError('Due date is required.');
      return;
    }
    if (!newPriority) {
      setDueDateError('Priority is required.');
      return;
    }
    const dueYear = new Date(newDueDate).getFullYear();
    if (dueYear !== currentYear) {
      setDueDateError(`Due date must be within ${currentYear}.`);
      return;
    }

    const task = {
      title: capitalizeFirstLetter(newTask.trim()),
      description: newDescription.trim(),
      due_date: newDueDate,
      completed: false,
      priority: newPriority
    };

    addTask(task).then((createdTask) => {
      setTasks([createdTask, ...tasks]);
      setNewTask('');
      setNewDueDate('');
      setNewDescription('');
      setNewPriority('');
      setDueDateError('');
    }).catch(console.error);
  };

  const toggleComplete = (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const updated = { ...task, completed: !task.completed };
    updateTask(id, updated).then(() => {
      setTasks(tasks.map(t => (t.id === id ? updated : t)));
    }).catch(console.error);
  };

  const startEdit = (task) => {
    setEditId(task.id);
    setEditText(task.title);
    setEditDueDate(task.due_date);
    setEditDescription(task.description || '');
    setEditPriority(task.priority || '');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditText('');
    setEditDueDate('');
    setEditDescription('');
    setEditPriority('');
  };

  const saveEdit = (id) => {
    if (!editText.trim()) {
      setDueDateError('Task name is required.');
      return;
    }
    if (!editPriority) {
      setDueDateError('Priority is required.');
      return;
    }

    const updated = {
      title: capitalizeFirstLetter(editText.trim()),
      due_date: editDueDate,
      description: editDescription.trim(),
      priority: editPriority
    };

    updateTask(id, updated).then(() => {
      setTasks(tasks.map(task => task.id === id ? { ...task, ...updated } : task));
      cancelEdit();
    }).catch(console.error);
  };

  const deleteTask = (id) => {
    deleteTaskAPI(id).then(() => {
      setTasks(tasks.filter(task => task.id !== id));
      if (editId === id) cancelEdit();
    }).catch(console.error);
  };

  const clearCompleted = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  const clearAll = () => {
    if (window.confirm('Clear all tasks?')) {
      setTasks([]);
      cancelEdit();
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newList = Array.from(tasks);
    const [moved] = newList.splice(result.source.index, 1);
    newList.splice(result.destination.index, 0, moved);
    setTasks(newList);
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'Active') return !task.completed;
      if (filter === 'Completed') return task.completed;
      return true;
    })
    .filter(task => task.title?.toLowerCase().includes(searchTerm.toLowerCase()));

  const completionPercent = tasks.length
    ? (tasks.filter(t => t.completed).length / tasks.length) * 100
    : 0;

  const emptyMessage = () => {
    if (tasks.length === 0) return 'No tasks yet!';
    if (filteredTasks.length === 0) return 'No matching tasks!';
    return null;
  };

  return (
    <div className={`min-h-screen px-4 py-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Task Tracker</h1>
          <div className="flex gap-2">
            <button onClick={() => setView('add')} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
              Add Task
            </button>
            <button onClick={() => setView('list')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">
              View Tasks
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className="ml-2 text-xl">
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </header>

        {/* Add Task Form */}
        {view === 'add' && (
          <form onSubmit={handleAddTask} className="flex flex-col gap-3 mb-6">
            <input type="text" placeholder="Task name" value={newTask} onChange={e => setNewTask(e.target.value)}
              className="p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600" ref={inputRef} />
            <input type="date" min={today} value={newDueDate} onChange={e => setNewDueDate(e.target.value)}
              className="p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            <textarea placeholder="Optional description" value={newDescription} onChange={e => setNewDescription(e.target.value)}
              className="p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600" />
            <select value={newPriority} onChange={e => setNewPriority(e.target.value)}
              className="p-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600">
              <option value="">Select priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {dueDateError && <p className="text-red-500">{dueDateError}</p>}
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 justify-center">
              <FaPlus /> Add Task
            </button>
          </form>
        )}

        {/* Task List */}
        {view === 'list' && (
          <>
            <input type="text" placeholder="Search tasks..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="p-2 border rounded mb-4 w-full bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600" />

            <div className="flex gap-2 mb-4">
              {['All', 'Active', 'Completed'].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}>
                  {f}
                </button>
              ))}
            </div>

            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Completion: {completionPercent.toFixed(0)}%
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="tasks">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                    {filteredTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                            className={`p-4 rounded border shadow-sm ${task.completed ? 'bg-green-100 dark:bg-green-900' : 'bg-white dark:bg-gray-800'}`}>

                            {editId === task.id ? (
                              <>
                                <input value={editText} onChange={e => setEditText(e.target.value)}
                                  className="w-full p-1 mb-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                                <input type="date" value={editDueDate} onChange={e => setEditDueDate(e.target.value)}
                                  className="w-full p-1 mb-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)}
                                  className="w-full p-1 mb-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600" />
                                <select value={editPriority} onChange={e => setEditPriority(e.target.value)}
                                  className="w-full p-1 mb-2 border rounded bg-white text-black dark:bg-gray-700 dark:text-white dark:border-gray-600">
                                  <option value="">Select priority</option>
                                  <option value="low">Low</option>
                                  <option value="medium">Medium</option>
                                  <option value="high">High</option>
                                </select>
                                {dueDateError && <p className="text-red-500 text-sm mb-2">{dueDateError}</p>}
                                <div className="flex gap-2">
                                  <button onClick={() => saveEdit(task.id)} className="text-green-600"><FaCheck /></button>
                                  <button onClick={cancelEdit} className="text-red-600"><FaTimes /></button>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center justify-between">
                                  <h2 className={`text-lg font-semibold ${task.completed ? 'line-through' : ''}`}>
                                    {task.title}
                                  </h2>
                                  <div className="flex gap-2">
                                    <button onClick={() => toggleComplete(task.id)} className="text-green-600"><FaCheck /></button>
                                    <button onClick={() => startEdit(task)} className="text-blue-600"><FaEdit /></button>
                                    <button onClick={() => deleteTask(task.id)} className="text-red-600"><FaTrash /></button>
                                  </div>
                                </div>
                                {task.description && <p className="text-sm mt-1">{task.description}</p>}
                                <p className="text-sm mt-1">Due: {task.due_date?.split('T')[0]}</p>
                                {task.priority && (
                                  <span className={`inline-block mt-1 px-2 py-1 text-xs rounded 
                                    ${task.priority === 'high' ? 'bg-red-500 text-white' :
                                      task.priority === 'medium' ? 'bg-yellow-500 text-white' :
                                        'bg-green-500 text-white'}`}>
                                    {task.priority}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {emptyMessage() && <p className="mt-4 text-center text-gray-500">{emptyMessage()}</p>}

            {tasks.length > 0 && (
              <div className="flex justify-between mt-6">
                <button onClick={clearCompleted} className="text-sm text-yellow-600 hover:underline">
                  Clear Completed
                </button>
                <button onClick={clearAll} className="text-sm text-red-600 hover:underline">
                  Clear All
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
  const token = localStorage.getItem('token');

fetch('https://task-backend-pxt7.onrender.com/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('Tasks:', data);
    // set state or display tasks here
  });

}

export default App;
