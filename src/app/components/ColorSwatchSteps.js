"use client";

import ColorSwatch from "./ColorSwatch";

const clamp = (v) => (v < 0 ? 0 : v > 100 ? 100 : v);
const pick = (c, m, y, k, ch) => ({ c, m, y, k }[ch]);

/** Signed deltas along one axis: [−nm×Δ, …, 0, …, +np×Δ] */
function deltaArray({ numMinusSteps: nm, numPlusSteps: np, stepInterval: si }) {
  const step = Number(si) || 0;
  return Array.from({ length: nm + np + 1 }, (_, i) => (i - nm) * step);
}

const MAX_COLS = 7;
const MAX_ROWS = 8;

/**
 * CMYK variation grid: X → columns, Y → rows. Uses CSS Grid with 1-based line
 * placement (grid-column / grid-row start at 1 — line 0 is invalid and browsers
 * ignore it, which broke layout when only one axis was active).
 */
export default function ColorSwatchSteps({ c, m, y, k, stepConfigs = [] }) {
  const H = stepConfigs.find((s) => s.axis === "X");
  const V = stepConfigs.find((s) => s.axis === "Y");

  const hCh = H?.varyChannel ?? "y";
  const vCh = V?.varyChannel ?? "y";

  const baseCol = H ? Number(H.numMinusSteps) || 0 : 0;
  const baseRow = V ? Number(V.numMinusSteps) || 0 : 0;

  const hD = H ? deltaArray(H) : [0];
  const vD = V ? deltaArray(V) : [0];

  const grid = Array.from({ length: MAX_ROWS }, () =>
    Array.from({ length: MAX_COLS }, () => ({
      cc: c,
      mm: m,
      yy: y,
      kk: k,
      label: "",
      active: false,
    }))
  );

  vD.forEach((dV, vi) => {
    hD.forEach((dH, hi) => {
      const row =
        baseRow + vi - (V ? Number(V.numMinusSteps) || 0 : 0);
      const col =
        baseCol + hi - (H ? Number(H.numMinusSteps) || 0 : 0);
      if (row < 0 || row >= MAX_ROWS || col < 0 || col >= MAX_COLS) return;

      const cell = grid[row][col];

      if (H) {
        const baseInk = pick(cell.cc, cell.mm, cell.yy, cell.kk, hCh);
        const stepped = clamp(Number(baseInk) + dH);
        if (hCh === "c") cell.cc = stepped;
        if (hCh === "m") cell.mm = stepped;
        if (hCh === "y") cell.yy = stepped;
        if (hCh === "k") cell.kk = stepped;
      }

      if (V) {
        const baseInk = pick(cell.cc, cell.mm, cell.yy, cell.kk, vCh);
        const stepped = clamp(Number(baseInk) + dV);
        if (vCh === "c") cell.cc = stepped;
        if (vCh === "m") cell.mm = stepped;
        if (vCh === "y") cell.yy = stepped;
        if (vCh === "k") cell.kk = stepped;
      }

      let lbl = "";
      const hLbl =
        H && dH !== 0
          ? `${hCh.toUpperCase()}${dH > 0 ? " +" : " "}${dH}`
          : "";
      const vLbl =
        V && dV !== 0
          ? `${vCh.toUpperCase()}${dV > 0 ? " +" : " "}${dV}`
          : "";

      if (dH === 0 && dV === 0) {
        lbl = "Base";
      } else if (hLbl && vLbl) {
        if (H && V && hCh === vCh) {
          const sum = dH + dV;
          lbl = `${hCh.toUpperCase()}${sum > 0 ? "+" : " "}${sum}`;
        } else {
          lbl = `${hLbl} ${vLbl}`;
        }
      } else {
        lbl = hLbl || vLbl;
      }

      cell.label = lbl;
      cell.active = true;
    });
  });

  grid[baseRow][baseCol] = {
    cc: c,
    mm: m,
    yy: y,
    kk: k,
    label: "Base",
    active: true,
  };

  const items = [];

  grid.forEach((row, r) => {
    row.forEach((cell, cIdx) => {
      const gridColumn = cIdx + 1;
      const gridRow = r + 1;

      items.push(
        cell.active ? (
          <div
            key={`sw-${r}-${cIdx}`}
            style={{ gridColumn, gridRow }}
            className="min-h-0 min-w-0"
          >
            <ColorSwatch c={cell.cc} m={cell.mm} y={cell.yy} k={cell.kk} label={cell.label} />
          </div>
        ) : (
          <div key={`ph-${r}-${cIdx}`} style={{ gridColumn, gridRow }} className="rounded min-h-0" />
        )
      );
    });
  });

  return (
    <div
      className="min-h-0 w-full h-full"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${MAX_COLS}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${MAX_ROWS}, minmax(0, 1fr))`,
        gap: "0.5rem",
      }}
    >
      {items}
    </div>
  );
}
