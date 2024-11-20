import React from "react";

function Modal({ title, children, onClose }) {
  // Manejador para cerrar el modal al hacer clic fuera del contenido
  const handleOutsideClick = (e) => {
    // Verifica si el clic fue fuera del modal
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50" // Clase z-50 para asegurar prioridad
      onClick={handleOutsideClick} // Permite cerrar al tocar fuera
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl h-96 overflow-y-auto mx-4 sm:mx-auto relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            X
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
