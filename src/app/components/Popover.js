"use client";
import { useEffect, useRef } from "react";

export default function Popover({ open, onClose, anchorId, className, children }) {
  const ref = useRef(null);

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
      className={`absolute top-8 left-[95%] w-48 bg-white border border-zinc-200 rounded-lg z-20 p-1 ${className ?? ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}
