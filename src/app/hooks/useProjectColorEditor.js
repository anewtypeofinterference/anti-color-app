"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AXES,
  blankStep,
  CHANNELS,
  clamp,
  isStepConfigEmpty,
} from "../lib/colorSteps";

function snapshotKey(base, steps) {
  return JSON.stringify({ base, steps });
}

function normalizeStepConfigsForApi(stepsSource) {
  const out = {};
  for (const axis of AXES) {
    if (!stepsSource[axis]) continue;
    const row = stepsSource[axis];
    out[axis] = {
      axis,
      varyChannel: row.varyChannel || "y",
      stepInterval: Number(row.stepInterval) || 0,
      numMinusSteps: Number(row.numMinusSteps) || 0,
      numPlusSteps: Number(row.numPlusSteps) || 0,
    };
  }
  return out;
}

/**
 * Editing state for one color: base CMYK + per-axis variation configs.
 * Syncs from the loaded project document; tracks unsaved edits vs last saved / initial load.
 */
export function useProjectColorEditor({
  project,
  projectId,
  colorId,
  mutate,
  session,
  showToast,
}) {
  const [base, setBase] = useState(null);
  const [steps, setSteps] = useState({});

  const stepsRef = useRef({});
  const savedSnapshotRef = useRef(null);

  useEffect(() => {
    if (!project) return;
    const color = project.colors?.find((c) => c.id === colorId);
    if (!color) {
      showToast("Farge ikke funnet");
      return;
    }

    const nextBase = {
      name: color.name,
      c: color.c,
      m: color.m,
      y: color.y,
      k: color.k,
    };
    const nextSteps = color.stepConfigs || {};

    const noLocalStepsYet = Object.keys(stepsRef.current).length === 0;
    const serverMatchesLocalEdits =
      JSON.stringify(stepsRef.current) === JSON.stringify(nextSteps);

    if (noLocalStepsYet || serverMatchesLocalEdits) {
      setBase(nextBase);
      setSteps(nextSteps);
      stepsRef.current = nextSteps;
      if (!savedSnapshotRef.current) {
        savedSnapshotRef.current = snapshotKey(nextBase, nextSteps);
      }
    }
  }, [project, colorId, showToast]);

  const saveAll = useCallback(async () => {
    if (!base || !project?.colors) return;
    try {
      const stepConfigsToSave = normalizeStepConfigsForApi(stepsRef.current);

      const updatedColors = project.colors.map((c) => {
        if (c.id !== colorId) return c;
        return {
          ...c,
          name: base.name,
          c: base.c,
          m: base.m,
          y: base.y,
          k: base.k,
          stepConfigs: stepConfigsToSave,
          updatedAt: new Date().toISOString(),
          updatedBy: session?.user?.name ?? null,
        };
      });

      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ colors: updatedColors }),
      });

      if (!res.ok) {
        showToast("Feil ved lagring");
        return;
      }

      await mutate();
      savedSnapshotRef.current = snapshotKey(base, steps);
      showToast("Endringer er lagret");
    } catch {
      showToast("Feil ved lagring");
    }
  }, [base, colorId, mutate, project, projectId, session?.user?.name, showToast, steps]);

  const onBaseChange = useCallback((e) => {
    const { name, value } = e.target;
    setBase((b) => ({
      ...b,
      [name]: CHANNELS.includes(name) ? clamp(+value || 0, 0, 100) : value,
    }));
  }, []);

  const upsertAxis = useCallback((axis, partial) => {
    setSteps((s) => {
      const existing = s[axis] ?? blankStep(axis);
      const updated = { ...s, [axis]: { ...existing, ...partial } };
      stepsRef.current = updated;
      return updated;
    });
  }, []);

  /** Insert full defaults — avoids merging `{}` onto partial/malformed server configs. */
  const addAxis = useCallback((axis) => {
    setSteps((s) => {
      if (s[axis]) return s;
      const next = { ...s, [axis]: blankStep(axis) };
      stepsRef.current = next;
      return next;
    });
  }, []);

  const removeAxis = useCallback((axis) => {
    setSteps((s) => {
      const updated = { ...s };
      delete updated[axis];
      stepsRef.current = updated;
      return updated;
    });
  }, []);

  const previewStepConfigs = useMemo(
    () => AXES.map((a) => steps[a]).filter((s) => s && !isStepConfigEmpty(s)),
    [steps]
  );

  const currentSnapshot = base ? snapshotKey(base, steps) : null;
  const isDirty =
    savedSnapshotRef.current !== null &&
    currentSnapshot !== null &&
    currentSnapshot !== savedSnapshotRef.current;

  return {
    base,
    steps,
    isDirty,
    saveAll,
    onBaseChange,
    upsertAxis,
    addAxis,
    removeAxis,
    previewStepConfigs,
  };
}
