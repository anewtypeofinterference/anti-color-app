// src/app/components/ProjectCard.jsx
import Link from "next/link";
import { ArrowRight, DotsThreeVertical } from "phosphor-react";
import Button from "./Button";
import Modal  from "./Modal";
import Popover from "./Popover";

// simple CMYK → RGB converter
function cmykToRgb(c, m, y, k) {
  return {
    r: Math.round(255 * (1 - c / 100) * (1 - k / 100)),
    g: Math.round(255 * (1 - m / 100) * (1 - k / 100)),
    b: Math.round(255 * (1 - y / 100) * (1 - k / 100)),
  };
}

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

  return (
    <div className="relative group aspect-[3/4]">
      {/* three-dot trigger */}
      <div className="absolute top-7 right-7">
        <Button
          variant="rounded"
          startIcon={DotsThreeVertical}
          className="z-10 !bg-black/0 hover:!bg-black/5"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmId(null);
            onMenuToggle(menuOpen ? null : project.id);
          }}
        />
      </div>

      {/* pop-over menu */}
      <Popover
        open={menuOpen}
        onClose={() => onMenuToggle(null)}
        anchorId={project.id}
      >
        <button
          className="w-full text-left px-4 py-3 text-white hover:bg-white/20 rounded-md cursor-pointer font-medium"
          onClick={() => {
            onRename(project);
            onMenuToggle(null);
          }}
        >
          Endre prosjektnavn
        </button>
        <button
          className="w-full text-left px-4 py-3 text-white hover:bg-white/20 rounded-md cursor-pointer font-medium"
          onClick={() => setConfirmId(project.id)}
        >
          Slett prosjekt
        </button>
      </Popover>

      {/* delete confirmation modal */}
      {confirmId === project.id && (
        <Modal
          title="Slett prosjekt"
          description="Er du sikker på at du vil slette prosjektet? Dette kan ikke angres."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            onDelete(project.id);
            setConfirmId(null);
          }}
          confirmLabel="Slett"
          cancelLabel="Avbryt"
        />
      )}

      {/* the card */}
      <Link href={`/${project.id}`} passHref>
        <div className="p-9 bg-white rounded-2xl cursor-pointer flex flex-col justify-between h-full group">
          <div>
            <h3 className="text-2xl mb-9">{project.name}</h3>

            {/* color preview row */}
            {colors.length > 0 && (
              <div className="flex gap-1">
                {colors.slice(0, 5).map((c) => {
                  const { r, g, b } = cmykToRgb(c.c, c.m, c.y, c.k);
                  return (
                    <div
                      key={c.id}
                      className="w-4 h-4 rounded-md"
                      style={{ backgroundColor: `rgb(${r},${g},${b})` }}
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
        </div>
      </Link>
    </div>
  );
}