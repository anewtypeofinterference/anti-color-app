"use client";
import { useRouter } from "next/navigation";
import { DotsThreeVertical } from "phosphor-react";
import { cmykToRgb, rgbToColorString } from "../utils/ColorUtils";
import Button from "./Button";
import Card from "./Card";
import PopoverMenu from "./PopoverMenu";
import ConfirmationDialog from "./ConfirmationDialog";

export default function ProjectCard({
  project,
  menuOpen,
  onMenuToggle,
  confirmId,
  setConfirmId,
  onRename,
  onDelete,
}) {
  const router = useRouter();
  const colors = project.colors || [];
  
  const menuItems = [
    {
      label: "Endre prosjektnavn",
      onClick: () => onRename(project),
    },
    {
      label: "Slett prosjekt",
      onClick: () => setConfirmId(project.id),
    },
  ];

  return (
    <div className="relative group aspect-square">
      {/* pop-over menu */}
      <PopoverMenu
        open={menuOpen}
        onClose={() => onMenuToggle(null)}
        anchorId={project.id}
        menuItems={menuItems}
      />

      {/* delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={confirmId === project.id}
        onClose={() => setConfirmId(null)}
        onConfirm={onDelete}
        title="Slett prosjekt"
        description="Er du sikker på at du vil slette prosjektet? Dette kan ikke angres."
        confirmLabel="Slett"
        cancelLabel="Avbryt"
        variant="danger"
      />

      {/* the card */}
      <Card hover className="h-full cursor-pointer" onClick={() => router.push(`/${project.id}`)}>
            <Card.Title>{project.name}</Card.Title>
            <Button
              variant="rounded"
              startIcon={DotsThreeVertical}
              className="absolute top-3! right-3! p-1! text-xs opacity-0! group-hover:opacity-100! transition-opacity!"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmId(null);
                onMenuToggle(menuOpen ? null : project.id);
              }}
            />

          {colors.length > 0 && (
            <div className="flex flex-col">
              <div className="flex flex-wrap gap-1 mr-10">
                {colors.map((c, i) => {
                  const rgb = cmykToRgb(c.c, c.m, c.y, c.k);
                  const bgColor = rgbToColorString(rgb);
                  return (
                    <div
                      key={`${c.id}-${i}`}
                      className="w-4 aspect-square rounded-full"
                      style={{ backgroundColor: bgColor }}
                    />
                  );
                })}
              </div>
              <span className="absolute bottom-4.5 left-4 select-none text-xs text-zinc-400">
                {colors.length} {colors.length === 1 ? "farge" : "farger"}
              </span>
            </div>
          )}
        </Card>
    </div>
  );
}