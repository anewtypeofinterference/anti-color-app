// src/app/components/Toast.jsx
"use client";
import { useEffect } from "react";

export default function Toast({ message, onClose, duration = 3000 }) {
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
}