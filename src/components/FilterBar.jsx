export default function FilterBar({
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    onClearAll,
    hasTasks,
  }) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-3">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1 rounded ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            Completed
          </button>
        </div>
  
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 flex-1 max-w-xs"
        />
  
        {hasTasks && (
          <button
            onClick={onClearAll}
            className="text-red-600 hover:underline font-semibold"
          >
            Clear All
          </button>
        )}
      </div>
    );
  }
  