"use client";
import React from "react";

export default function Select({ value, onChange, options = [], className = "", ...rest }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`flex rounded-md bg-transparent px-3 py-2 text-sm outline-none transition-colors cursor-pointer ${className}`}
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
