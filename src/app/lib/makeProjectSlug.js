import slugify from "slugify";

/** URL-safe project / color id from display name (matches existing API expectations) */
export function makeProjectSlug(text) {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
}
