export default function Button({ children, onClick, type = "button", variant = "primary" }) {
    const base = "px-4 py-2 rounded text-white font-semibold transition";
    const variants = {
      primary: "bg-blue-600 hover:bg-blue-700",
      danger: "bg-red-600 hover:bg-red-700",
      success: "bg-green-600 hover:bg-green-700",
    };
  
    return (
      <button
        type={type}
        onClick={onClick}
        className={`${base} ${variants[variant]}`}
      >
        {children}
      </button>
    );
  }
  