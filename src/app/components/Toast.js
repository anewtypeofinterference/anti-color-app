"use client";
import { useEffect } from "react";

export default function Toast({ message, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      // ingenting – tom, fordi forelder fjerner `message`
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  if (!message) return null;
  return (
    <div className="fixed bottom-12 right-12 w-120 bg-black/5 text-black px-6 py-4 rounded-lg">
      {message}
    </div>
  );
}