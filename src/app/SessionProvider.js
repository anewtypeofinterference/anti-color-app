"use client";

import { SessionProvider } from "next-auth/react";

/** Explicit basePath avoids ambiguous auth URLs when NEXTAUTH_URL / proxies differ from the browser origin. */
export default function AuthProvider({ children }) {
  return (
    <SessionProvider basePath="/api/auth">{children}</SessionProvider>
  );
}
