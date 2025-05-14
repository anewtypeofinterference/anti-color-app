"use client";

import React from "react";
import { saveAs } from "file-saver";
import { generatePDF } from "../utils/pdfUtils";

export default function GlobalDownloadPdf({ colors }) {
  const handleDownload = async () => {
    try {
      const pdfBytes = await generatePDF(colors);
      saveAs(new Blob([pdfBytes], { type: "application/pdf" }), "global-cmyk-colors.pdf");
    } catch (error) {
      console.error("Error generating global PDF:", error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="fixed top-4 right-4 bg-black text-white px-4 py-2 rounded-md shadow-md"
    >
      Download PDF
    </button>
  );
}