import { useState } from 'react';

export default function TaskCard({ task, onDelete, onToggleComplete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editInput, setEditInput] = useState(task.text);

  const handleSave = () => {
    const trimmed = editInput.trim();
    if (!trimmed) return;
    onEdit(task.id, trimmed);
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-4 flex items-center justify-between space-x-3">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggleComplete(task.id)}
        className="w-5 h-5 cursor-pointer"
      />

      {isEditing ? (
        <input
          type="text"
          value={editInput}
          onChange={(e) => setEditInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') setIsEditing(false);
          }}
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          autoFocus
        />
      ) : (
        <span
          onDoubleClick={() => setIsEditing(true)}
          className={`flex-1 cursor-pointer select-none ${
            task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''
          }`}
          title="Double click to edit"
        >
          {task.text}
        </span>
      )}

      {isEditing ? (
        <button
          onClick={handleSave}
          className="text-green-600 hover:text-green-800 font-semibold"
          aria-label="Save task edit"
        >
          Save
        </button>
      ) : (
        <button
          onClick={() => onDelete(task.id)}
          className="text-red-600 hover:text-red-800 font-semibold"
          aria-label="Delete task"
        >
          Delete
        </button>
      )}
    </div>
  );
}
