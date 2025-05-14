// src/app/api/generate-pdf/route.js
import { PDFDocument, PDFOperator, StandardFonts } from 'pdf-lib';
import { tmpdir } from 'os';
import { writeFile, readFile, unlink } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req) {
  const { colors, projectName } = await req.json();

  const A3_W = 1190.55, A3_H = 841.89;
  const pdfDoc = await PDFDocument.create();
  const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const norm   = v => Math.max(0, Math.min(1, v / 100));

  // grid layout constants
  const COLS = 7, ROWS = 8, GAP = 12, M = 30, HEADER = 60, PAD = 12;
  const TEXT_AREA = 12;
  const rawRowH = (A3_H - M - HEADER - M - GAP*(ROWS-1)) / ROWS;
  const swH     = rawRowH - TEXT_AREA;
  const swW     = (A3_W - 2*M - GAP*(COLS-1)) / COLS;

  for (const group of colors) {
    const page = pdfDoc.addPage([A3_W, A3_H]);
    const { name, c, m, y, k, stepConfigs = {} } = group;

    // header in pure CMYK black
    page.pushOperators(PDFOperator.of('0 0 0 1 k'));
    page.drawText(
      `${name} — ${new Date().toLocaleDateString('nb-NO',{day:'2-digit',month:'2-digit',year:'2-digit'})}`,
      { x: M, y: A3_H - M - 16, size: 16, font }
    );

    // build step arrays
    const H = stepConfigs.X || { numMinusSteps:0, numPlusSteps:0, stepInterval:0, varyChannel:null };
    const V = stepConfigs.Y || { numMinusSteps:0, numPlusSteps:0, stepInterval:0, varyChannel:null };
    const hArr = Array.from({length: H.numMinusSteps+H.numPlusSteps+1}, (_,i)=>(i-H.numMinusSteps)*H.stepInterval);
    const vArr = Array.from({length: V.numMinusSteps+V.numPlusSteps+1}, (_,i)=>(i-V.numMinusSteps)*V.stepInterval);

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x0 = M + col*(swW+GAP);
        const y0 = A3_H - M - HEADER - (row+1)*(swH+GAP+TEXT_AREA) + TEXT_AREA;

        // if outside configured steps → white
        if (col >= hArr.length || row >= vArr.length) {
          page.pushOperators(PDFOperator.of('0 0 0 0 k'));
          page.pushOperators(PDFOperator.of('q'));
          page.pushOperators(PDFOperator.of(`1 0 0 1 ${x0} ${y0} cm`));
          page.pushOperators(PDFOperator.of(`0 0 ${swW.toFixed(2)} ${swH.toFixed(2)} re`));
          page.pushOperators(PDFOperator.of('f'));
          page.pushOperators(PDFOperator.of('Q'));
          continue;
        }

        const dH = hArr[col], dV = vArr[row];
        // compute CMYK
        let [cc, mm, yy, kk] = [c, m, y, k];
        if (H.varyChannel) {
          const delta = dH;
          if (H.varyChannel==='c') cc+=delta;
          if (H.varyChannel==='m') mm+=delta;
          if (H.varyChannel==='y') yy+=delta;
          if (H.varyChannel==='k') kk+=delta;
        }
        if (V.varyChannel) {
          const delta = dV;
          if (V.varyChannel==='c') cc+=delta;
          if (V.varyChannel==='m') mm+=delta;
          if (V.varyChannel==='y') yy+=delta;
          if (V.varyChannel==='k') kk+=delta;
        }
        // clamp
        cc = Math.max(0,Math.min(100,cc));
        mm = Math.max(0,Math.min(100,mm));
        yy = Math.max(0,Math.min(100,yy));
        kk = Math.max(0,Math.min(100,kk));

        // fill swatch in CMYK
        const c1=norm(cc), m1=norm(mm), y1=norm(yy), k1=norm(kk);
        page.pushOperators(PDFOperator.of(
          `${c1.toFixed(3)} ${m1.toFixed(3)} ${y1.toFixed(3)} ${k1.toFixed(3)} k`
        ));
        page.pushOperators(PDFOperator.of('q'));
        page.pushOperators(PDFOperator.of(`1 0 0 1 ${x0} ${y0} cm`));
        page.pushOperators(PDFOperator.of(`0 0 ${swW.toFixed(2)} ${swH.toFixed(2)} re`));
        page.pushOperators(PDFOperator.of('f'));
        page.pushOperators(PDFOperator.of('Q'));

        // build strings
        const hL = H.varyChannel ? `${H.varyChannel.toUpperCase()}${dH>0?'+':''}${dH}` : '';
        const vL = V.varyChannel ? `${V.varyChannel.toUpperCase()}${dV>0?'+':''}${dV}` : '';
        const labelStr = (dH===0 && dV===0)
          ? 'Base'
          : (hL && vL && H.varyChannel===V.varyChannel
             ? `${H.varyChannel.toUpperCase()}${(dH+dV>0?'+':'')}${dH+dV}`
             : [hL,vL].filter(Boolean).join(' '));
        const valStr = `${cc} ${mm} ${yy} ${kk}`;

        // set pure CMYK black for text
        page.pushOperators(PDFOperator.of('0 0 0 1 k'));

        // draw CMYK values flush left
        page.drawText(valStr, {
          x: x0,          // instead of x0 + PAD
          y: y0 - PAD,
          size: 10,
          font
        });

        // draw step-label flush right
        const stepW = font.widthOfTextAtSize(labelStr, 10);
        page.drawText(labelStr, {
          x: x0 + swW - stepW,  // instead of x0 + swW - stepW - PAD
          y: y0 - PAD,
          size: 10,
          font
        });
      }
    }
  }

  // save + force CMYK outlines via Ghostscript
  const raw    = path.join(tmpdir(), `${projectName}.pdf`);
  const final  = path.join(tmpdir(), `${projectName}-CMYK.pdf`);
  await writeFile(raw, await pdfDoc.save());
  await execAsync(
    `gs -dSAFER -dBATCH -dNOPAUSE ` +
    `-dNoOutputFonts ` +
    `-sDEVICE=pdfwrite ` +
    `-dProcessColorModel=/DeviceCMYK ` +
    `-dColorConversionStrategy=/CMYK ` +
    `-sOutputFile="${final}" "${raw}"`
  );
  const buf = await readFile(final);
  await unlink(raw);
  await unlink(final);

  return new Response(buf, {
    headers: {
      'Content-Type':'application/pdf',
      'Content-Disposition':`attachment; filename="${projectName}-CMYK.pdf"`
    }
  });
}