"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Keeps `/login` reachable without forcing an auth round-trip before paint. */
export default function SessionGuard({ children }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (status === "unauthenticated" && !isLoginPage) {
      router.push("/login");
    }
  }, [status, router, isLoginPage]);

  if (status === "loading" && !isLoginPage) {
    return <p className="p-10">Laster bruker…</p>;
  }

  return <>{children}</>;
}
