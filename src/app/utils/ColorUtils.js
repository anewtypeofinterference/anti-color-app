/**
 * CMYK ↔ sRGB for on-screen preview.
 *
 * Browsers render sRGB. Print CMYK is profile- and stock-dependent; there is no
 * single “true” preview without an ICC pipeline. We use the same CMYK→sRGB
 * polynomial as Mozilla PDF.js (also used by cmyk-preview-toolkit), which
 * aligns much more closely with how designers see CMYK in Acrobat / InDesign
 * soft proof and in browser PDF viewers than naive 1−C etc.
 *
 * Stored CMYK values remain 0–100 (%); conversion normalizes to 0–1 for the transform.
 */
import chroma from "chroma-js";

import { deviceCmykToRgb, rgbToDeviceCmyk } from "../lib/pdfJsDeviceCmyk";

/** Clamp CMYK inks to 0–100 (%), then convert for display. */
export function cmykToRgb(c, m, y, k) {
  const ci = Math.max(0, Math.min(100, Number(c) || 0));
  const mi = Math.max(0, Math.min(100, Number(m) || 0));
  const yi = Math.max(0, Math.min(100, Number(y) || 0));
  const ki = Math.max(0, Math.min(100, Number(k) || 0));
  return deviceCmykToRgb(ci / 100, mi / 100, yi / 100, ki / 100);
}

/**
 * sRGB bytes → CMYK % (0–100), inverted with the companion GCR-style path
 * so round-trips stay sane for helpers like createCmykPalette.
 */
export function rgbToCmyk(r, g, b) {
  const { c, m, y, k } = rgbToDeviceCmyk(r, g, b);
  return {
    c: Math.round(Math.max(0, Math.min(100, c * 100))),
    m: Math.round(Math.max(0, Math.min(100, m * 100))),
    y: Math.round(Math.max(0, Math.min(100, y * 100))),
    k: Math.round(Math.max(0, Math.min(100, k * 100))),
  };
}

export function getTextColor({ r, g, b }) {
  const luminance = chroma.rgb(r, g, b).luminance();
  return luminance > 0.5 ? "text-black" : "text-white";
}

/** Readable Tailwind text class for this CMYK using the same preview transform as `cmykToRgb`. */
export function getTextColorForCmyk(c, m, y, k) {
  return getTextColor(cmykToRgb(c, m, y, k));
}

/**
 * For PDF label fill: true = use black (process K), false = knockout (paper white).
 * Aligns with on-screen contrast from `cmykToRgb` + WCAG luminance.
 */
export function cmykPreviewUsesBlackLabelInk(c, m, y, k) {
  return getTextColorForCmyk(c, m, y, k) === "text-black";
}

export function rgbToColorString({ r, g, b }) {
  return `rgb(${r},${g},${b})`;
}

export function getContrastRatio({ r, g, b }) {
  const color = chroma.rgb(r, g, b);
  const black = chroma.rgb(0, 0, 0);
  const white = chroma.rgb(255, 255, 255);

  return {
    withWhite: chroma.contrast(color, white).toFixed(2),
    withBlack: chroma.contrast(color, black).toFixed(2),
  };
}

export function createCmykPalette({ c, m, y, k }, steps = 5) {
  const rgb = cmykToRgb(c, m, y, k);
  const baseColor = chroma.rgb(rgb.r, rgb.g, rgb.b);

  const palette = chroma
    .scale([
      baseColor.luminance(0.8),
      baseColor,
      baseColor.luminance(0.2),
    ])
    .mode("lab")
    .colors(steps);

  return palette.map((color) => {
    const [r, g, b] = color.rgb();
    return rgbToCmyk(r, g, b);
  });
}
