"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="px-3 py-2 bg-black/10 rounded hover:bg-black/20"
    >
      Logg ut
    </button>
  );
}