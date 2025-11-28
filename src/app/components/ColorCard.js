// src/app/components/ColorCard.jsx
"use client";
import Link from "next/link";
import { DotsThreeVertical } from "phosphor-react";
import { cmykToRgb, getTextColor, rgbToColorString } from "../utils/ColorUtils";
import Button from "./Button";
import PopoverMenu from "./PopoverMenu";
import ConfirmationDialog from "./ConfirmationDialog";

export default function ColorCard({
  color,
  projectId,
  menuOpen,
  onMenuToggle,
  confirmId,
  setConfirmId,
  onDelete,
}) {
  const rgb = cmykToRgb(color.c, color.m, color.y, color.k);
  const textColorClass = getTextColor(rgb);
  const bgColor = rgbToColorString(rgb);
  
  const menuItems = [
    {
      label: "Slett farge",
      onClick: () => setConfirmId(color.id),
    }
  ];

  return (
    <div className="relative group aspect-[4/3]">
      {/* Three-dot trigger */}
      <div className="absolute top-6.5 right-6.5 z-20">
        <Button
          variant="rounded"
          startIcon={DotsThreeVertical}
          className={`
            !bg-transparent
            ${textColorClass === "text-black" ? "text-black hover:!bg-black/5" : "text-white hover:!bg-white/10"}
          `}
          onClick={(e) => {
            e.stopPropagation();
            setConfirmId(null);
            onMenuToggle(color.id);
          }}
        />
      </div>

      {/* pop-over menu */}
      <PopoverMenu
        open={menuOpen}
        onClose={() => onMenuToggle(null)}
        anchorId={color.id}
        menuItems={menuItems}
      />

      {/* Confirm delete dialog */}
      <ConfirmationDialog
        isOpen={confirmId === color.id}
        onClose={() => setConfirmId(null)}
        onConfirm={() => onDelete(color.id)}
        title="Slett farge"
        description="Er du sikker? Dette kan ikke angres."
        confirmLabel="Slett"
        cancelLabel="Avbryt"
        variant="danger"
      />

      {/* The swatch */}
      <Link href={`/${projectId}/${color.id}`} passHref>
        <div 
          className="p-9 rounded-2xl cursor-pointer flex flex-col justify-between h-full group hover:opacity-80 z-10" 
          style={{ backgroundColor: bgColor }}
        >
          <h3 className={`text-xl font-medium ${textColorClass}`}>{color.name}</h3>
          <div className={`flex gap-1 text-xs ${textColorClass}`}>
            <span className={`py-1 px-2 rounded-md ${textColorClass === "text-black" ? "bg-black/10" : "bg-white/10"}`}>{color.c}</span>
            <span className={`py-1 px-2 rounded-md ${textColorClass === "text-black" ? "bg-black/10" : "bg-white/10"}`}>{color.m}</span>
            <span className={`py-1 px-2 rounded-md ${textColorClass === "text-black" ? "bg-black/10" : "bg-white/10"}`}>{color.y}</span>
            <span className={`py-1 px-2 rounded-md ${textColorClass === "text-black" ? "bg-black/10" : "bg-white/10"}`}>{color.k}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}