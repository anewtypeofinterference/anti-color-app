"use client";
import React from "react";

export default function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={[
        "w-full bg-black/3 rounded-xl px-5 py-3 placeholder:text-black/30 outline-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}