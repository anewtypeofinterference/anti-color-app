"use client";

const numberNoSpin =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

const surfaces = {
  panel: {
    wrap: [
      "rounded-md px-2 py-1.5 bg-black/5 hover:bg-black/10 transition-colors duration-200",
      
    ].join(" "),
    glyph: "text-black/45",
    input: `cursor-pointer focus:cursor-text min-w-0 flex-1 bg-transparent text-sm font-mono tabular-nums text-black outline-none placeholder:text-black/35 ${numberNoSpin}`,
  },
  swatchLightInk: {
    wrap: [
      "rounded-md bg-white/15 hover:bg-white/20 transition-colors duration-200",
    ].join(" "),
    glyph: "text-white/55",
    input: `cursor-pointer focus:cursor-text min-w-0 flex-1 bg-transparent text-sm font-mono tabular-nums text-white outline-none placeholder:text-white/40 ${numberNoSpin}`,
  },
  swatchDarkInk: {
    wrap: [
      "rounded-md bg-black/5 hover:bg-black/10 transition-colors duration-200",
    ].join(" "),
    glyph: "text-black/45",
    input: `cursor-pointer focus:cursor-text min-w-0 flex-1 bg-transparent text-sm font-mono tabular-nums textblack outline-none placeholder:text-black/35 ${numberNoSpin}`,
  },
};

export default function GlyphInput({
  glyph,
  value,
  onChange,
  className = "",
  surface = "panel",
  swatchUsesLightInk = true,
  type,
  ...props
}) {
  const s =
    surface === "swatch"
      ? swatchUsesLightInk
        ? surfaces.swatchLightInk
        : surfaces.swatchDarkInk
      : surfaces.panel;

  return (
    <div className={`flex min-h-9 items-center gap-1.5 px-2 cursor-pointer ${s.wrap} ${className}`}>
      {glyph != null && glyph !== "" && (
        <span className={`shrink-0 font-mono text-sm select-none ${s.glyph}`}>{glyph}</span>
      )}
      <input
        {...props}
        type={type}
        value={value}
        onChange={onChange}
        className={s.input}
      />
    </div>
  );
}
