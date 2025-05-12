import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-500 hover:rotate-75 hover:text-red-800 hover:scale-110 transition-transform duration-200"
        >
          <X size={24} />
        </button>
        {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal;