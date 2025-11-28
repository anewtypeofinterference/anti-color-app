"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';

// Create an inline Toast component
const Toast = ({ message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;
  return (
    <div className="fixed bottom-6 right-6 bg-black text-white px-6 py-4 rounded">
      {message}
    </div>
  );
};

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext); 