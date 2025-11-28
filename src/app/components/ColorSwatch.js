// components/ColorSwatch.js
"use client";
import React from "react";
import { cmykToRgb, rgbToColorString, getTextColor, getContrastRatio } from "../utils/ColorUtils";

export default function ColorSwatch({ c, m, y, k, label }) {
  const rgb = cmykToRgb(c, m, y, k);
  const textColorClass = getTextColor(rgb);
  const { withWhite, withBlack } = getContrastRatio(rgb);
  
  // Choose the text color with the best contrast ratio
  const textColor = withWhite > withBlack ? "#fff" : "#000";
  
  return (
    <div
      className="relative w-full rounded-lg overflow-hidden"
      style={{ backgroundColor: rgbToColorString(rgb) }}
    >
      {label && (
        <div
          className={`absolute bottom-2 left-2.5 text-[10px] w-fit ${
            label === "Base" ? "!bottom-1.5 !left-1.5 px-1.25 py-0.5 rounded bg-white/15 !text-white" : ""
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