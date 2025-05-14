// src/app/[projectId]/page.js
"use client";
import { useState } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import slugify from "slugify";
import { ArrowLeft, Plus } from "phosphor-react";
import { generatePDF } from "../utils/pdfUtils";

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

  // Determine if user has entered any non-zero value
  const total = C + M + Y + K;
  const useStyle = total > 0;

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
  };

  const handleGeneratePDF = async () => {
    if (!project?.colors) return;
    try {
      const pdfBytes = await generatePDF(project.colors);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project.name}-trykkfarger.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Kunne ikke generere PDF:", err);
    }
  };

  function cmykToRgbString(c, m, y, k) {
    const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
    const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
    const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
    return `rgb(${r}, ${g}, ${b})`;
  }

  if (error) return <div className="p-10 text-red-600">Feil ved lasting</div>;
  if (isLoading) return <div className="p-10">Laster…</div>;

  const colors = Array.isArray(project.colors) ? project.colors : [];

  return (
    <div className="p-12 bg-white min-h-screen">
      <div className="flex items-center gap-10 mb-20">
        <Button
          variant="rounded"
          startIcon={ArrowLeft}
          onClick={() => history.back()}
        />
        <h1 className="text-3xl flex-1">{project.name}</h1>
        <div className="flex gap-3">
          {colors.length > 0 && (
            <Button variant="secondary" onClick={handleGeneratePDF}>
              Generer PDF
            </Button>
          )}
          <Button
            variant="primary"
            startIcon={Plus}
            onClick={() => setOpen(true)}
          >
            Ny farge
          </Button>
        </div>
      </div>

      {colors.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6">
          {colors.map((c) => (
            <ColorCard
              key={c.id}
              color={c}
              projectId={projectId}
              menuOpen={colorMenuId === c.id}
              onMenuToggle={setColorMenuId}
              confirmId={colorConfirmId}
              setConfirmId={setColorConfirmId}
              onDelete={deleteColor}
            />
          ))}
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
            {/* Name */}
            <Input
              placeholder="Navn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="placeholder:text-black/30 focus:outline-none"
            />
              {/* CMYK inputs */}
              <div className="flex-1 flex gap-3">
                <GlyphInput
                  glyph="C"
                  type="number"
                  min={0}
                  max={100}
                  value={C}
                  onChange={(e) => setC(+e.target.value)}
                />
                <GlyphInput
                  glyph="M"
                  type="number"
                  min={0}
                  max={100}
                  value={M}
                  onChange={(e) => setM(+e.target.value)}
                />
                <GlyphInput
                  glyph="Y"
                  type="number"
                  min={0}
                  max={100}
                  value={Y}
                  onChange={(e) => setY(+e.target.value)}
                />
                <GlyphInput
                  glyph="K"
                  type="number"
                  min={0}
                  max={100}
                  value={K}
                  onChange={(e) => setK(+e.target.value)}
                />
              </div>
              {/* Live preview swatch */}
              <div
                className="w-full aspect-[16/6] rounded-xl bg-black/3"
                style={
                  useStyle
                    ? { backgroundColor: cmykToRgbString(C, M, Y, K) }
                    : undefined
                }
              />
          </div>
        </Modal>
      )}

      <Toast msg={toast} />
    </div>
  );
}
