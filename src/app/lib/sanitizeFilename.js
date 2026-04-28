/** Safe ASCII-ish filename for downloads (e.g. PDF) */
export function sanitizeFilename(name) {
  return name
    .replace(/Æ/g, "AE")
    .replace(/æ/g, "ae")
    .replace(/Ø/g, "O")
    .replace(/ø/g, "o")
    .replace(/Å/g, "AA")
    .replace(/å/g, "aa")
    .replace(/[^\w\s\-().]/g, "")
    .trim();
}
