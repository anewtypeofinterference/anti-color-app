"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import slugify from "slugify";
import { Plus } from "phosphor-react";

import { useSession, signOut } from "next-auth/react";

import Button       from "./components/Button";
import Input        from "./components/Input";
import Modal        from "./components/Modal";
import ProjectCard  from "./components/ProjectCard";
import EmptyState   from "./components/EmptyState";

const fetcher  = (url) => fetch(url).then((r) => r.json());
const makeSlug = (t) =>
  slugify(t, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });

export default function Home() {
  // you can still read your session if you like…
  const { data: session } = useSession();
  const router           = useRouter();
  const { data: projects = [], isLoading, mutate } = useSWR("/api/projects", fetcher);

  const [menuId, setMenuId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [renameModalId, setRenameModalId] = useState(null);
  const [renameName, setRenameName] = useState("");
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [toast, setToast] = useState("");

  // click‐outside to close pop‐over
  useEffect(() => {
    if (!menuId) return;
    function handleClick(e) {
      if (!(e.target instanceof Element) || !e.target.closest(`[data-menu="${menuId}"]`)) {
        setMenuId(null);
        setConfirmId(null);
      }
    }
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [menuId]);

  // 2) Now that all hooks are declared, handle loading states:
  if (status === "loading") {
    return <p className="p-10">Laster bruker…</p>;
  }
  if (isLoading) {
    return <div className="p-10">Laster prosjekt…</div>;
  }

  // 3) Helper to show a toast
  const pop = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // 4) CRUD callbacks
  const create = async () => {
    const name = newName.trim();
    if (!name) { pop("Navn er påkrevd"); return; }
    const id = makeSlug(name);
    if (projects.some((p) => p.id === id)) { pop("Finnes allerede"); return; }
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });
    if (!res.ok) { pop("Feil ved oppretting"); return; }
    mutate();
    setNewName("");
    setNewModalOpen(false);
    pop("Prosjekt opprettet");
  };

  const remove = async (id) => {
    if (!confirm("Slette prosjekt?")) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (!res.ok) { pop("Feil ved sletting"); return; }
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
    if ((newId !== renameModalId && projects.some((p) => p.id === newId)) || !newId) {
      pop("Ugyldig eller finnes allerede");
      return;
    }
    const res = await fetch(`/api/projects/${renameModalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: newId, name }),
    });
    const body = await res.json();
    if (!res.ok) { pop(body.error || "Feil ved omdøping"); return; }
    mutate();
    setRenameModalId(null);
    pop("Prosjekt omdøpt");
    if (body.newId) router.push(`/${body.newId}`);
  };

  const displayName = session.user.name || session.user.email;
  const initial = displayName.trim()[0].toUpperCase();

  // 5) Finally, the UI
  return (
    <div className="p-12 bg-black/5 min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-20">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl">Prosjekter</h1>
        </div>
        <div className="flex gap-3 items-center">
          {projects.length > 0 && (
            <Button variant="primary" startIcon={Plus} onClick={() => setNewModalOpen(true)}>
              Nytt prosjekt
            </Button>
          )}
          <Button
            variant="secondary"
            className="ml-9"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Logg ut
          </Button>
          <div className="select-none h-12 w-12 rounded-full bg-[#004D40] flex items-center justify-center text-white font-medium">
            {initial}
          </div>
        </div>
      </div>

      {/* Grid or empty state */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              menuOpen={menuId === p.id}
              onMenuToggle={setMenuId}
              confirmId={confirmId}
              setConfirmId={setConfirmId}
              onRename={() => openRename(p)}
              onDelete={() => remove(p.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Ingen prosjekter enda"
          description="Klikk knappen under for å lage ditt første prosjekt."
        >
          <Button variant="primary" startIcon={Plus} onClick={() => setNewModalOpen(true)}>
            Nytt prosjekt
          </Button>
        </EmptyState>
      )}

      {/* New-project Modal */}
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

      {/* Rename Modal */}
      {renameModalId && (
        <Modal
          title="Endre prosjektnavn"
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

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded">
          {toast}
        </div>
      )}
    </div>
  );
}