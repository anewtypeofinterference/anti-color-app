// File: src/pages/api/generate-pdf.js
import fs from "fs";
import path from "path";
import { PDFDocument, PDFOperator } from "pdf-lib";
import TextToSVG from "text-to-svg";
import parse from "svg-path-parser";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const { colors, projectName } = req.body;

  // 1) load Inter.ttf so TextToSVG can vectorize every glyph
  const fontPath = path.join(process.cwd(), "public", "fonts", "Inter.ttf");
  const textToSVG = TextToSVG.loadSync(fontPath);

  // 2) helper: SVG-path → PDFOperator[]
  function svgPathToOps(d, dx, dy) {
    return parse(d).flatMap((cmd) => {
      switch (cmd.code) {
        case "M": return [PDFOperator.of(`${cmd.x + dx} ${dy - cmd.y} m`)];
        case "L": return [PDFOperator.of(`${cmd.x + dx} ${dy - cmd.y} l`)];
        case "C":
          return [PDFOperator.of(
            `${cmd.x1 + dx} ${dy - cmd.y1} ` +
            `${cmd.x2 + dx} ${dy - cmd.y2} ` +
            `${cmd.x + dx} ${dy - cmd.y} c`
          )];
        case "Q": {
          const { x1, y1, x, y } = cmd;
          const c1x = x1 + (2/3)*(x - x1),
                c1y = y1 + (2/3)*(y - y1),
                c2x = x  + (2/3)*(x1- x),
                c2y = y  + (2/3)*(y1- y);
          return [PDFOperator.of(
            `${c1x + dx} ${dy - c1y} ` +
            `${c2x + dx} ${dy - c2y} ` +
            `${x   + dx} ${dy - y   } c`
          )];
        }
        case "Z": return [PDFOperator.of("h")];
        default:  return [];
      }
    });
  }

  // 3) draw detailed outlined text (returns its width in PDF-points)
  function drawOutlinedText(page, text, x, y, fontSize) {
    const opts = { x:0, y:0, fontSize, anchor:"top" };
    const d = textToSVG.getD(text, opts);
    const metrics = textToSVG.getMetrics(text, opts);
    page.pushOperators(PDFOperator.of("q"));
    svgPathToOps(d, x, y + fontSize).forEach(op => page.pushOperators(op));
    page.pushOperators(PDFOperator.of("f"));
    page.pushOperators(PDFOperator.of("Q"));
    return metrics.width;
  }

  // 4) setup PDF + grid
  const doc = await PDFDocument.create();
  const norm = v => Math.max(0, Math.min(1, v/100));

  const A3_W = 1190.55, A3_H = 841.89;
  const M = 40, HEADER = 60, GAP = 8, PAD = 12;
  const COLS = 7, ROWS = 8;
  const swW = (A3_W - 2*M - GAP*(COLS-1))/COLS;
  const swH = (A3_H - M - HEADER - M - GAP*(ROWS-1))/ROWS;

  for (const group of colors) {
    const page = doc.addPage([A3_W, A3_H]);

    // — HEADER: name left, date right
    const headerSize = 16;
    const headerY = A3_H - M - headerSize;
    const nameStr = group.name;
    const dateStr = new Date()
      .toLocaleDateString("nb-NO",{ day:"2-digit", month:"2-digit", year:"2-digit" });

    // pure-black CMYK
    page.pushOperators(PDFOperator.of("0 0 0 1 k"));

    // draw name at M:
    drawOutlinedText(page, nameStr, M, headerY, headerSize);

    // measure date width, then draw flush right
    const dateW = textToSVG.getMetrics(dateStr, { x:0, y:0, fontSize:headerSize, anchor:"top" }).width;
    drawOutlinedText(
      page,
      dateStr,
      A3_W - M - dateW,
      headerY,
      headerSize
    );

    // — build H/V arrays
    const H = group.stepConfigs?.X ?? { numMinusSteps:0, numPlusSteps:0, stepInterval:0, varyChannel:null };
    const V = group.stepConfigs?.Y ?? { numMinusSteps:0, numPlusSteps:0, stepInterval:0, varyChannel:null };
    const hArr = Array.from({ length:H.numMinusSteps+H.numPlusSteps+1 },
                            (_,i)=>(i-H.numMinusSteps)*H.stepInterval);
    const vArr = Array.from({ length:V.numMinusSteps+V.numPlusSteps+1 },
                            (_,i)=>(i-V.numMinusSteps)*V.stepInterval);

    // — draw grid
    for (let row=0; row<ROWS; row++) {
      for (let col=0; col<COLS; col++) {
        const x0 = M + col*(swW+GAP);
        const y0 = A3_H - M - HEADER - row*(swH+GAP) - swH;

        // out-of-range → white
        if (col>=hArr.length||row>=vArr.length) {
          page.pushOperators(PDFOperator.of("0 0 0 0 k"));
          page.pushOperators(PDFOperator.of("q"));
          page.pushOperators(PDFOperator.of(`1 0 0 1 ${x0} ${y0} cm`));
          page.pushOperators(PDFOperator.of(`0 0 ${swW} ${swH} re`));
          page.pushOperators(PDFOperator.of("f"));
          page.pushOperators(PDFOperator.of("Q"));
          continue;
        }

        // compute CMYK
        let [cc,mm,yy,kk] = [group.c,group.m,group.y,group.k].map(v=>Math.max(0,Math.min(100,v)));
        const dH = hArr[col], dV = vArr[row];
        if (H.varyChannel==="c") cc+=dH;
        if (H.varyChannel==="m") mm+=dH;
        if (H.varyChannel==="y") yy+=dH;
        if (H.varyChannel==="k") kk+=dH;
        if (V.varyChannel==="c") cc+=dV;
        if (V.varyChannel==="m") mm+=dV;
        if (V.varyChannel==="y") yy+=dV;
        if (V.varyChannel==="k") kk+=dV;
        [cc,mm,yy,kk] = [cc,mm,yy,kk].map(v=>Math.max(0,Math.min(100,v)));

        // rounded‐corner swatch with radius R=6
        const R=6, K=0.5522847498;
        page.pushOperators(
          PDFOperator.of(`${norm(cc).toFixed(3)} ${norm(mm).toFixed(3)} ${norm(yy).toFixed(3)} ${norm(kk).toFixed(3)} k`),
          PDFOperator.of("q"),
          PDFOperator.of(`1 0 0 1 ${x0} ${y0} cm`),
          PDFOperator.of(`${R} 0 m`),
          PDFOperator.of(`${swW-R} 0 l`),
          PDFOperator.of(`${swW-R+R*K} 0 ${swW} ${R-R*K} ${swW} ${R} c`),
          PDFOperator.of(`${swW} ${swH-R} l`),
          PDFOperator.of(`${swW} ${swH-R+R*K} ${swW-R+R*K} ${swH} ${swW-R} ${swH} c`),
          PDFOperator.of(`${R} ${swH} l`),
          PDFOperator.of(`${R-R*K} ${swH} 0 ${swH-R+R*K} 0 ${swH-R} c`),
          PDFOperator.of(`0 ${R} l`),
          PDFOperator.of(`0 ${R-R*K} ${R-R*K} 0 ${R} 0 c`),
          PDFOperator.of("h"),
          PDFOperator.of("f"),
          PDFOperator.of("Q")
        );

        // two labels
        const valStr = `${cc} ${mm} ${yy} ${kk}`;
        let lbl;
        if (dH===0&&dV===0) lbl="Base";
        else {
          const hL = H.varyChannel?`${H.varyChannel.toUpperCase()}${dH>0?"+":""}${dH}`:"";
          const vL = V.varyChannel?`${V.varyChannel.toUpperCase()}${dV>0?"+":""}${dV}`:"";
          if (hL&&vL&&H.varyChannel===V.varyChannel) {
            const sum=dH+dV;
            lbl=`${H.varyChannel.toUpperCase()}${sum>0?"+":""}${sum}`;
          } else lbl=[hL,vL].filter(Boolean).join(" ");
        }

        // choose K-only text for best contrast
        const lum=0.299*(1-cc/100)*(1-kk/100)
                  +0.587*(1-mm/100)*(1-kk/100)
                  +0.114*(1-yy/100)*(1-kk/100);
        const fillOp = lum>0.5?"0 0 0 1 k":"0 0 0 0 k";
        page.pushOperators(PDFOperator.of(fillOp));

        // bottom-left: CMYK numbers
        drawOutlinedText(page, valStr, x0+PAD, y0+PAD, 10);
        // top-left: step label
        drawOutlinedText(page, lbl,   x0+PAD, y0+swH-PAD-10, 10);
      }
    }
  }

  const pdfBytes = await doc.save();
  res
    .status(200)
    .setHeader("Content-Type","application/pdf")
    .setHeader("Content-Disposition",`attachment; filename="${projectName}-CMYK.pdf"`)
    .send(Buffer.from(pdfBytes));
}