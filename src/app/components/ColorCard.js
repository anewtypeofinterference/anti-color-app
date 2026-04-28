// src/app/components/ColorCard.jsx
"use client";
import Link from "next/link";
import { DotsThreeVertical } from "phosphor-react";
import { cmykToRgb, getTextColorForCmyk, rgbToColorString } from "../utils/ColorUtils";
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
  const textColorClass = getTextColorForCmyk(color.c, color.m, color.y, color.k);
  const bgColor = rgbToColorString(rgb);

  const menuItems = [
    {
      label: "Slett farge",
      onClick: () => setConfirmId(color.id),
    }
  ];

  const fmtDate = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  };

  const initials = (name) => {
    if (!name) return null;
    return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).join("").slice(0, 2);
  };

  const dimClass = textColorClass === "text-black" ? "text-black/30" : "text-white/30";
  const chipClass = textColorClass === "text-black" ? "bg-black/10" : "bg-white/15";

  return (
    <div className="relative group aspect-4/3">
      {/* Three-dot trigger */}
      <Button
        variant="rounded"
        startIcon={DotsThreeVertical}
        className={`absolute top-3! right-3! p-1! text-xs opacity-0! hover:bg-transparent! group-hover:opacity-100! transition-opacity! ${textColorClass === "text-black" ? "text-black" : "text-white!"}`}
        onClick={(e) => {
          e.stopPropagation();
          setConfirmId(null);
          onMenuToggle(color.id);
        }}
      />

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
          className="p-4 rounded-md cursor-pointer flex flex-col justify-between h-full group z-10"
          style={{ backgroundColor: bgColor }}
        >
          <div className="flex flex-col gap-3">
            <h3 className={`leading-none font-medium ${textColorClass}`}>{color.name}</h3>
            {(color.updatedAt) && (
              <div className={`flex flex-col gap-0.5 text-xs ${dimClass}`}>
                {color.updatedAt && color.updatedAt !== color.createdAt && (
                  <span className="flex items-center gap-1.5">
                    {color.updatedBy && (
                      <span className="relative group/chip">
                        <span className={`select-none text-xs`}>
                          Oppdatert {fmtDate(color.updatedAt)}
                        </span>
                        <span className="pointer-events-none absolute top-full left-0 mt-1.5 whitespace-nowrap rounded-sm px-1.5 py-1 text-xs bg-black text-white opacity-0 group-hover/chip:opacity-100 transition-opacity z-50">
                          {color.updatedBy}
                        </span>
                      </span>
                    )}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={`flex gap-1 text-xs font-mono select-none ${textColorClass}`}>
            <span className={`py-0.5 px-1.5 rounded-sm ${chipClass}`}>{color.c}</span>
            <span className={`py-0.5 px-1.5 rounded-sm ${chipClass}`}>{color.m}</span>
            <span className={`py-0.5 px-1.5 rounded-sm ${chipClass}`}>{color.y}</span>
            <span className={`py-0.5 px-1.5 rounded-sm ${chipClass}`}>{color.k}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}