// src/app/components/ColorCard.jsx
import Link from "next/link";
import { ArrowRight, DotsThreeVertical } from "phosphor-react";
import Button from "./Button";
import Modal from "./Modal";
import Popover from "./Popover";

// CMYK→RGB
const cmykToRgb = (c, m, y, k) => ({
  r: Math.round(255 * (1 - c / 100) * (1 - k / 100)),
  g: Math.round(255 * (1 - m / 100) * (1 - k / 100)),
  b: Math.round(255 * (1 - y / 100) * (1 - k / 100)),
});
const txtColor = ({ r, g, b }) =>
  (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? "text-black" : "text-white";

export default function ColorCard({
  color,
  projectId,
  menuOpen,
  onMenuToggle,
  confirmId,
  setConfirmId,
  onDelete,
}) {
  const { r, g, b } = cmykToRgb(color.c, color.m, color.y, color.k);
  const tc = txtColor({ r, g, b });

  return (
    <div className="relative group aspect-[4/3]">
      {/* Three-dot trigger */}
      <div className="absolute top-7 right-7">
        <Button
          variant="rounded"
          startIcon={DotsThreeVertical}
          className={`
            !bg-transparent
            ${tc === "text-black" ? "text-black hover:!bg-black/5" : "text-white hover:!bg-white/10"}
          `}
          onClick={(e) => {
            e.stopPropagation();
            setConfirmId(null);
            onMenuToggle(color.id);
          }}
        />
      </div>

      {/* pop-over menu */}
      <Popover
        open={menuOpen}
        onClose={() => onMenuToggle(null)}
        anchorId={color.id}
      >
        <button
          className="w-full text-left px-4 py-3 text-white hover:bg-white/20 rounded-md cursor-pointer font-medium"
          onClick={() => setConfirmId(color.id)}
        >
          Slett farge
        </button>
      </Popover>

      {/* Confirm delete modal */}
      {confirmId === color.id && (
        <Modal
          title="Slett farge"
          description="Er du sikker? Dette kan ikke angres."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            onDelete(color.id);
            setConfirmId(null);
          }}
          confirmLabel="Slett"
          cancelLabel="Avbryt"
        />
      )}

      {/* The swatch */}
      <Link href={`/${projectId}/${color.id}`} passHref>
        <div className="p-9 bg-white rounded-2xl cursor-pointer flex flex-col justify-between h-full group" style={{ backgroundColor: `rgb(${r},${g},${b})` }}
        >
          <h3 className={`text-2xl ${tc}`}>{color.name}</h3>
          <div className={`flex gap-1 text-sm ${tc === "text-white" ? "text-white" : "text-black"}`}>
            <span className={`py-0.75 px-2 rounded-md ${tc === "text-black" ? "bg-black/10" : "bg-white/15"}`}>{color.c}</span>
            <span className={`py-0.75 px-2 rounded-md ${tc === "text-black" ? "bg-black/10" : "bg-white/15"}`}>{color.m}</span>
            <span className={`py-0.75 px-2 rounded-md ${tc === "text-black" ? "bg-black/10" : "bg-white/15"}`}>{color.y}</span>
            <span className={`py-0.75 px-2 rounded-md ${tc === "text-black" ? "bg-black/10" : "bg-white/15"}`}>{color.k}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}