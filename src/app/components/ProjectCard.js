// src/app/components/ProjectCard.jsx
import Link from "next/link";
import { ArrowRight, DotsThreeVertical } from "phosphor-react";
import Button from "./Button";
import Modal  from "./Modal";

export default function ProjectCard({
  project,
  menuOpen,
  onMenuToggle,
  confirmId,
  setConfirmId,
  onRename,
  onDelete,
}) {
  return (
    <div className="relative group aspect-[3/4]">
      {/* ...tre-punkt knapp */}
      <div className="absolute top-6 right-6">
        <Button
          variant="rounded"
          startIcon={DotsThreeVertical}
          className="!bg-black/0 hover:!bg-black/5"
          onClick={e => {
            e.stopPropagation();
            setConfirmId(null);
            onMenuToggle(project.id);
          }}
        />
      </div>

      {/* pop-over meny */}
      {menuOpen && (
        <div
          data-menu={project.id}
          className="absolute top-6 -right-40 w-48 bg-black rounded-xl z-20 p-2 text-sm"
          onClick={e => e.stopPropagation()}
        >
          <button
            className="rounded-md w-full px-4 py-3 text-white hover:bg-white/20 cursor-pointer flex"
            onClick={() => onRename(project)}
          >
            Endre prosjektnavn
          </button>
          <button
            className="rounded-md w-full px-4 py-3 text-white hover:bg-white/20 cursor-pointer flex"
            onClick={() => setConfirmId(project.id)}
          >
            Slett prosjekt
          </button>
        </div>
      )}

      {/* Slett-modal */}
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

      {/* selve kortet */}
      <Link href={`/${project.id}`} passHref>
        <div className="p-8 bg-black/5 rounded-2xl cursor-pointer flex flex-col justify-between h-full group">
          <div>
            <h3 className="text-2xl mb-2">{project.name}</h3>
            <p className="text-black/50 text-sm">
              {project.colors?.length ?? 0} farger
            </p>
          </div>
          <div className="absolute bottom-6 right-6">
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