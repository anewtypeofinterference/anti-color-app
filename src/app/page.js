"use client";
import { useState, useEffect } from "react";
import useSWR                   from "swr";
import { useRouter }            from "next/navigation";
import slugify                  from "slugify";
import { Plus }                 from "phosphor-react";

import Button       from "./components/Button";
import Input        from "./components/Input";
import Modal        from "./components/Modal";
import ProjectCard  from "./components/ProjectCard";
import EmptyState   from "./components/EmptyState";
import Toast        from "./components/Toast";

const fetcher  = (url) => fetch(url).then((r) => r.json());
const makeSlug = (t) =>
  slugify(t, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });

export default function Home() {
  const router = useRouter();
  const { data: projects = [], mutate } = useSWR("/api/projects", fetcher);

  const [menuId,        setMenuId]        = useState(null);
  const [confirmId,     setConfirmId]     = useState(null);
  const [renameModalId, setRenameModalId] = useState(null);
  const [renameName,    setRenameName]    = useState("");
  const [newModalOpen,  setNewModalOpen]  = useState(false);
  const [newName,       setNewName]       = useState("");
  const [toast, setToast]             = useState("");
  const pop = msg => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  useEffect(() => {
    if (!menuId) return;
    const onClick = (e) => {
      if (!e.target.closest(`[data-menu="${menuId}"]`)) {
        setMenuId(null);
        setConfirmId(null);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [menuId]);

  const create = async () => {
    const name = newName.trim();
    if (!name) return pop("Navn er påkrevd");
    const id = makeSlug(name);
    if (projects.some((p) => p.id === id)) return pop("Finnes allerede");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });
    if (!res.ok) return pop("Feil ved oppretting");
    mutate();
    setNewName("");
    setNewModalOpen(false);
    pop("Prosjekt opprettet");
  };

  const remove = async (id) => {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (!res.ok) return pop("Feil ved sletting");
    mutate();
    pop("Prosjekt slettet");
    setMenuId(null);
    setConfirmId(null);
  };

  const openRename = (p) => {
    setRenameModalId(p.id);
    setRenameName(p.name);
    setMenuId(null);
    setConfirmId(null);
  };
  const renameProject = async () => {
    const name = renameName.trim();
    if (!name) { pop("Navn er påkrevd"); return; }
    const newId = makeSlug(name);
    if ((newId!==renameModalId && projects.some(p=>p.id===newId))||!newId) {
      return pop("Ugyldig eller finnes allerede");
    }
    const res = await fetch(`/api/projects/${renameModalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: newId, name }),
    });
    const body = await res.json();
    if (!res.ok) { pop(body.error||"Feil ved omdøping"); return; }
    mutate();
    setRenameModalId(null);
    pop("Prosjekt omdøpt");
    if (body.newId) router.push(`/${body.newId}`);
  };

  return (
    <div className="p-12">
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-2xl">Prosjekter</h1>
        {projects.length > 0 && (
          <Button
            variant="primary"
            startIcon={Plus}
            onClick={() => setNewModalOpen(true)}
          >
            Nytt prosjekt
          </Button>
        )}
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              menuOpen={menuId === p.id}
              onMenuToggle={setMenuId}
              confirmId={confirmId}
              setConfirmId={setConfirmId}
              onRename={openRename}
              onDelete={remove}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Ingen prosjekter enda"
          description="Klikk knappen under for å lage ditt første prosjekt."
        >
          <Button
            variant="primary"
            startIcon={Plus}
            onClick={() => setNewModalOpen(true)}
          >
            Nytt prosjekt
          </Button>
        </EmptyState>
      )}

      {newModalOpen && (
        <Modal
          title="Opprett nytt prosjekt"
          description="Gi prosjektet ditt et kort og beskrivende navn."
          onCancel={() => setNewModalOpen(false)}
          onConfirm={create}
          confirmLabel="Opprett"
          cancelLabel="Avbryt"
          confirmDisabled={!newName.trim()}
        >
          <Input
            placeholder="Prosjektnavn"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </Modal>
      )}

      {renameModalId && (
        <Modal
          title="Endre projektnavn"
          onCancel={() => setRenameModalId(null)}
          onConfirm={renameProject}
          confirmLabel="Lagre"
          cancelLabel="Avbryt"
          confirmDisabled={!renameName.trim()}
        >
          <Input
            placeholder="Nytt navn"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
          />
        </Modal>
      )}

      <Toast message={toast} />
    </div>
  );
}