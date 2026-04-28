"use client";

import Modal from './Modal';

/**
 * A reusable confirmation dialog component
 */
export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to perform this action?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "warning",
}) {
  if (!isOpen) return null;
  
  return (
    <Modal
      title={title}
      description={description}
      onCancel={onClose}
      onConfirm={() => {
        onConfirm();
        onClose();
      }}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      variant={variant}
    />
  );
} 