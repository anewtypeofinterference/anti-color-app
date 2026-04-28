/**
 * CMYK profiles for print PDFs: catalog OutputIntent + PDF attachment of the .icc
 * (see Acrobat → Output Preview / Vedlegg).
 * ICC files live in public/icc — see public/icc/SOURCE.txt.
 */
export const PRINT_PROFILE_OPTIONS = [
  {
    id: "uncoated-fogra29",
    label: "Ubestrøket — FOGRA29",
    downloadSlug: "uncoated-fogra29",
    iccFilename: "UncoatedFOGRA29.icc",
    outputConditionIdentifier: "FOGRA29 uncoated",
    outputCondition: "Uncoated sheetfed FOGRA29",
  },
  {
    id: "coated-fogra39",
    label: "Bestrøket — FOGRA39",
    downloadSlug: "coated-fogra39",
    iccFilename: "CoatedFOGRA39.icc",
    outputConditionIdentifier: "FOGRA39 coated",
    outputCondition: "Coated sheetfed FOGRA39",
  },
];

const byId = Object.fromEntries(PRINT_PROFILE_OPTIONS.map((p) => [p.id, p]));

export function getPrintProfileById(id) {
  return byId[id] ?? null;
}

export const DEFAULT_PRINT_PROFILE_ID = PRINT_PROFILE_OPTIONS[0].id;
