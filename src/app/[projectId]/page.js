// src/app/[projectId]/page.js
"use client";

import { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "phosphor-react";

import { useToast } from "../components/ToastContext";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import PageLoadError from "../components/PageLoadError";
import PageLoading from "../components/PageLoading";
import ResponsiveCardGrid from "../components/ResponsiveCardGrid";
import CmykInputs4 from "../components/CmykInputs4";
import CmykStripPreview from "../components/CmykStripPreview";
import ProjectColorGridItem from "../components/ProjectColorGridItem";
import { jsonFetcher } from "../lib/jsonFetcher";
import { makeProjectSlug } from "../lib/makeProjectSlug";
import {
  DEFAULT_PRINT_PROFILE_ID,
  PRINT_PROFILE_OPTIONS,
} from "../lib/cmykPrintProfiles";
import { sanitizeFilename } from "../lib/sanitizeFilename";
import Select from "../components/Select";

export default function ProjectPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { data: project, error, isLoading, mutate } = useSWR(
    `/api/projects/${projectId}`,
    jsonFetcher
  );
  const { showToast } = useToast();
  const { data: session } = useSession();

  const [open, setOpen] = useState(false);
  const [newColor, setNewColor] = useState({
    name: "",
    c: 0,
    m: 0,
    y: 0,
    k: 0,
  });
  const [colorMenuId, setColorMenuId] = useState(null);
  const [colorConfirmId, setColorConfirmId] = useState(null);

  const [markMode, setMarkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [printProfileId, setPrintProfileId] = useState(DEFAULT_PRINT_PROFILE_ID);

  const newColorChange = (e) => {
    const { name, value } = e.target;
    setNewColor((d) => ({
      ...d,
      [name]: ["c", "m", "y", "k"].includes(name) ? +value : value,
    }));
  };

  const createColor = async () => {
    const nm = newColor.name.trim();
    if (!nm) {
      showToast("Navn mangler");
      return;
    }
    const id = makeProjectSlug(nm);
    if ((project?.colors || []).some((c) => c.id === id)) {
      showToast("Finnes allerede");
      return;
    }
    const res = await fetch(`/api/projects/${projectId}/colors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name: nm,
        c: newColor.c,
        m: newColor.m,
        y: newColor.y,
        k: newColor.k,
        createdBy: session?.user?.name ?? null,
      }),
    });
    if (!res.ok) {
      showToast("Feil ved oppretting");
      return;
    }
    mutate();
    setOpen(false);
    setNewColor({ name: "", c: 0, m: 0, y: 0, k: 0 });
    showToast("Farge lagt til");
  };

  const deleteColor = async (cid) => {
    if (!confirm("Slette farge?")) return;
    const res = await fetch(`/api/projects/${projectId}/colors/${cid}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      showToast("Feil ved sletting");
      return;
    }
    mutate();
    showToast("Farge slettet");
    setSelectedIds((s) => {
      const ns = new Set(s);
      ns.delete(cid);
      return ns;
    });
  };

  const handleGeneratePDF = async () => {
    const all = project.colors || [];
    const toPrint = selectedIds.size
      ? all.filter((c) => selectedIds.has(c.id))
      : all;
    if (!toPrint.length) {
      showToast("Ingen farger valgt for utskrift");
      return;
    }
    const res = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        colors: toPrint,
        projectName: project.name,
        printProfileId,
      }),
    });
    if (!res.ok) {
      showToast("PDF-generering feilet");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const profile = PRINT_PROFILE_OPTIONS.find((p) => p.id === printProfileId);
    const slug = profile?.downloadSlug ?? "coated";
    a.download = `${sanitizeFilename(project.name)}-CMYK-${slug}.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    setMarkMode(false);
    setSelectedIds(new Set());
  };

  if (error) return <PageLoadError />;
  if (isLoading) return <PageLoading className="bg-white" />;

  const colors = [...(project.colors || [])].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const anySelected = selectedIds.size > 0;

  return (
    <div className="min-h-screen bg-white">
      <PageHeader bg="bg-white" className="relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 select-none">
            <Button variant="rounded" startIcon={ArrowLeft} onClick={() => router.push("/")} />
            <h1 className="font-semibold">Prosjekt</h1>
            <div className="text-zinc-500">{project.name}</div>
          </div>
          {markMode && (
            <span className="absolute left-1/2 -translate-x-1/2 font-medium">
              Marker farger for utskrift
            </span>
          )}
          <div className="flex flex-wrap items-center justify-end gap-3 md:gap-4">
            {colors.length > 0 && !markMode && (
              <Button variant="secondary" onClick={() => setMarkMode(true)}>
                Marker for utskrift
              </Button>
            )}
            <Button variant="primary" startIcon={Plus} onClick={() => setOpen(true)}>
              Ny farge
            </Button>
          </div>
        </div>
      </PageHeader>

            {markMode ? (
              <div className="fixed bottom-8 p-4 rounded-md left-1/2 -translate-x-1/2 bg-zinc-100 flex items-center justify-end gap-16">
                <label className="flex items-center gap-2 text-black bg-white py-2 px-3 rounded-md">
                  <span className="text-black/50">Trykkprofil</span>
                  <Select
                    value={printProfileId}
                    onChange={(e) => setPrintProfileId(e.target.value)}
                    options={PRINT_PROFILE_OPTIONS.map((p) => ({
                      value: p.id,
                      label: p.label,
                    }))}
                    className="text-base! py-0! px-0!"
                  />
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="primary"
                    onClick={handleGeneratePDF}
                    disabled={!anySelected}
                  >
                      Print{anySelected && ` (${selectedIds.size})`}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setMarkMode(false);
                      setSelectedIds(new Set());
                    }}
                  >
                    Avbryt
                  </Button>
                </div>
              </div>
            ) : (
              <>
              </>
            )}

      <main className="p-8">
        {colors.length ? (
          <ResponsiveCardGrid>
            {colors.map((c, i) => (
              <ProjectColorGridItem
                key={`${c.id}-${i}`}
                color={c}
                projectId={projectId}
                markMode={markMode}
                isSelected={selectedIds.has(c.id)}
                onToggleSelect={() => {
                  setSelectedIds((s) => {
                    const ns = new Set(s);
                    if (selectedIds.has(c.id)) ns.delete(c.id);
                    else ns.add(c.id);
                    return ns;
                  });
                }}
                colorMenuId={colorMenuId}
                onMenuToggle={setColorMenuId}
                colorConfirmId={colorConfirmId}
                setConfirmId={setColorConfirmId}
                onDelete={deleteColor}
              />
            ))}
            {!markMode && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="aspect-4/3 rounded-md border border-zinc-200 bg-transparent flex items-center justify-center gap-2 text-black hover:border-zinc-300 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <Plus size={15} weight="bold" />
                <span className="font-medium">Ny farge</span>
              </button>
            )}
          </ResponsiveCardGrid>
        ) : (
          <EmptyState
            title="Ingen farger enda"
            description="Legg til din første farge for dette prosjektet"
          >
            <Button variant="primary" startIcon={Plus} onClick={() => setOpen(true)}>
              Ny farge
            </Button>
          </EmptyState>
        )}

        {open && (
          <Modal
            title="Ny farge"
            description="Gi fargen et kort navn og angi CMYK-verdiene."
            onCancel={() => setOpen(false)}
            onConfirm={createColor}
            cancelLabel="Avbryt"
            confirmLabel="Opprett"
            confirmDisabled={!newColor.name.trim()}
            width="w-full max-w-lg"
          >
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <Input
                  name="name"
                  placeholder="Navn"
                  value={newColor.name}
                  onChange={newColorChange}
                  className="bg-black/5! hover:bg-black/10!"
                />
                <CmykInputs4 value={newColor} onChange={newColorChange} />
              </div>
              <CmykStripPreview
                c={newColor.c}
                m={newColor.m}
                y={newColor.y}
                k={newColor.k}
              />
            </div>
          </Modal>
        )}
      </main>
    </div>
  );
}
