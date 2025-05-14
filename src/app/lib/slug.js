/*  slugify(text [, salt])
    – makes a URL-safe slug
    – removes accents (“Ø” → “O”, “é” → “e”, …)
    – collapses spaces/symbols → “-”
    – optional salt is appended with “-” to guarantee uniqueness
*/
export default function slugify(text, salt = "") {
  const core = text
    .normalize("NFD")                  // decompose accents
    .replace(/[\u0300-\u036f]/g, "")   // drop accent marks
    .toLowerCase()
    .replace(/[\s\W-]+/g, "-")         // whitespace & symbols → “-”
    .replace(/^-|-$/g, "");            // trim leading/trailing “-”

  return salt ? `${core}-${salt}` : core;
}