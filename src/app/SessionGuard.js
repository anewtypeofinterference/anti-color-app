// src/app/SessionGuard.js
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SessionGuard({ children }) {
  const { status } = useSession();        // no `required: true`
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <p className="p-10">Laster bruker…</p>;
  }

  return <>{children}</>;
}