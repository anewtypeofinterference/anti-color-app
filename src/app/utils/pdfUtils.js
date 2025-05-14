// util/pdfUtils.js
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

// A3 landscape in points
const A3_WIDTH  = 1190.55;
const A3_HEIGHT =  841.89;

// Convert CMYK (0–100) → normalized rgb object
function cmykToRgbObj(c, m, y, k) {
  const r = (1 - c/100) * (1 - k/100);
  const g = (1 - m/100) * (1 - k/100);
  const b = (1 - y/100) * (1 - k/100);
  return { r, g, b };
}

// Build the array of deltas: [–nm⋅si … +np⋅si]
function deltaArray({ numMinusSteps, numPlusSteps, stepInterval }) {
  const nm = Number(numMinusSteps);
  const np = Number(numPlusSteps);
  const si = Number(stepInterval);
  return Array.from({ length: nm + np + 1 }, (_, i) => (i - nm) * si);
}

// Pick & update helpers for CMYK channels
function pick([c, m, y, k], key) {
  switch (key) {
    case "c": return c;
    case "m": return m;
    case "y": return y;
    case "k": return k;
  }
}
function updateChannel(c, m, y, k, key, value) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  switch (key) {
    case "c": return [v, m, y, k];
    case "m": return [c, v, y, k];
    case "y": return [c, m, v, k];
    case "k": return [c, m, y, v];
  }
}

export async function generatePDF(colors) {
  const pdfDoc    = await PDFDocument.create();
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Norwegian date format DD.MM.YY
  const now = new Date();
  const dd  = String(now.getDate()).padStart(2, "0");
  const mm  = String(now.getMonth() + 1).padStart(2, "0");
  const yy  = String(now.getFullYear()).slice(-2);
  const dateStr = `${dd}.${mm}.${yy}`;

  for (const { name, c, m, y: yellow, k, stepConfigs = {} } of colors) {
    const page = pdfDoc.addPage([A3_WIDTH, A3_HEIGHT]);
    const { width, height } = page.getSize();

    // Header: name (smaller) on left, date on right
    const nameSize = 16;
    page.drawText(name, { x: 40, y: height - 40, size: nameSize, font: helvetica, color: rgb(0,0,0) });
    const dateW = helvetica.widthOfTextAtSize(dateStr, nameSize);
    page.drawText(dateStr, { x: width - 40 - dateW, y: height - 40, size: nameSize, font: helvetica, color: rgb(0,0,0) });

    // Prepare deltas
    const H = stepConfigs.X;
    const V = stepConfigs.Y;
    const hD = H ? deltaArray(H) : [0];
    const vD = V ? deltaArray(V) : [0];

    // Grid layout
    const COLS = 7, ROWS = 8, GAP = 8, M = 40;
    const totalGapX = GAP * (COLS - 1);
    const totalGapY = GAP * (ROWS - 1);
    const swW = (width  - M*2 - totalGapX) / COLS;
    const swH = (height - M*2 - totalGapY - 60) / ROWS; // 60 for header
    const pad = 12;
    const radius = 6;

    // Draw each swatch with manual rounding
    vD.forEach((dV, rowIdx) => {
      hD.forEach((dH, colIdx) => {
        if (rowIdx >= ROWS || colIdx >= COLS) return;

        const x0 = M + colIdx * (swW + GAP);
        const y0 = height - M - 60 - rowIdx * (swH + GAP) - swH;

        // Base CMYK
        let [cc, mm, yy, kk] = [c, m, yellow, k];
        if (H) {
          const baseVal = pick([cc,mm,yy,kk], H.varyChannel) + dH;
          [cc,mm,yy,kk] = updateChannel(cc,mm,yy,kk, H.varyChannel, baseVal);
        }
        if (V) {
          const baseVal = pick([cc,mm,yy,kk], V.varyChannel) + dV;
          [cc,mm,yy,kk] = updateChannel(cc,mm,yy,kk, V.varyChannel, baseVal);
        }

        const { r, g, b } = cmykToRgbObj(cc, mm, yy, kk);
        const bg = rgb(r, g, b);
        const lum = 0.299*r + 0.587*g + 0.114*b;
        const textColor = lum > 0.5 ? rgb(0,0,0) : rgb(1,1,1);

        // center rect
        page.drawRectangle({ x: x0 + radius, y: y0, width: swW - 2*radius, height: swH, color: bg });
        // middle vertical
        page.drawRectangle({ x: x0, y: y0 + radius, width: swW, height: swH - 2*radius, color: bg });
        // corners
        page.drawEllipse({ x: x0 + radius, y: y0 + radius, xScale: radius, yScale: radius, color: bg });
        page.drawEllipse({ x: x0 + swW - radius, y: y0 + radius, xScale: radius, yScale: radius, color: bg });
        page.drawEllipse({ x: x0 + radius, y: y0 + swH - radius, xScale: radius, yScale: radius, color: bg });
        page.drawEllipse({ x: x0 + swW - radius, y: y0 + swH - radius, xScale: radius, yScale: radius, color: bg });

        // Draw individual CMYK values top-left inside swatch (no letters)
        const cmykText = `${cc} ${mm} ${yy} ${kk}`;
        page.drawText(cmykText, { x: x0 + pad, y: y0 + swH - pad - 8, size: 10, font: helvetica, color: textColor });

        // label with spaced sign, e.g. K -10   C +4
        let label = "Base";
        if (dH || dV) {
          const hLbl = H && dH
            ? `${H.varyChannel.toUpperCase()} ${dH>0?"+":""}${dH}`
            : "";
          const vLbl = V && dV
            ? `${V.varyChannel.toUpperCase()} ${dV>0?"+":""}${dV}`
            : "";
          if (hLbl && vLbl && H?.varyChannel===V?.varyChannel) {
            const sum = dH+dV;
            label = `${H.varyChannel.toUpperCase()} ${sum>0?"+":""}${sum}`;
          } else {
            label = [hLbl, vLbl].filter(Boolean).join("   ");
          }
        }
        page.drawText(label, { x: x0 + pad, y: y0 + pad, size: 10, font: helvetica, color: textColor });
      });
    });
  }

  return pdfDoc.save();
}
