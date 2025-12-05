// src/app/[projectId]/[colorId]/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { ArrowLeft, Trash, Plus } from "phosphor-react";

import { useToast } from "../../components/ToastContext";
import { cmykToRgb, getTextColor, rgbToColorString } from "../../utils/ColorUtils";
import ColorSwatchSteps from "../../components/ColorSwatchSteps";
import Button from "../../components/Button";
import Input from "../../components/Input";
import GlyphInput from "../../components/GlyphInput";
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
// ─────────────────────────────────────────────────────────────────────────────

export default function ColorPage() {
  const { projectId, colorId } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const { data: project, error, isLoading, mutate } =
    useSWR(`/api/projects/${projectId}`, fetcher);

  const [base, setBase] = useState(null);
  const [steps, setSteps] = useState({});
  const stepsRef = useRef({});
  const [modal, setModal] = useState(blankStep("X"));
  const [show, setShow] = useState(false);

  // Load the color - only when project or colorId changes, not on every render
  useEffect(() => {
    if (!project) return;
    const c = project.colors?.find(c => c.id === colorId);
    if (!c) {
      showToast("Farge ikke funnet");
      return;
    }
    setBase({ name: c.name, c: c.c, m: c.m, y: c.y, k: c.k });
    const stepConfigs = c.stepConfigs || {};
    // Only update if we don't have local changes (check if stepsRef is empty or different)
    // This prevents overwriting local edits that haven't been saved yet
    if (Object.keys(stepsRef.current).length === 0 || JSON.stringify(stepsRef.current) === JSON.stringify(stepConfigs)) {
      setSteps(stepConfigs);
      stepsRef.current = stepConfigs;
      console.log("Loaded stepConfigs from project:", JSON.stringify(stepConfigs, null, 2));
    } else {
      console.log("Skipping stepConfigs update - local changes detected");
      console.log("Local stepsRef:", JSON.stringify(stepsRef.current, null, 2));
      console.log("Project stepConfigs:", JSON.stringify(stepConfigs, null, 2));
    }
  }, [project, colorId, showToast]);

  if (error) return <div className="p-10 text-red-600">Feil ved lasting</div>;
  if (isLoading || !base) return <div className="p-10">Laster…</div>;

  // Contrast + preview steps
  const rgb = cmykToRgb(base.c, base.m, base.y, base.k);
  const tc = getTextColor(rgb);

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
    console.log("saveCfg called with modal:", JSON.stringify(modal, null, 2));
    const stepToSave = {
      axis: modal.axis,
      varyChannel: modal.varyChannel,
      stepInterval: Number(modal.stepInterval) || 0,
      numMinusSteps: Number(modal.numMinusSteps) || 0,
      numPlusSteps: Number(modal.numPlusSteps) || 0,
    };
    console.log("Step to save:", JSON.stringify(stepToSave, null, 2));
    console.log("Is empty?", isEmpty(stepToSave));
    
    setSteps(s => {
      const updated = { ...s, [modal.axis]: stepToSave };
      stepsRef.current = updated;
      console.log("Updated stepsRef.current:", JSON.stringify(updated, null, 2));
      console.log("Updated steps state will be:", JSON.stringify(updated, null, 2));
      return updated;
    });
    setShow(false);
    // Force a small delay to ensure state is updated before showing toast
    setTimeout(() => {
      showToast(`${axisName(modal.axis)} lagret`);
      console.log("After saveCfg - steps state should be updated, check UI");
    }, 100);
  };
  const delAxis = axis => {
    setSteps(s => {
      const o = { ...s };
      delete o[axis];
      stepsRef.current = o;
      return o;
    });
  };

  const saveAll = async () => {
    console.log("🔵 saveAll function called!");
    try {
      console.log("=== SAVE ALL CALLED ===");
      console.log("stepsRef.current:", JSON.stringify(stepsRef.current, null, 2));
      console.log("steps state:", JSON.stringify(steps, null, 2));
      console.log("project.colors:", project.colors?.length, "colors");
      console.log("colorId:", colorId);
      
      // Use stepsRef to get the latest value, not the stale closure
      // Save ALL step configs, even if they appear empty (let Firestore store them)
      const stepConfigsToSave = {};
      
      if (stepsRef.current.X) {
        stepConfigsToSave.X = {
          axis: stepsRef.current.X.axis || "X",
          varyChannel: stepsRef.current.X.varyChannel || "c",
          stepInterval: Number(stepsRef.current.X.stepInterval) || 0,
          numMinusSteps: Number(stepsRef.current.X.numMinusSteps) || 0,
          numPlusSteps: Number(stepsRef.current.X.numPlusSteps) || 0,
        };
        console.log("X config:", JSON.stringify(stepConfigsToSave.X, null, 2), "isEmpty:", isEmpty(stepConfigsToSave.X));
      }
      
      if (stepsRef.current.Y) {
        stepConfigsToSave.Y = {
          axis: stepsRef.current.Y.axis || "Y",
          varyChannel: stepsRef.current.Y.varyChannel || "c",
          stepInterval: Number(stepsRef.current.Y.stepInterval) || 0,
          numMinusSteps: Number(stepsRef.current.Y.numMinusSteps) || 0,
          numPlusSteps: Number(stepsRef.current.Y.numPlusSteps) || 0,
        };
        console.log("Y config:", JSON.stringify(stepConfigsToSave.Y, null, 2), "isEmpty:", isEmpty(stepConfigsToSave.Y));
      }
      
      console.log("Final stepConfigsToSave:", JSON.stringify(stepConfigsToSave, null, 2));
      console.log("stepConfigsToSave keys:", Object.keys(stepConfigsToSave));
      
      // Always include stepConfigs, even if empty, to ensure Firestore stores it
      const updated = project.colors.map(c => {
        if (c.id === colorId) {
          const updatedColor = {
            ...c,
            name: base.name,
            c: base.c,
            m: base.m,
            y: base.y,
            k: base.k,
            stepConfigs: Object.keys(stepConfigsToSave).length > 0 ? stepConfigsToSave : {},
          };
          console.log("Updated color object:", JSON.stringify(updatedColor, null, 2));
          console.log("stepConfigs in updatedColor:", JSON.stringify(updatedColor.stepConfigs, null, 2));
          return updatedColor;
        }
        return c;
      });
      
      console.log("Sending to API - colors array length:", updated.length);
      const requestBody = { colors: updated };
      console.log("Request body:", JSON.stringify(requestBody, null, 2));
      
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Save failed - Status:", res.status, "Error:", errorText);
        showToast("Feil ved lagring");
        return;
      }
      
      const result = await res.json();
      console.log("Save response from API:", result);
      
      // Refresh SWR cache to show updated data
      console.log("Refreshing SWR cache...");
      await mutate();
      console.log("Cache refreshed");
      showToast("Endringer er lagret");
    } catch (err) {
      console.error("Error saving:", err);
      console.error("Error stack:", err.stack);
      showToast("Feil ved lagring");
    }
  };

  return (
    <div className="flex min-h-screen bg-black/5">
      {/* ───────── Sidebar ───────── */}
      <div className="w-[30%] relative p-12">
        <div className="flex items-center gap-3 mb-20">
          <Button variant="rounded" startIcon={ArrowLeft} onClick={() => router.back()} />
          <Button 
            variant="primary" 
            onClick={() => {
              console.log("🟢 Lagre button clicked!");
              saveAll();
            }}
          >
            Lagre
          </Button>
        </div>

        {/* Big swatch */}
        <div
          className="aspect-video p-9 rounded-2xl flex flex-col justify-between mb-12"
          style={{ backgroundColor: rgbToColorString(rgb) }}
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

        {/* ─── Inline "step" panel ─── */}
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
    </div>
  );
}