import {
  PDFArray,
  PDFDict,
  PDFName,
  PDFString,
  PDFRawStream,
} from "pdf-lib";

/** pdf-lib's PDFString writes raw ( ); unescaped parens corrupt the PDF. */
function pdfLiteral(value) {
  return PDFString.of(
    String(value)
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
  );
}

/**
 * Declares intended CMYK print condition so Acrobat Output Preview / print sim
 * can default to this profile. Page art stays DeviceCMYK.
 * DestOutputProfile stream must be raw ICC only — no /N,/Alternate (those are for ICCBased).
 */
export function attachCmykOutputIntent(doc, iccBytes, meta) {
  const { outputConditionIdentifier, outputCondition, info } = meta;
  const context = doc.context;
  const catalog = doc.catalog;

  const bytes =
    iccBytes instanceof Uint8Array ? iccBytes : new Uint8Array(iccBytes);

  const streamDict = PDFDict.withContext(context);
  const iccStream = PDFRawStream.of(streamDict, bytes);
  const iccRef = context.register(iccStream);

  const intentDict = PDFDict.withContext(context);
  intentDict.set(PDFName.of("Type"), PDFName.of("OutputIntent"));
  intentDict.set(PDFName.of("S"), PDFName.of("GTS_PDFX"));
  intentDict.set(
    PDFName.of("OutputConditionIdentifier"),
    pdfLiteral(outputConditionIdentifier)
  );
  intentDict.set(PDFName.of("RegistryName"), pdfLiteral("http://www.color.org#"));
  if (outputCondition) {
    intentDict.set(PDFName.of("OutputCondition"), pdfLiteral(outputCondition));
  }
  if (info) {
    intentDict.set(PDFName.of("Info"), pdfLiteral(info));
  }
  intentDict.set(PDFName.of("DestOutputProfile"), iccRef);

  const intentRef = context.register(intentDict);
  const outArray = PDFArray.withContext(context);
  outArray.push(intentRef);
  catalog.set(PDFName.of("OutputIntents"), outArray);
}
