// src/app/components/Select.jsx
"use client";
import React from "react";

export default function Select({
  value,
  onChange,
  options = [],
  className = "",
  ...rest
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full bg-black/3 rounded-xl px-4 py-3 placeholder:text-black/30 outline-0 ${className}`}
      {...rest}
    >
      {options.map((opt) =>
        typeof opt === "string" ? (
          <option key={opt} value={opt}>
            {opt.toUpperCase()}
          </option>
        ) : (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        )
      )}
    </select>
  );
}