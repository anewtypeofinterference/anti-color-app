"use client";
import React from "react";

export default function Button({
  children,
  startIcon: StartIcon,
  endIcon: EndIcon,
  variant = "primary",
  className = "",
  ...props
}) {
  const variantStyles = {
    primary:   "bg-black text-white hover:bg-black/75 rounded-xl px-5 py-3",
    secondary: "bg-black/10 text-black hover:bg-black/5 rounded-xl px-5 py-3",
    rounded:   "bg-black/10 text-black hover:bg-black/5 rounded-full p-4",
  };
  const base = "inline-flex items-center gap-3 cursor-pointer w-fit";
  const classes = [base, variantStyles[variant], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...props} className={classes}>
      {StartIcon && <StartIcon size={16} weight="bold" />}
      {children}
      {EndIcon   && <EndIcon   size={16} weight="bold" />}
    </button>
  );
}