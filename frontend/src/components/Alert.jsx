export function Alert({ type = 'info', message, onClose }) {
  const bgColor = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  }[type];

  return (
    <div className={`border rounded-lg p-4 flex justify-between items-center ${bgColor}`}>
      <p>{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-lg font-bold opacity-70 hover:opacity-100"
        >
          ×
        </button>
      )}
    </div>
  );
}
