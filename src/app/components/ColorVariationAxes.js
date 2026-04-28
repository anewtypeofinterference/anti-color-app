"use client";

import { Plus, X } from "phosphor-react";

import { cmykToRgb, rgbToColorString } from "../utils/ColorUtils";
import {
  AXES,
  AXIS_ICON,
  axisLabel,
  buildAxisGradient,
  CHANNELS,
  clamp,
} from "../lib/colorSteps";
import GlyphInput from "./GlyphInput";

function AxisGradientStrip({ base, cfg }) {
  const stops = buildAxisGradient(base, cfg);
  if (!stops.length) return null;

  return (
    <div
      className=""
      aria-hidden
    >
    </div>
  );
}

function ChannelPicker({ axis, cfg, upsertAxis }) {
  const activeChannel = cfg.varyChannel ?? "y";

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-medium text-zinc-400">Kanal</span>
      <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Varier CMYK-kanal">
        {CHANNELS.map((ch) => {
          const active = activeChannel === ch;
          return (
            <button
              key={ch}
              type="button"
              onClick={() => upsertAxis(axis, { varyChannel: ch })}
              className={`cursor-pointer rounded-md py-2 text-sm font-mono font-medium transition-colors ${
                active
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "bg-zinc-100 text-black hover:bg-zinc-200"
              }`}
            >
              {ch.toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepInputs({ axis, cfg, upsertAxis }) {
  const minus = Number(cfg.numMinusSteps) || 0;
  const plus = Number(cfg.numPlusSteps) || 0;
  const interval = Number(cfg.stepInterval) || 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[10px] font-medium text-zinc-400">Steg minus</span>
          <GlyphInput
            glyph="−"
            aria-label="Antall steg mot minus"
            type="number"
            inputMode="numeric"
            min={0}
            max={6}
            value={minus}
            onChange={(e) =>
              upsertAxis(axis, {
                numMinusSteps: clamp(+e.target.value || 0, 0, 6),
              })
            }
          />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
        <span className="text-[10px] font-medium text-zinc-400">Steg pluss</span>
          <GlyphInput
            glyph="+"
            aria-label="Antall steg mot pluss"
            type="number"
            inputMode="numeric"
            min={0}
            max={6}
            value={plus}
            onChange={(e) =>
              upsertAxis(axis, {
                numPlusSteps: clamp(+e.target.value || 0, 0, 6),
              })
            }
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-medium text-zinc-400">Steglengde</span>
        <GlyphInput
          glyph="∆"
          aria-label="Steglengde"
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          value={interval}
          onChange={(e) =>
            upsertAxis(axis, {
              stepInterval: clamp(+e.target.value || 0, 0, 100),
            })
          }
        />
      </div>
    </div>
  );
}

function AddAxisRow({ axis, label, Icon, onAdd }) {
  return (
    <button
      type="button"
      onClick={() => onAdd(axis)}
      className="flex cursor-pointer items-center justify-between rounded-md border border-transparent bg-white p-4 text-left font-medium text-black transition-colors hover:border-zinc-200"
    >
      <div className="flex items-center gap-4">
        <Icon size={14} weight="bold" />
        {label}
      </div>
      <Plus size={14} weight="bold" />
    </button>
  );
}

function VariationAxisCard({ axis, base, cfg, Icon, upsertAxis, removeAxis }) {
  return (
    <div className="flex flex-col gap-4 rounded-md border border-transparent bg-white p-4 text-left font-medium text-black">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Icon size={14} weight="bold" />
          <span className="font-medium">{axisLabel(axis)}</span>
        </div>
        <button
          type="button"
          onClick={() => removeAxis(axis)}
          aria-label="Fjern variasjon"
        >
          <X size={14} weight="bold" className="cursor-pointer" />
        </button>
      </div>
      <AxisGradientStrip base={base} cfg={cfg} />
      <ChannelPicker axis={axis} cfg={cfg} upsertAxis={upsertAxis} />
      <StepInputs axis={axis} cfg={cfg} upsertAxis={upsertAxis} />
    </div>
  );
}

/**
 * Horisontal (X) og vertikal (Y) variationsakser — brukes sammen med ColorSwatchSteps.
 */
export default function ColorVariationAxes({ base, steps, addAxis, removeAxis, upsertAxis }) {
  return (
    <div className="flex flex-col gap-3">

      {AXES.map((axis) => {
        const cfg = steps[axis];
        const Icon = AXIS_ICON[axis];

        if (!cfg) {
          return (
            <AddAxisRow
              key={axis}
              axis={axis}
              label={axisLabel(axis)}
              Icon={Icon}
              onAdd={addAxis}
            />
          );
        }

        return (
          <VariationAxisCard
            key={axis}
            axis={axis}
            base={base}
            cfg={cfg}
            Icon={Icon}
            upsertAxis={upsertAxis}
            removeAxis={removeAxis}
          />
        );
      })}
    </div>
  );
}
