import { PDFDocument, StandardFonts, PDFOperator } from "pdf-lib";

import { cmykPreviewUsesBlackLabelInk } from "./ColorUtils";

const A3_WIDTH = 1190.55;
const A3_HEIGHT = 841.89;

// Helpers
const deltaArray = ({ numMinusSteps, numPlusSteps, stepInterval }) =>
  Array.from({ length: numMinusSteps + numPlusSteps + 1 }, (_, i) => (i - numMinusSteps) * stepInterval);

const clamp = (v) => Math.max(0, Math.min(100, v));
const updateCMYK = (cmyk, channel, delta) => {
  const [c, m, y, k] = cmyk;
  const val = clamp(cmyk["cmyk".indexOf(channel)] + delta);
  return channel === 'c' ? [val, m, y, k] :
         channel === 'm' ? [c, val, y, k] :
         channel === 'y' ? [c, m, val, k] :
                           [c, m, y, val];
};

export async function generatePDF(colors) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth()+1).toString().padStart(2, '0')}.${now.getFullYear().toString().slice(-2)}`;

  const MARGIN = 40, GAP = 8, HEADER = 60, PAD = 10;
  const COLS = 7, ROWS = 8;
  const swW = (A3_WIDTH - 2*MARGIN - (COLS-1)*GAP) / COLS;
  const swH = (A3_HEIGHT - 2*MARGIN - HEADER - (ROWS-1)*GAP) / ROWS;

  for (const { name, c, m, y, k, stepConfigs={} } of colors) {
    const page = pdfDoc.addPage([A3_WIDTH, A3_HEIGHT]);

    // header
    page.drawText(name, { x: MARGIN, y: A3_HEIGHT - MARGIN - 16, size: 16, font });
    const dateW = font.widthOfTextAtSize(dateStr, 16);
    page.drawText(dateStr, { x: A3_WIDTH - MARGIN - dateW, y: A3_HEIGHT - MARGIN - 16, size: 16, font });

    const hSteps = stepConfigs.X ? deltaArray(stepConfigs.X) : [0];
    const vSteps = stepConfigs.Y ? deltaArray(stepConfigs.Y) : [0];

    const baseRow = stepConfigs.Y?.numMinusSteps || 0;
    const baseCol = stepConfigs.X?.numMinusSteps || 0;

    for (let row=0; row<ROWS; row++) {
      for (let col=0; col<COLS; col++) {
        const dH = hSteps[col - baseCol];
        const dV = vSteps[row - baseRow];
        const active = (dH !== undefined && dV !== undefined);

        const x = MARGIN + col * (swW + GAP);
        const y = A3_HEIGHT - MARGIN - HEADER - (row+1)*(swH+GAP) + GAP;

        const cellCMYK = active 
          ? updateCMYK(updateCMYK([c,m,y,k], stepConfigs.X?.varyChannel || 'c', dH || 0), stepConfigs.Y?.varyChannel || 'm', dV || 0)
          : [0,0,0,0]; // white if inactive

        // CMYK background (native)
        const [nc, nm, ny, nk] = cellCMYK.map(v => (v / 100).toFixed(3));
        page.pushOperators(
          PDFOperator.of(`${nc} ${nm} ${ny} ${nk} k`),
          PDFOperator.of("q"),
          PDFOperator.of(`${x} ${y} ${swW} ${swH} re`),
          PDFOperator.of("f"),
          PDFOperator.of("Q"),
        );

        if(active){
          const useBlack = cmykPreviewUsesBlackLabelInk(
            cellCMYK[0],
            cellCMYK[1],
            cellCMYK[2],
            cellCMYK[3]
          );
          const textColor = useBlack ? [0, 0, 0, 1] : [0, 0, 0, 0];
          const [tc,tm,ty,tk] = textColor;
          page.pushOperators(PDFOperator.of(`${tc} ${tm} ${ty} ${tk} k`));
          
          const cmykText = `${cellCMYK.join(' ')}`;
          page.drawText(cmykText, { x:x+PAD, y:y+swH-PAD-10, size:10, font });

          let lbl = (dH||dV)?[
            dH?`${stepConfigs.X?.varyChannel.toUpperCase()}${dH>0?'+':''}${dH}`:'',
            dV?`${stepConfigs.Y?.varyChannel.toUpperCase()}${dV>0?'+':''}${dV}`:''
          ].filter(Boolean).join(' '):'Base';

          page.drawText(lbl, { x:x+PAD, y:y+PAD, size:10, font });
        }
      }
    }
  }
  return pdfDoc.save();
}