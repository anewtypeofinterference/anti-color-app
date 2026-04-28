"use client";

export default function PageHeader({
  bg = "bg-zinc-100",
  children,
  className = "",
}) {
  return (
    <header
      className={`relative ${bg} p-8 sticky top-0 z-10 border-b border-zinc-300 ${className}`}
    >
      {children}
    </header>
  );
}
