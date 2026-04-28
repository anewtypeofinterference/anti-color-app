// components/ColorSwatch.js
"use client";
import React from "react";
import { cmykToRgb, rgbToColorString, getTextColorForCmyk } from "../utils/ColorUtils";

export default function ColorSwatch({ c, m, y, k, label }) {
  const rgb = cmykToRgb(c, m, y, k);
  const useDarkText = getTextColorForCmyk(c, m, y, k) === "text-black";
  const textColor = useDarkText ? "#000" : "#fff";
  
  return (
    <div
      className="relative w-full h-full rounded-sm overflow-hidden"
      style={{ backgroundColor: rgbToColorString(rgb) }}
    >
      {label && (
        <div
          className={`absolute bottom-2 left-2.5 text-[10px] py-0.5 px-1 rounded-sm w-fit ${
            label === "Base" ? "bg-white/15" : ""
          }`}
          style={{
            color: textColor,
            backgroundColor: label === "Base" ? "" : "transparent",
          }}
        >
          {label}
        </div>
      )}

      <div
        className="absolute top-2 left-2.5 text-[10px]"
        style={{ color: textColor }}
      >
        {c} {m} {y} {k}
      </div>
    </div>
  );
}
