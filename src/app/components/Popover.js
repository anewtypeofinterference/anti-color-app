// src/app/components/Popover.jsx
"use client";
import { useEffect, useRef } from "react";

export default function Popover({ open, onClose, anchorId, className, children }) {
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      ref={ref}
      data-menu={anchorId}
      className="absolute top-6 left-[95%] w-48 bg-black rounded-xl z-20 p-2 text-sm"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}