"use client";
import React from "react";

export default function Card({
  children,
  className = "",
  onClick,
  as = "div",
  hover = false,
}) {
  const Component = as;
  const baseClasses = "p-4 bg-white rounded-md border border-transparent flex flex-col gap-8";
  const hoverClasses = hover
    ? "hover:border-zinc-200 transition-all duration-200"
    : "";
  const classes = [baseClasses, hoverClasses, className].filter(Boolean).join(" ");

  return (
    <Component className={classes} onClick={onClick}>
      {children}
    </Component>
  );
}

Card.Title = function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`font-semibold ${className} leading-none`}>{children}</h3>
  );
};

Card.Content = function CardContent({ children, className = "" }) {
  return <div className={`flex-1 ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = "" }) {
  return <div className={`mt-4 ${className}`}>{children}</div>;
};
