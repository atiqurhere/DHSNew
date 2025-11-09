import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 overflow-y-auto"
      style={{ zIndex: 999999 }}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300" 
        onClick={onClose}
        aria-hidden="true"
        style={{ zIndex: 999999 }}
      ></div>
      
      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 1000000 }}>
        {/* Modal Content */}
        <div 
          className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto my-8 animate-scaleIn"
          style={{ maxHeight: 'calc(100vh - 4rem)', zIndex: 1000001 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-4 md:px-6 py-3 md:py-4 flex justify-between items-center rounded-t-lg z-10">
            <h2 id="modal-title" className="text-xl md:text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-3xl transition-colors duration-200 hover:scale-110 transform"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          
          {/* Body */}
          <div className="p-4 md:p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 12rem)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal at document root using Portal
  return createPortal(modalContent, document.body);
};

export default Modal;
