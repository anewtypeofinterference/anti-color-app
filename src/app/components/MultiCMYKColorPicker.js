"use client";

import React from "react";
import BaseColorPicker from "./BaseColorPicker";

export default function MultiCMYKColorPicker({ colors, handleColorChange, removeColor }) {
  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto">
      {colors.map((color, index) => (
        <BaseColorPicker
          key={index}
          index={index}
          color={color}
          handleColorChange={handleColorChange}
          handleRemove={colors.length > 1 ? () => removeColor(index) : null}
        />
      ))}
    </div>
  );
}
