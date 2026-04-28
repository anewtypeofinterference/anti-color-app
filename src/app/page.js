"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Plus, MagnifyingGlass, X } from "phosphor-react";

import { useSession, signOut } from "next-auth/react";
import { useToast } from "./components/ToastContext";

import Button from "./components/Button";
import Input from "./components/Input";
import Modal from "./components/Modal";
import ProjectCard from "./components/ProjectCard";
import EmptyState from "./components/EmptyState";
import PageHeader from "./components/PageHeader";
import PageLoading from "./components/PageLoading";
import ResponsiveCardGrid from "./components/ResponsiveCardGrid";
import { jsonFetcher } from "./lib/jsonFetcher";
import { makeProjectSlug } from "./lib/makeProjectSlug";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: projects = [], isLoading, mutate } = useSWR("/api/projects", jsonFetcher);
  const { showToast } = useToast();

  const [menuId, setMenuId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [renameModalId, setRenameModalId] = useState(null);
  const [renameName, setRenameName] = useState("");
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [search, setSearch] = useState("");

  if (status === "loading" || isLoading) {
    return <PageLoading />;
  }

  const create = async () => {
    const name = newName.trim();
    if (!name) {
      showToast("Navn er påkrevd");
      return;
    }
    const id = makeProjectSlug(name);
    if (projects.some((p) => p.id === id)) {
      showToast("Finnes allerede");
      return;
    }
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name }),
    });
    if (!res.ok) {
      showToast("Feil ved oppretting");
      return;
    }
    mutate();
    setNewName("");
    setNewModalOpen(false);
    showToast("Prosjekt opprettet");
  };

  const remove = async (id) => {
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("Feil ved sletting");
      return;
    }
    mutate();
    showToast("Prosjekt slettet");
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
    if (!name) {
      showToast("Navn er påkrevd");
      return;
    }
    const newId = makeProjectSlug(name);
    if ((newId !== renameModalId && projects.some((p) => p.id === newId)) || !newId) {
      showToast("Ugyldig eller finnes allerede");
      return;
    }
    const res = await fetch(`/api/projects/${renameModalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: newId, name }),
    });
    const body = await res.json();
    if (!res.ok) {
      showToast(body.error || "Feil ved omdøping");
      return;
    }
    mutate();
    setRenameModalId(null);
    showToast("Prosjekt omdøpt");
    if (body.newId) router.push(`/${body.newId}`);
  };

  const displayName = session?.user?.name || session?.user?.email || "";
  const initial = displayName.trim()[0]?.toUpperCase() ?? "?";

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-100">
      <PageHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 select-none shrink-0">
            <h1 className="font-semibold">ANTI Fargeverktøy</h1>
            <div className="text-zinc-500">Prosjekter</div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center">
            {projects.length > 0 && (
              <div className="relative lg:w-80 xl:w-100 2xl:w-120">
                <MagnifyingGlass
                  weight="bold"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Søk etter prosjekt"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex w-full pl-9 pr-3 py-2 rounded-sm bg-white outline-none placeholder:text-zinc-400 transition-all! duration-200!"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black transition-colors cursor-pointer"
                  >
                    <X size={16} weight="bold" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            {projects.length > 0 && (
              <Button variant="primary" startIcon={Plus} onClick={() => setNewModalOpen(true)}>
                Nytt prosjekt
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Logg ut
              </Button>
              <div className="hidden select-none h-10 w-10 rounded-full bg-[#004D40] lg:flex items-center justify-center text-white text-xs font-bold">
                {initial}
              </div>
            </div>
          </div>
        </div>
      </PageHeader>

      <main className="p-8 relative">
        {projects.length === 0 ? (
          <EmptyState
            title="Ingen prosjekter enda"
            description="Klikk knappen under for å lage ditt første prosjekt."
          >
            <Button variant="primary" startIcon={Plus} onClick={() => setNewModalOpen(true)}>
              Nytt prosjekt
            </Button>
          </EmptyState>
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            title="Ingen treff"
            description={`Fant ingen prosjekter som matcher «${search}».`}
          />
        ) : (
          <ResponsiveCardGrid>
            {filteredProjects.map((p) => (
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
          </ResponsiveCardGrid>
        )}
      </main>

      {newModalOpen && (
        <Modal
          title="Opprett nytt prosjekt"
          description="Gi prosjektet ditt et kort og beskrivende navn."
          onCancel={() => {
            setNewModalOpen(false);
            setNewName("");
          }}
          onConfirm={create}
          confirmLabel="Opprett"
          cancelLabel="Avbryt"
          confirmDisabled={!newName.trim()}
        >
          <Input
            autoFocus
            placeholder="Prosjektnavn"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newName.trim() && create()}
                  className="bg-black/5! hover:bg-black/10!"
          />
        </Modal>
      )}

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
            autoFocus
            placeholder="Nytt navn"
            value={renameName}
            onChange={(e) => setRenameName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && renameName.trim() && renameProject()}
                  className="bg-black/5! hover:bg-black/10!"
          />
        </Modal>
      )}
    </div>
  );
}
