// src/app/[projectId]/[colorId]/page.js
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Trash, Plus } from "phosphor-react";

import ColorSwatchSteps from "../../components/ColorSwatchSteps";
import Button from "../../components/Button";
import Input from "../../components/Input";
import GlyphInput from "../../components/GlyphInput";
import Toast from "../../components/Toast";
import Select from "../../components/Select";

// ─── Helpers ─────────────────────────────────────────────────────────────
const fetcher = url => fetch(url).then(r => r.json());
const blankStep = axis => ({
  axis,
  varyChannel: "Y",
  stepInterval: 5,
  numMinusSteps: 0,
  numPlusSteps: 0,
});
const isEmpty = s => !s || (s.numMinusSteps === 0 && s.numPlusSteps === 0);
const axisName = a => (a === "X" ? "Horisontal" : "Vertikal");

function cmykToRgb(c, m, y, k) {
  return {
    r: Math.round(255 * (1 - c / 100) * (1 - k / 100)),
    g: Math.round(255 * (1 - m / 100) * (1 - k / 100)),
    b: Math.round(255 * (1 - y / 100) * (1 - k / 100)),
  };
}
function txtColor({ r, g, b }) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5 ? "text-black" : "text-white";
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ColorPage() {
  const { projectId, colorId } = useParams();
  const router = useRouter();

  const { data: project, error, isLoading } =
    useSWR(`/api/projects/${projectId}`, fetcher);

  const [base, setBase] = useState(null);
  const [steps, setSteps] = useState({});
  const [modal, setModal] = useState(blankStep("X"));
  const [show, setShow] = useState(false);
  const [toast, setToast] = useState("");

  // Load the color
  useEffect(() => {
    if (!project) return;
    const c = project.colors?.find(c => c.id === colorId);
    if (!c) {
      setToast("Farge ikke funnet");
      return;
    }
    setBase({ name: c.name, c: c.c, m: c.m, y: c.y, k: c.k });
    setSteps(c.stepConfigs || {});
  }, [project, colorId]);

  // Auto-clear toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (error) return <div className="p-10 text-red-600">Feil ved lasting</div>;
  if (isLoading || !base) return <div className="p-10">Laster…</div>;

  // Contrast + preview steps
  const { r, g, b } = cmykToRgb(base.c, base.m, base.y, base.k);
  const tc = txtColor({ r, g, b });

  let preview = [];
  if (show) {
    // when editing, show only the *other* saved axis + the live modal
    if (modal.axis === "X" && steps.Y && !isEmpty(steps.Y)) {
      preview.push(steps.Y);
    }
    if (modal.axis === "Y" && steps.X && !isEmpty(steps.X)) {
      preview.push(steps.X);
    }
    if (!isEmpty(modal)) {
      preview.push(modal);
    }
  } else {
    // when not editing, show whatever is saved
    if (steps.X && !isEmpty(steps.X)) preview.push(steps.X);
    if (steps.Y && !isEmpty(steps.Y)) preview.push(steps.Y);
  }

  // Handlers
  const onBaseChange = e => {
    const { name, value } = e.target;
    setBase(b => ({
      ...b,
      [name]: ["c", "m", "y", "k"].includes(name) ? +value : value,
    }));
  };

  const openCfg = axis => {
    setModal(steps[axis] ? { ...steps[axis] } : blankStep(axis));
    setShow(true);
  };
  const saveCfg = () => {
    setSteps(s => ({ ...s, [modal.axis]: modal }));
    setShow(false);
    setToast(`${axisName(modal.axis)} lagret`);
  };
  const delAxis = axis => {
    setSteps(s => {
      const o = { ...s };
      delete o[axis];
      return o;
    });
  };

  const saveAll = async () => {
    const updated = project.colors.map(c =>
      c.id === colorId
        ? { ...c, ...base, stepConfigs: steps }
        : c
    );
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colors: updated }),
    });
    setToast("Endringer er lagret");
  };

  return (
    <div className="flex min-h-screen bg-black/5">
      {/* ───────── Sidebar ───────── */}
      <div className="w-[30%] relative p-12">
        <div className="flex items-center gap-3 mb-20">
          <Button variant="rounded" startIcon={ArrowLeft} onClick={() => router.back()} />
          <Button variant="primary" onClick={saveAll}>Lagre</Button>
        </div>

        {/* Big swatch */}
        <div
          className="aspect-video p-9 rounded-2xl flex flex-col justify-between mb-12"
          style={{ backgroundColor: `rgb(${r},${g},${b})` }}
        >
          <h1 className="text-2xl text-white">{base.name}</h1>
          <div className="flex gap-1 text-sm">
            {["c", "m", "y", "k"].map(ch => (
              <span
                key={ch}
                className={`py-0.5 px-2 rounded-md ${tc === "text-black"
                  ? "bg-black/10 text-black"
                  : "bg-white/15 text-white"
                  }`}
              >
                {base[ch]}
              </span>
            ))}
          </div>
        </div>

        {/* Base inputs */}
        <div className="space-y-3 mb-12">
          <Input
            name="name"
            value={base.name}
            onChange={onBaseChange}
            placeholder="Navn"
            className="w-full"
          />
          <div className="flex gap-3">
            {["C", "M", "Y", "K"].map(ch => (
              <GlyphInput
                key={ch}
                name={ch.toLowerCase()}
                glyph={ch}
                type="number"
                min={0}
                max={100}
                value={base[ch.toLowerCase()]}
                onChange={onBaseChange}
                className="flex-1"
              />
            ))}
          </div>
        </div>

        {/* Step configurations */}
        <div className="space-y-3">
          {["X", "Y"].map(axis =>
            steps[axis] && (
              <div
                key={axis}
                className="p-9 bg-black/5 rounded-2xl flex justify-between items-center relative"
              >
                <div>
                  <div className="mb-6 text-lg">{axisName(axis)}e steg</div>
                  <div className="text-black text-xs flex gap-2">
                    <span className="py-0.75 px-2 rounded-md bg-black/5">{steps[axis].varyChannel.toUpperCase()}</span>
                    <span className="py-0.75 px-2 rounded-md bg-black/5">–{steps[axis].numMinusSteps}</span>
                    <span className="py-0.75 px-2 rounded-md bg-black/5">+{steps[axis].numPlusSteps}</span>
                    <span className="py-0.75 px-2 rounded-md bg-black/5">{steps[axis].stepInterval}</span>
                  </div>
                </div>
                <div className="absolute top-8.75 right-8.75 flex gap-2">
                  <Button
                    variant="secondary"
                    className="!px-4 !py-2 !rounded-lg text-xs"
                    onClick={() => openCfg(axis)}
                  >
                    Rediger
                  </Button>
                  <Button
                    variant="secondary"
                    className="!px-4 !py-2 !rounded-lg text-xs"
                    onClick={() => delAxis(axis)}
                  >
                    Slett
                  </Button>
                </div>
              </div>
            )
          )}
          <div className="flex gap-2">
            {!steps.X && (
              <Button variant="primary" startIcon={Plus} onClick={() => openCfg("X")}>
                Horisontal
              </Button>
            )}
            {!steps.Y && (
              <Button variant="primary" startIcon={Plus} onClick={() => openCfg("Y")}>
                Vertikal
              </Button>
            )}
          </div>
        </div>

        {/* ─── Inline “step” panel ─── */}
        {show && (
          <div className="absolute top-0 left-0 w-full h-full bg-white z-20">
            <div className="bg-black/5 w-full h-full p-12">
              <div className="flex gap-3 mb-20">
                <Button variant="secondary" onClick={() => setShow(false)}>
                  Avbryt
                </Button>
                <Button
                  variant="primary"
                  onClick={saveCfg}
                  disabled={isEmpty(modal)}
                >
                  Lagre
                </Button>
              </div>
              <h2 className="text-2xl mb-4">
                Konfigurer {axisName(modal.axis).toLowerCase()}
              </h2>
              <div className="space-y-3">
                <Select
                  value={modal.varyChannel}
                  onChange={(e) =>
                    setModal((m) => ({ ...m, varyChannel: e.target.value }))
                  }
                  options={["c", "m", "y", "k"]}
                />
                <div className="flex gap-3 w-full">
                  <GlyphInput
                    glyph="Minus steg"
                    type="number"
                    min={0} max={6}
                    value={modal.numMinusSteps}
                    onChange={(e) =>
                      setModal((m) => ({ ...m, numMinusSteps: +e.target.value }))
                    }
                  />
                  <GlyphInput
                    glyph="Pluss steg"
                    type="number"
                    min={0} max={6}
                    value={modal.numPlusSteps}
                    onChange={(e) =>
                      setModal((m) => ({ ...m, numPlusSteps: +e.target.value }))
                    }
                  />
                </div>
                <GlyphInput
                  glyph="Intervall"
                  type="number"
                  min={0} max={6}
                  value={modal.stepInterval}
                  onChange={(e) =>
                    setModal((m) => ({ ...m, stepInterval: +e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───────── Main preview ───────── */}
      <div className="fixed top-12 right-12 bottom-12 w-[70%]">
        <div className="h-full rounded-2xl bg-white ml-12 p-12">
          <ColorSwatchSteps {...base} stepConfigs={preview} />
        </div>
      </div>

      {/* ───────── Toast ───────── */}
      <Toast message={toast} onClose={() => setToast("")} />
    </div>
  );
}