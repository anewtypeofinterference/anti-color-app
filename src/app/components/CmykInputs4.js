"use client";

import GlyphInput from "./GlyphInput";

const KEYS = ["c", "m", "y", "k"];

export default function CmykInputs4({
  value,
  onChange,
  className = "",
  surface = "panel",
  swatchUsesLightInk = true,
}) {
  return (
    <div className={`grid grid-cols-4 gap-2 ${className}`}>
      {KEYS.map((ch) => (
        <GlyphInput
          key={ch}
          name={ch}
          glyph={ch.toUpperCase()}
          type="number"
          min={0}
          max={100}
          value={value[ch]}
          onChange={onChange}
          surface={surface}
          swatchUsesLightInk={swatchUsesLightInk}
        />
      ))}
    </div>
  );
}
