"use client";

import ColorCard from "./ColorCard";
import { getTextColorForCmyk } from "../utils/ColorUtils";

export default function ProjectColorGridItem({
  color,
  projectId,
  markMode,
  isSelected,
  onToggleSelect,
  colorMenuId,
  onMenuToggle,
  colorConfirmId,
  setConfirmId,
  onDelete,
}) {
  const light = getTextColorForCmyk(color.c, color.m, color.y, color.k) === "text-black";

  return (
    <div className="relative">
      {markMode && (
        <div
          className="absolute inset-0 z-20 cursor-pointer rounded-md"
          onClick={onToggleSelect}
        />
      )}

      <div className={markMode ? "pointer-events-none" : ""}>
        <ColorCard
          color={color}
          projectId={projectId}
          menuOpen={colorMenuId === color.id}
          onMenuToggle={onMenuToggle}
          confirmId={colorConfirmId}
          setConfirmId={setConfirmId}
          onDelete={onDelete}
        />
      </div>

      {markMode && (
        <div
          className={`pointer-events-none absolute bottom-4 right-4 w-5 h-5 z-40 rounded-sm ${
            light ? "bg-black" : "bg-white"
          }`}
        />
      )}

      {markMode && isSelected && (
        <div className="absolute inset-0 rounded-md bg-white/50 pointer-events-none">
          <div
            className={`absolute bottom-5.5 right-5.5 w-2 h-2 rounded-full z-70 pointer-events-none ${
              light ? "bg-white" : "bg-black"
            }`}
          />
        </div>
      )}
    </div>
  );
}
