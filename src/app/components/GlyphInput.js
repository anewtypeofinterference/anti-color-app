// src/app/components/GlyphInput.jsx
"use client";
import React from "react";
import Input from "./Input";

export default function GlyphInput({ glyph, value, onChange, className = "", ...props }) {
  return (
    <div className={`relative bg-black/3 rounded-xl px-5 py-3 w-full flex items-center ${className}`}>
      <span className="text-black/30 mr-2 flex-shrink-0">{glyph}</span>
      <Input
        {...props}
        value={value}
        onChange={onChange}
        className="!bg-transparent !p-0 !focus:ring-0 !rounded-none flex-1"
      />
    </div>
  );
}