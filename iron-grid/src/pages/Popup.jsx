export default function Popup ({ onClose,mes,showButton }) {
  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-80 text-center relative">
        <h3 className="text-lg font-semibold mb-2">Attention!</h3>
        <p className="text-sm text-gray-700 mb-4">
          {mes}
        </p>
        {showButton &&
        <button
          onClick={onClose}
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Got it
        </button>
}
      </div>
    </div>
  );
};
