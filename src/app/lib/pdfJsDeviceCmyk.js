/**
 * Device CMYK (0–1) → sRGB bytes, and sRGB → device CMYK (0–1).
 * Polynomial from Mozilla PDF.js / cmyk-preview-toolkit (MIT) — matches common
 * Acrobat & browser PDF CMYK preview behaviour vs naive subtractive RGB.
 * @see https://github.com/mozilla/pdf.js
 */
const clamp01 = (value) => Math.max(0, Math.min(1, value));

const clampByte = (value) => Math.max(0, Math.min(255, Math.round(value)));

/** CMYK inks as fractions 0–1 → { r, g, b } 0–255 */
export function deviceCmykToRgb(c, m, y, k) {
  const c1 = clamp01(c);
  const m1 = clamp01(m);
  const y1 = clamp01(y);
  const k1 = clamp01(k);
  const r =
    255 +
    c1 *
      (-4.387332384609988 * c1 +
        54.48615194189176 * m1 +
        18.82290502165302 * y1 +
        212.25662451639585 * k1 -
        285.2331026137004) +
    m1 *
      (1.7149763477362134 * m1 -
        5.6096736904047315 * y1 -
        17.873870861415444 * k1 -
        5.497006427196366) +
    y1 * (-2.5217340131683033 * y1 - 21.248923337353073 * k1 + 17.5119270841813) +
    k1 * (-21.86122147463605 * k1 - 189.48180835922747);
  const g =
    255 +
    c1 *
      (8.841041422036149 * c1 +
        60.118027045597366 * m1 +
        6.871425592049007 * y1 +
        31.159100130055922 * k1 -
        79.2970844816548) +
    m1 *
      (-15.310361306967817 * m1 +
        17.575251261109482 * y1 +
        131.35250912493976 * k1 -
        190.9453302588951) +
    y1 * (4.444339102852739 * y1 + 9.8632861493405 * k1 - 24.86741582555878) +
    k1 * (-20.737325471181034 * k1 - 187.80453709719578);
  const b =
    255 +
    c1 *
      (0.8842522430003296 * c1 +
        8.078677503112928 * m1 +
        30.89978309703729 * y1 -
        0.23883238689178934 * k1 -
        14.183576799673286) +
    m1 *
      (10.49593273432072 * m1 +
        63.02378494754052 * y1 +
        50.606957656360734 * k1 -
        112.23884253719248) +
    y1 * (0.03296041114873217 * y1 + 115.60384449646641 * k1 - 193.58209356861505) +
    k1 * (-22.33816807309886 * k1 - 180.12613974708367);
  return { r: clampByte(r), g: clampByte(g), b: clampByte(b) };
}

/** sRGB bytes → CMYK fractions 0–1 (GCR-style) */
export function rgbToDeviceCmyk(r, g, b) {
  const r1 = clampByte(r) / 255;
  const g1 = clampByte(g) / 255;
  const b1 = clampByte(b) / 255;
  const k = 1 - Math.max(r1, g1, b1);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 1 };
  return {
    c: (1 - r1 - k) / (1 - k),
    m: (1 - g1 - k) / (1 - k),
    y: (1 - b1 - k) / (1 - k),
    k,
  };
}
