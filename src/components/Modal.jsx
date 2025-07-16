export default function Modal({ open, onClose, children }) {
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
        <div className="bg-white p-6 rounded shadow max-w-md w-full">
          {children}
          <button onClick={onClose} className="mt-4 text-blue-600 hover:underline">Close</button>
        </div>
      </div>
    );
  }
  