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
  width = "w-120",
}) {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-xl flex items-center justify-center z-50">
      <div className={`bg-white p-9 rounded-2xl ${width} space-y-9`}>
        <div>
          <h2 className="text-2xl font-medium mb-1">{title}</h2>
          <p className="opacity-60">{description}</p>
        </div>
        {children}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={confirmDisabled ? "!cursor-not-allowed bg-black/30 hover:!bg-black/30" : ""}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}