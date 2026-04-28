"use client";
import React, { createContext, useState, useContext, useEffect } from "react";

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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-black text-white px-4 py-3 rounded-md font-medium max-w-xs">
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-white cursor-pointer"
        aria-label="Lukk"
      >
        ✕
      </button>
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
