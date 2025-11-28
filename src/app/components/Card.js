"use client";

import React from 'react';

/**
 * A reusable card component with consistent styling
 */
export default function Card({
  children,
  className = '',
  onClick,
  as = 'div',
  hover = false,
}) {
  const Component = as;
  const baseClasses = "p-9 bg-white rounded-2xl flex flex-col";
  const hoverClasses = hover ? "cursor-pointer hover:shadow-md transition-shadow duration-200" : "";
  const classes = `${baseClasses} ${hoverClasses} ${className}`;
  
  return (
    <Component className={classes} onClick={onClick}>
      {children}
    </Component>
  );
}

/**
 * Card title component
 */
Card.Title = function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-2xl font-medium mb-6 ${className}`}>{children}</h3>
  );
};

/**
 * Card content component
 */
Card.Content = function CardContent({ children, className = '' }) {
  return (
    <div className={`flex-1 ${className}`}>{children}</div>
  );
};

/**
 * Card footer component
 */
Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-6 ${className}`}>{children}</div>
  );
}; 