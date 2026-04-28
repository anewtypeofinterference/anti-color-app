"use client";

import { ArrowLeft, PencilSimple } from "phosphor-react";
import { useRouter } from "next/navigation";

import { rgbToColorString } from "../utils/ColorUtils";
import Button from "./Button";
import Input from "./Input";
import CmykInputs4 from "./CmykInputs4";
import ColorVariationAxes from "./ColorVariationAxes";
import UnsavedIndicator from "./UnsavedIndicator";

function swatchChrome(textColorClass) {
  const lightInk = textColorClass === "text-white";
  return {
    lightInk,
    labelClass: lightInk ? "text-white/60" : "text-black/50",
    nameFieldClass: lightInk
      ? "bg-white/10!  ring-inset! ring-white/20! placeholder:text-white/45! focus:ring-2! focus:ring-white/35!"
      : "bg-black/[0.08]!  ring-inset! ring-black/15! placeholder:text-black/40! focus:ring-2! focus:ring-black/28!",
    nameRowHoverClass: lightInk ? "hover:bg-white/15!" : "hover:bg-black/10!",
  };
}

export default function ColorEditorAside({
  projectId,
  base,
  rgb,
  textColorClass,
  onBaseChange,
  steps,
  isDirty,
  onSave,
  addAxis,
  removeAxis,
  upsertAxis,
}) {
  const router = useRouter();
  const pid = Array.isArray(projectId) ? projectId[0] : projectId;
  const goToProject = () => pid && router.push(`/${pid}`);
  const chrome = swatchChrome(textColorClass);

  return (
    <aside className="flex w-100 flex-col border-r border-zinc-300 bg-zinc-100">
      <header className="flex items-center justify-between gap-4 border-b border-zinc-300 p-8">
        <Button variant="rounded" startIcon={ArrowLeft} onClick={goToProject} />
        <div className="flex items-center justify-end gap-8">
          {isDirty && <UnsavedIndicator />}
          <Button
            variant="primary"
            onClick={onSave}
            disabled={!isDirty}
            className="disabled:cursor-not-allowed! disabled:opacity-40"
          >
            Lagre
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-8">
        <section className="flex flex-col gap-3" aria-labelledby="editor-swatch-heading">
          <h2 id="editor-swatch-heading" className="sr-only">
            Farge, navn og CMYK
          </h2>
          <div
            className="overflow-hidden rounded-md"
            style={{ backgroundColor: rgbToColorString(rgb) }}
          >
            <div className="flex aspect-4/3 flex-col justify-between gap-4 p-4">
              <div
                className={[
                  "group flex items-center justify-between rounded-md! transition-colors duration-200",
                  chrome.nameRowHoverClass,
                  chrome.nameFieldClass,
                  textColorClass,
                ].join(" ")}
              >
                <Input
                  id="color-name"
                  name="name"
                  value={base.name}
                  onChange={onBaseChange}
                  placeholder="Navn på farge"
                  autoComplete="off"
                  className="bg-transparent! hover:bg-transparent! font-medium!"
                />
                <PencilSimple
                  size={16}
                  weight="bold"
                  className={`mr-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100! ${textColorClass}`}
                  aria-hidden
                />
              </div>
              <CmykInputs4
                value={base}
                onChange={onBaseChange}
                surface="swatch"
                swatchUsesLightInk={chrome.lightInk}
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="editor-variations-heading">
          <ColorVariationAxes
            base={base}
            steps={steps}
            addAxis={addAxis}
            removeAxis={removeAxis}
            upsertAxis={upsertAxis}
          />
        </section>
      </div>
    </aside>
  );
}
