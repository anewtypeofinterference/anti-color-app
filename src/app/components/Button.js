"use client";
import React from "react";

export default function Button({
  children,
  startIcon: StartIcon,
  startIconSize = 14,
  variant = "primary",
  className = "",
  ...props
}) {
  const variantStyles = {
    primary:
      "bg-zinc-900 text-white py-2 px-3 rounded-sm",
    secondary:
      "bg-white text-black py-2 px-3 rounded-sm",
    outline:
      "bg-transparent text-black py-2 px-3 rounded-sm",
    ghost:
      "text-black py-2 px-3 rounded-sm",
    rounded:
      "bg-transparent text-black rounded-full p-3 border border-transparent",
  };

  const base =
    "inline-flex items-center justify-center gap-2 font-medium cursor-pointer select-none " +
    "disabled:cursor-not-allowed disabled:opacity-45 disabled:saturate-50";

  const classes = [base, variantStyles[variant] || variantStyles.primary, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...props} className={classes}>
      {StartIcon && <StartIcon size={startIconSize} weight="bold" className="translate-y-0.25" />}
      {children}
    </button>
  );
}
