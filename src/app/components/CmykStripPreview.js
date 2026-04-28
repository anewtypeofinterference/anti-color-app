"use client";

import { cmykToRgb, rgbToColorString } from "../utils/ColorUtils";

export default function CmykStripPreview({ c, m, y, k }) {
  const hasInk = c + m + y + k > 0;
  const rgb = cmykToRgb(c, m, y, k);
  return (
    <div
      className="w-full aspect-16/6 rounded-lg bg-zinc-100"
      style={
        hasInk
          ? { backgroundColor: rgbToColorString(rgb) }
          : undefined
      }
    />
  );
}
