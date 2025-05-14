import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generatePDF(colors) {
  const pdfDoc = await PDFDocument.create();
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  colors.forEach(async ({ c, m, y, k }, index) => {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(`Base Color ${index + 1}: CMYK(${c}%, ${m}%, ${y}%, ${k}%)`, {
      x: 50,
      y: pageHeight - 50,
      size: 18,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });
  });

  return await pdfDoc.save();
}