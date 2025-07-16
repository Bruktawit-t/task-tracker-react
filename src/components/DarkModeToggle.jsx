export default function DarkModeToggle({ darkMode, setDarkMode }) {
    return (
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-1 bg-gray-300 dark:bg-gray-700 rounded transition"
          aria-label="Toggle dark mode"
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    );
  }
  