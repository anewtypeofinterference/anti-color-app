// src/app/[projectId]/page.js
"use client";

import { useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import slugify from "slugify";
import { ArrowLeft, Plus } from "phosphor-react";

import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import ColorCard from "../components/ColorCard";
import Toast from "../components/Toast";
import EmptyState from "../components/EmptyState";
import GlyphInput from "../components/GlyphInput";

const fetcher = (url) => fetch(url).then((r) => r.json());
const makeSlug = (t) =>
  slugify(t, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });

export default function ProjectPage() {
  const { projectId } = useParams();
  const { data: project, error, isLoading, mutate } =
    useSWR(`/api/projects/${projectId}`, fetcher);

  const [toast, setToast] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [C, setC] = useState(0);
  const [M, setM] = useState(0);
  const [Y, setY] = useState(0);
  const [K, setK] = useState(0);
  const [colorMenuId, setColorMenuId] = useState(null);
  const [colorConfirmId, setColorConfirmId] = useState(null);

  // mark‐for‐print state
  const [markMode, setMarkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const pop = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const createColor = async () => {
    const nm = name.trim();
    if (!nm) return pop("Navn mangler");
    const id = makeSlug(nm);
    if ((project.colors || []).some((c) => c.id === id)) return pop("Finnes allerede");
    const res = await fetch(`/api/projects/${projectId}/colors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: nm, c: C, m: M, y: Y, k: K }),
    });
    if (!res.ok) return pop("Feil ved oppretting");
    mutate();
    setOpen(false);
    setName("");
    setC(0);
    setM(0);
    setY(0);
    setK(0);
    pop("Farge lagt til");
  };

  const deleteColor = async (cid) => {
    if (!confirm("Slette farge?")) return;
    const res = await fetch(`/api/projects/${projectId}/colors/${cid}`, {
      method: "DELETE",
    });
    if (!res.ok) return pop("Feil ved sletting");
    mutate();
    pop("Farge slettet");
    // also clear from selection
    setSelectedIds((s) => {
      const ns = new Set(s);
      ns.delete(cid);
      return ns;
    });
  };

  function cmykToRgbString(c, m, y, k) {
    const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
    const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
    const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
    return `rgb(${r}, ${g}, ${b})`;
  }

  const handleGeneratePDF = async () => {
    const all = project.colors || [];
    const toPrint = Array.from(selectedIds).length
      ? all.filter((c) => selectedIds.has(c.id))
      : all;
    if (!toPrint.length) {
      pop("Ingen farger valgt for utskrift");
      return;
    }
    const res = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colors: toPrint, projectName: project.name }),
    });
    if (!res.ok) {
      pop("PDF-generering feilet");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name}-CMYK.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    // reset mark mode
    setMarkMode(false);
    setSelectedIds(new Set());
  };

  function isLightCmyk(c, m, y, k) {
    const L =
      0.299 * (1 - c / 100) * (1 - k / 100) +
      0.587 * (1 - m / 100) * (1 - k / 100) +
      0.114 * (1 - y / 100) * (1 - k / 100);
    return L > 0.5;
  }

  if (error) return <div className="p-10 text-red-600">Feil ved lasting</div>;
  if (isLoading) return <div className="p-10">Laster…</div>;

  const colors = project.colors || [];
  const anySelected = selectedIds.size > 0;

  return (
    <div className="p-12 bg-white min-h-screen">
      {/* Header */}
      <div className="flex justify-end items-center mb-20">
        {markMode ? (
          <div className="flex items-center gap-10 flex-1">
            <h1 className="text-3xl">Marker farger for utskrift</h1>
          </div>
        ) : (
          <div className="flex items-center gap-10 flex-1">
            <Button variant="rounded" startIcon={ArrowLeft} onClick={() => history.back()} />
            <h1 className="text-3xl">{project.name}</h1>
          </div>
        )}
        <div className="flex gap-3">
          {markMode ? (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setMarkMode(false);
                  setSelectedIds(new Set());
                }}
              >
                Avbryt
              </Button>
              <Button
                variant="primary"
                onClick={handleGeneratePDF}
                disabled={!anySelected}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Print{anySelected && ` (${selectedIds.size})`}
              </Button>
            </>
          ) : (
            <>
              {colors.length > 0 && (
                <Button variant="secondary" onClick={() => setMarkMode(true)}>
                  Marker for utskrift
                </Button>
              )}
              <Button variant="primary" startIcon={Plus} onClick={() => setOpen(true)}>
                Ny farge
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Color Grid */}
      {colors.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
          {colors.map((c) => {
            const isSel = selectedIds.has(c.id);
            return (
              <div key={c.id} className="relative">
                {/* overlay to capture clicks when marking */}
                {markMode && (
                  <div
                    className="absolute inset-0 z-20 cursor-pointer rounded-xl"
                    onClick={() => {
                      setSelectedIds((s) => {
                        const ns = new Set(s);
                        isSel ? ns.delete(c.id) : ns.add(c.id);
                        return ns;
                      });
                    }}
                  />
                )}

                {/* the actual card, disable its own interactions in markMode */}
                <div className={markMode ? "pointer-events-none" : ""}>
                  <ColorCard
                    color={c}
                    projectId={projectId}
                    menuOpen={colorMenuId === c.id}
                    onMenuToggle={setColorMenuId}
                    confirmId={colorConfirmId}
                    setConfirmId={setColorConfirmId}
                    onDelete={deleteColor}
                  />
                </div>

                {markMode && (
                  <div className={`pointer-events-none absolute bottom-9 right-9 w-6 h-6 z-40 rounded-lg ${isLightCmyk(c.c, c.m, c.y, c.k) ? 'bg-black' : 'bg-white'}`} />
                )}

                {/* visual highlight for selected */}
                {markMode && isSel && (
                  <div
                    className={`
                      absolute inset-0
                      rounded-2xl
                      bg-white/20
                      pointer-events-none 
                    `}
                  >
                    <div
                      className={`
                        absolute bottom-11 right-11
                        w-2 h-2 rounded-full z-70 pointer-events-none
                        ${isLightCmyk(c.c, c.m, c.y, c.k) ? 'bg-white' : 'bg-black'}
                      `}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
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

      {/* New‐color modal */}
      {open && (
        <Modal
          title="Ny farge"
          description="Gi fargen et kort navn og angi CMYK-verdiene."
          onCancel={() => setOpen(false)}
          onConfirm={createColor}
          cancelLabel="Avbryt"
          confirmLabel="Opprett"
          confirmDisabled={!name.trim()}
          width="w-160"
        >
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Navn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="placeholder:text-black/30 focus:outline-none"
            />
            <div className="flex gap-3">
              <GlyphInput glyph="C" type="number" min={0} max={100} value={C} onChange={(e) => setC(+e.target.value)} />
              <GlyphInput glyph="M" type="number" min={0} max={100} value={M} onChange={(e) => setM(+e.target.value)} />
              <GlyphInput glyph="Y" type="number" min={0} max={100} value={Y} onChange={(e) => setY(+e.target.value)} />
              <GlyphInput glyph="K" type="number" min={0} max={100} value={K} onChange={(e) => setK(+e.target.value)} />
            </div>
            <div
              className="w-full aspect-[16/6] rounded-xl bg-black/3"
              style={C + M + Y + K > 0 ? { backgroundColor: cmykToRgbString(C, M, Y, K) } : undefined}
            />
          </div>
        </Modal>
      )}

      <Toast msg={toast} />
    </div>
  );
}