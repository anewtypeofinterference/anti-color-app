"use client";

import { useEffect, useRef } from "react";

/** Cmd+S / Ctrl+S — keeps latest callback via ref */
export function useSaveShortcut(onSave, enabled = true) {
  const ref = useRef(onSave);
  ref.current = onSave;

  useEffect(() => {
    if (!enabled) return;
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        ref.current?.();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled]);
}
