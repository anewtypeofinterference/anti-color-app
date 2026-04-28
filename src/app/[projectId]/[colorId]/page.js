// Single-color editor: left sidebar (CMYK + variation axes), main area (step swatches).
"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { useSession } from "next-auth/react";

import ColorSwatchSteps from "../../components/ColorSwatchSteps";
import ColorEditPageLayout from "../../components/ColorEditPageLayout";
import ColorEditorAside from "../../components/ColorEditorAside";
import PageLoadError from "../../components/PageLoadError";
import PageLoading from "../../components/PageLoading";
import { useToast } from "../../components/ToastContext";
import { useProjectColorEditor } from "../../hooks/useProjectColorEditor";
import { useSaveShortcut } from "../../hooks/useSaveShortcut";
import { jsonFetcher } from "../../lib/jsonFetcher";
import { cmykToRgb, getTextColorForCmyk } from "../../utils/ColorUtils";

function normalizeSegment(param) {
  return Array.isArray(param) ? param[0] : param;
}

export default function ColorPage() {
  const params = useParams();
  const projectId = normalizeSegment(params.projectId);
  const colorId = normalizeSegment(params.colorId);

  const { showToast } = useToast();
  const { data: session } = useSession();

  const { data: project, error, isLoading, mutate } = useSWR(
    `/api/projects/${projectId}`,
    jsonFetcher
  );

  const editor = useProjectColorEditor({
    project,
    projectId,
    colorId,
    mutate,
    session,
    showToast,
  });

  useSaveShortcut(editor.saveAll);

  if (error) return <PageLoadError />;
  if (isLoading || !editor.base) {
    return <PageLoading />;
  }

  const { c, m, y, k } = editor.base;
  const rgb = cmykToRgb(c, m, y, k);
  const textColorClass = getTextColorForCmyk(c, m, y, k);

  return (
    <ColorEditPageLayout
      aside={
        <ColorEditorAside
          projectId={projectId}
          base={editor.base}
          rgb={rgb}
          textColorClass={textColorClass}
          onBaseChange={editor.onBaseChange}
          steps={editor.steps}
          isDirty={editor.isDirty}
          onSave={editor.saveAll}
          addAxis={editor.addAxis}
          removeAxis={editor.removeAxis}
          upsertAxis={editor.upsertAxis}
        />
      }
    >
      <ColorSwatchSteps {...editor.base} stepConfigs={editor.previewStepConfigs} />
    </ColorEditPageLayout>
  );
}
