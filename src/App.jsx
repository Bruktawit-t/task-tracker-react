import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaSun, FaMoon, FaSortAlphaDown, FaSortAlphaUp, FaTrash, FaCheck, FaTimes, FaEdit, FaPlus } from 'react-icons/fa';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('tasks')) || []);
  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [dueDateError, setDueDateError] = useState('');
  const [sortAsc, setSortAsc] = useState(null);

  const inputRef = useRef(null);
  const today = new Date().toISOString().split('T')[0];

  const capitalizeFirstLetter = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    if (!newDueDate) {
      setDueDateError('Due date is required.');
      return;
    }

    const task = {
      id: Date.now(),
      text: capitalizeFirstLetter(newTask.trim()),
      completed: false,
      dueDate: newDueDate
    };

    setTasks([task, ...tasks]);
    setNewTask('');
    setNewDueDate('');
    setDueDateError('');
    inputRef.current?.focus();
  };

  const toggleComplete = (id) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  };

  const startEdit = (task) => {
    setEditId(task.id);
    setEditText(task.text);
    setEditDueDate(task.dueDate);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditText('');
    setEditDueDate('');
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    setTasks(tasks.map(task => task.id === id ? { ...task, text: capitalizeFirstLetter(editText.trim()), dueDate: editDueDate } : task));
    cancelEdit();
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    if (editId === id) cancelEdit();
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
    .filter(task => task.text.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortAsc === null) return 0;
      return sortAsc
        ? a.text.localeCompare(b.text)
        : b.text.localeCompare(a.text);
    });

  const completionPercent = tasks.length
    ? (tasks.filter(t => t.completed).length / tasks.length) * 100
    : 0;

  const emptyMessage = () => {
    if (tasks.length === 0) return 'No tasks yet!';
    if (filteredTasks.length === 0) return 'No matching tasks!';
    return null;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-black dark:text-white transition">
      <header className="p-5 bg-gray-100 dark:bg-gray-800 shadow flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task Tracker</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="text-xl">
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            ref={inputRef}
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="New task..."
            className="flex-1 p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          />
          <input
            type="date"
            value={newDueDate}
            min={today}
            onChange={(e) => {
              setNewDueDate(e.target.value);
              setDueDateError('');
            }}
            className="p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-800"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <FaPlus />
          </button>
        </form>
        {dueDateError && <p className="text-red-500 text-sm mb-3">{dueDateError}</p>}

        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-4 p-2 border rounded bg-white dark:bg-gray-800"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex gap-2">
            {['All', 'Active', 'Completed'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded ${
                  filter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortAsc(true)}
              className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded"
              title="Sort A-Z"
            >
              <FaSortAlphaDown />
            </button>
            <button
              onClick={() => setSortAsc(false)}
              className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded"
              title="Sort Z-A"
            >
              <FaSortAlphaUp />
            </button>
            {tasks.length > 0 && (
              <>
                <button onClick={clearCompleted} title="Clear Completed" className="text-red-600">
                  <FaCheck />
                </button>
                <button onClick={clearAll} title="Clear All" className="text-red-700">
                  <FaTrash />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 mb-6">
          <div
            className="bg-blue-500 dark:bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>

        {emptyMessage() ? (
          <p className="text-center italic text-gray-500">{emptyMessage()}</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="tasks">
              {(provided) => (
                <ul className="space-y-3" ref={provided.innerRef} {...provided.droppableProps}>
                  {filteredTasks.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 border rounded shadow"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleComplete(task.id)}
                              className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            {editId === task.id ? (
                              <div className="flex flex-col w-full">
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="p-1 rounded border bg-white dark:bg-gray-700"
                                />
                                <input
                                  type="date"
                                  value={editDueDate}
                                  min={today}
                                  onChange={(e) => setEditDueDate(e.target.value)}
                                  className="p-1 mt-1 rounded border bg-white dark:bg-gray-700"
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col">
                                <span className={`break-words ${task.completed ? 'line-through text-gray-400' : ''}`}>
                                  {task.text}
                                </span>
                                {task.dueDate && (
                                  <span className="text-xs text-gray-500">Due: {task.dueDate}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            {editId === task.id ? (
                              <>
                                <button onClick={() => saveEdit(task.id)} title="Save">
                                  <FaCheck className="text-green-500" />
                                </button>
                                <button onClick={cancelEdit} title="Cancel">
                                  <FaTimes className="text-gray-500" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(task)} title="Edit">
                                  <FaEdit className="text-yellow-500" />
                                </button>
                                <button onClick={() => deleteTask(task.id)} title="Delete">
                                  <FaTrash className="text-red-500" />
                                </button>
                              </>
                            )}
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
      </main>

      <footer className="text-center p-4 text-sm text-gray-500 dark:text-gray-400">
        © 2025 Task Tracker
      </footer>
    </div>
  );
}

export default App;
