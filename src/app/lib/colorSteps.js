import { ArrowsHorizontal, ArrowsVertical } from "phosphor-react";

export const CHANNELS = ["c", "m", "y", "k"];
export const AXES = ["X", "Y"];

export const AXIS_ICON = { X: ArrowsHorizontal, Y: ArrowsVertical };

export function axisLabel(axis) {
  return axis === "X" ? "Horisontal" : "Vertikal";
}

/** Defaults when adding an axis — different channels so horisontal + vertikal start distinct. */
export function blankStep(axis) {
  return {
    axis,
    varyChannel: axis === "X" ? "c" : "y",
    stepInterval: 5,
    numMinusSteps: 1,
    numPlusSteps: 1,
  };
}

export function isStepConfigEmpty(s) {
  return !s || (s.numMinusSteps === 0 && s.numPlusSteps === 0);
}

export function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, n));
}

/** Sample CMYK stops along one axis for mini-preview strip */
export function buildAxisGradient(base, cfg) {
  if (!cfg) return [];
  const total = cfg.numMinusSteps + cfg.numPlusSteps + 1;
  return Array.from({ length: total }, (_, i) => {
    const d = (i - cfg.numMinusSteps) * cfg.stepInterval;
    const next = { ...base };
    next[cfg.varyChannel] = clamp(base[cfg.varyChannel] + d, 0, 100);
    return next;
  });
}
