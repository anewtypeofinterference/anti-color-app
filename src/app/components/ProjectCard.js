// src/app/components/ProjectCard.jsx
"use client";
import Link from "next/link";
import { ArrowRight, DotsThreeVertical } from "phosphor-react";
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
    <div className="relative group aspect-[3/4]">
      {/* three-dot trigger */}
      <div className="absolute top-7 right-7 z-10">
        <Button
          variant="rounded"
          startIcon={DotsThreeVertical}
          className="!bg-black/0 hover:!bg-black/5"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmId(null);
            onMenuToggle(menuOpen ? null : project.id);
          }}
        />
      </div>

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
        onConfirm={() => onDelete(project.id)}
        title="Slett prosjekt"
        description="Er du sikker på at du vil slette prosjektet? Dette kan ikke angres."
        confirmLabel="Slett"
        cancelLabel="Avbryt"
        variant="danger"
      />

      {/* the card */}
      <Link href={`/${project.id}`} passHref>
        <Card hover className="h-full justify-between">
          <div>
            <Card.Title>{project.name}</Card.Title>

            {/* color preview row */}
            {colors.length > 0 && (
              <div className="flex gap-2">
                {colors.slice(0, 5).map((c) => {
                  const rgb = cmykToRgb(c.c, c.m, c.y, c.k);
                  const bgColor = rgbToColorString(rgb);
                  return (
                    <div
                      key={c.id}
                      className="w-9 aspect-[4/3] rounded-md"
                      style={{ backgroundColor: bgColor }}
                    />
                  );
                })}
                {colors.length > 5 && (
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-black/20 flex items-center justify-center text-xs text-black/60">
                    +{colors.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* arrow button */}
          <div className="absolute bottom-7 right-7">
            <Button
              variant="rounded"
              startIcon={ArrowRight}
              className="group-hover:!bg-black/5"
            />
          </div>
        </Card>
      </Link>
    </div>
  );
}