// src/app/components/AuthModal.js
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Modal from "./Modal";
import Input from "./Input";

export default function AuthModal({ onClose, onSignedIn }) {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    if (res?.error) setError(res.error);
    else onSignedIn();
  };

  return (
    <Modal
      title="Logg inn"
      description="Bruk din @anti.as-konto"
      onCancel={onClose}
      cancelLabel="Lukk"
      onConfirm={handleSubmit}
      confirmLabel="Logg inn"
    >
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="E-post"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Passord"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </form>
    </Modal>
  );
}