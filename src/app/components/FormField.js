"use client";

import React from 'react';
import Input from './Input';

/**
 * A standard form field component with label and optional error message
 */
export default function FormField({
  label,
  id,
  error,
  type = 'text',
  required = false,
  helpText,
  className = '',
  inputProps = {},
}) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium mb-1 text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Input
        id={id}
        type={type}
        className={error ? 'border-red-500' : ''}
        {...inputProps}
      />
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
} 