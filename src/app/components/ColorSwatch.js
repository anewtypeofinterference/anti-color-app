// components/ColorSwatch.js
"use client";
import React from "react";

function cmykToRgb(c, m, y, k) {
  const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
  const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
  const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
  return { r, g, b };
}

export default function ColorSwatch({ c, m, y, k, label }) {
  const { r, g, b } = cmykToRgb(c, m, y, k);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const textColor = brightness > 127 ? "#000" : "#fff";

  return (
    <div
      className="relative w-full rounded-lg overflow-hidden"
      style={{ backgroundColor: `rgb(${r},${g},${b})` }}
    >
      {label && (
        <div
          className={`absolute bottom-2 left-2.5 text-[10px] w-fit ${label === "Base" ? "!bottom-1.5 !left-1.5 px-1.25 py-0.5 rounded bg-white/15 !text-white" : ""}`}
          style={{
            color: textColor,
            backgroundColor:
              label === "Base" ? "" : "transparent",
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