"use client";
import React from "react";

export default function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={[
        "flex w-full rounded-md bg-transparent px-3 py-2 outline-none hover:bg-white/15 cursor-pointer",
        "placeholder:text-zinc-400",
        "transition-[color,box-shadow,background-color]",
        "focus:cursor-text",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
