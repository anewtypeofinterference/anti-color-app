"use client";
import React from "react";
import Button from "./Button";

export default function Modal({
  title,
  description,
  children,
  onCancel,
  onConfirm,
  cancelLabel = "Avbryt",
  confirmLabel = "Lagre",
  confirmDisabled = false,
  /** Shown only while confirm is disabled (e.g. explain required fields). */
  confirmHelpTextWhenDisabled,
  variant = "default",
  width = "w-full max-w-md",
}) {
  const confirmClass =
    variant === "danger"
      ? "!bg-red-600 hover:!bg-red-700 border-transparent"
      : "";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
      <div className={`bg-white rounded-md ${width}`}>
        <div className="flex flex-col gap-8 p-8">
          <div className="flex flex-col gap-4">
            <h2 className="text-base font-semibold leading-none">{title}</h2>
            {description && (
              <p className="text-zinc-500 leading-tight">{description}</p>
            )}
          </div>
          {children && <div>{children}</div>}
        </div>

        {confirmDisabled && confirmHelpTextWhenDisabled && (
          <p className="px-8 pt-0 text-sm text-zinc-600">{confirmHelpTextWhenDisabled}</p>
        )}

        <div className="flex justify-end gap-4 p-8">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={confirmClass}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
