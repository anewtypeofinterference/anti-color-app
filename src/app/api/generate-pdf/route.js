// src/app/api/generate-pdf/route.js
import { createCanvas } from 'canvas';
import { PDFDocument, PDFOperator } from 'pdf-lib';
import { tmpdir } from 'os';
import { writeFile, readFile, unlink } from 'fs/promises';
import path from 'path';

export async function POST(req) {
  const { colors, projectName } = await req.json();

  // Cache rendered PNGs
  const pngCache = new Map();
  async function makeLabelPng(text, cmyk) {
    const key = `${text}|${cmyk.join(',')}`;
    if (pngCache.has(key)) return pngCache.get(key);

    const pt      = 10;
    const pxPerPt = 300 / 72;
    const pxH     = Math.ceil(pt * pxPerPt) + 4;
    const pxW     = Math.ceil(text.length * pt * pxPerPt * 0.6) + 4;

    const canvas = createCanvas(pxW, pxH);
    const ctx    = canvas.getContext('2d');

    // Paint text in nearest RGB for the PNG,
    // but we'll wrap the PNG in CMYK ops below.
    const [c,m,y,k] = cmyk;
    const r = Math.round(255*(1-c/100)*(1-k/100));
    const g = Math.round(255*(1-m/100)*(1-k/100));
    const b = Math.round(255*(1-y/100)*(1-k/100));
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.font      = `${pt*pxPerPt}px sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(text, 2, 2);

    const buffer   = canvas.toBuffer('image/png');
    const filename = `lbl-${Buffer.from(key).toString('hex')}.png`;
    const filepath = path.join(tmpdir(), filename);
    await writeFile(filepath, buffer);
    pngCache.set(key, filepath);
    return filepath;
  }

  // CMYK normalization
  const norm = v => Math.max(0, Math.min(1, v/100));

  // Page/grid constants
  const A3_W = 1190.55, A3_H = 841.89;
  const COLS = 7, ROWS = 8, GAP = 8, M = 40, HEADER = 60, PAD = 6;
  const swW  = (A3_W - 2*M - GAP*(COLS-1)) / COLS;
  const swH  = (A3_H - M - HEADER - M - GAP*(ROWS-1)) / ROWS;

  const pdfDoc = await PDFDocument.create();

  for (const group of colors) {
    const page = pdfDoc.addPage([A3_W, A3_H]);
    const today = new Date().toLocaleDateString('nb-NO',{
      day:'2-digit',month:'2-digit',year:'2-digit'
    });

    // Header (drawn normally—will be converted on export)
    page.drawText(`${group.name} — ${today}`, {
      x: M, y: A3_H - M - 16, size: 16
    });

    // Build H/V
    const H = group.stepConfigs?.X || {
      numMinusSteps:0, numPlusSteps:0,
      stepInterval:0, varyChannel:null
    };
    const V = group.stepConfigs?.Y || {
      numMinusSteps:0, numPlusSteps:0,
      stepInterval:0, varyChannel:null
    };
    const hArr = Array.from(
      {length: H.numMinusSteps + H.numPlusSteps + 1},
      (_,i)=> (i - H.numMinusSteps)*H.stepInterval
    );
    const vArr = Array.from(
      {length: V.numMinusSteps + V.numPlusSteps + 1},
      (_,i)=> (i - V.numMinusSteps)*V.stepInterval
    );

    // Draw grid
    for (let r = 0; r < ROWS; r++) {
      for (let c0 = 0; c0 < COLS; c0++) {
        const x0 = M + c0*(swW + GAP);
        const y0 = A3_H - M - HEADER - (r+1)*(swH + GAP);

        // Outside = white
        if (c0 >= hArr.length || r >= vArr.length) {
          page.pushOperators(
            PDFOperator.of('0 0 0 0 k'),
            PDFOperator.of('q'),
            PDFOperator.of(`1 0 0 1 ${x0} ${y0} cm`),
            PDFOperator.of(`0 0 ${swW} ${swH} re`),
            PDFOperator.of('f'),
            PDFOperator.of('Q')
          );
          continue;
        }

        // Compute CMYK
        const dH = hArr[c0], dV = vArr[r];
        let [cc, mm, yy, kk] = [group.c, group.m, group.y, group.k];
        if (H.varyChannel) cc = Math.max(0,Math.min(100, cc + (H.varyChannel==='c'?dH:0)));
        if (H.varyChannel==='m') mm = Math.max(0,Math.min(100, mm + dH));
        if (H.varyChannel==='y') yy = Math.max(0,Math.min(100, yy + dH));
        if (H.varyChannel==='k') kk = Math.max(0,Math.min(100, kk + dH));
        if (V.varyChannel==='c') cc = Math.max(0,Math.min(100, cc + dV));
        if (V.varyChannel==='m') mm = Math.max(0,Math.min(100, mm + dV));
        if (V.varyChannel==='y') yy = Math.max(0,Math.min(100, yy + dV));
        if (V.varyChannel==='k') kk = Math.max(0,Math.min(100, kk + dV));

        // Swatch fill in CMYK
        page.pushOperators(
          PDFOperator.of(
            `${norm(cc).toFixed(3)} ${norm(mm).toFixed(3)} ` +
            `${norm(yy).toFixed(3)} ${norm(kk).toFixed(3)} k`
          ),
          PDFOperator.of('q'),
          PDFOperator.of(`1 0 0 1 ${x0} ${y0} cm`),
          PDFOperator.of(`0 0 ${swW.toFixed(2)} ${swH.toFixed(2)} re`),
          PDFOperator.of('f'),
          PDFOperator.of('Q')
        );

        // Build texts
        const valStr = `${cc} ${mm} ${yy} ${kk}`;
        let lbl = 'Base';
        if (dH || dV) {
          const hL = H.varyChannel
            ? `${H.varyChannel.toUpperCase()}${dH>0?'+':''}${dH}` : '';
          const vL = V.varyChannel
            ? `${V.varyChannel.toUpperCase()}${dV>0?'+':''}${dV}` : '';
          lbl = (hL && vL && H.varyChannel===V.varyChannel)
            ? `${H.varyChannel.toUpperCase()}${(dH+dV>0?'+':'')}${dH+dV}`
            : [hL, vL].filter(Boolean).join(' ');
        }

        // Contrast
        const lum =
          0.299*(1-cc/100)*(1-kk/100) +
          0.587*(1-mm/100)*(1-kk/100) +
          0.114*(1-yy/100)*(1-kk/100);
        const txtCmyk = lum>0.5
          ? [0,0,0,100]
          : [0,0,0,0];

        // Render PNGs
        const [lblPath, vPath] = await Promise.all([
          makeLabelPng(lbl, txtCmyk),
          makeLabelPng(valStr, txtCmyk),
        ]);
        const [lblImg, valImg] = await Promise.all([
          pdfDoc.embedPng(await readFile(lblPath)),
          pdfDoc.embedPng(await readFile(vPath)),
        ]);

        const px2pt = 72/300;
        const { width: lw, height: lh } = lblImg.scale(px2pt);
        const { width: vw, height: vh } = valImg.scale(px2pt);

        // **LEFT-align** the CMYK-value:
        page.drawImage(valImg, {
          x: x0 + PAD,
          y: y0 + PAD,
          width:  vw,
          height: vh,
        });

        // **RIGHT-align** the step-label under the same swatch:
        page.drawImage(lblImg, {
          x: x0 + swW - PAD - lw,
          y: y0 + PAD,
          width:  lw,
          height: lh,
        });
      }
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Response(pdfBytes, {
    headers:{
      'Content-Type':'application/pdf',
      'Content-Disposition':`attachment; filename="${projectName}-CMYK.pdf"`,
    }
  });
}