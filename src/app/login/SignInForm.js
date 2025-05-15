"use client";
import { signIn, useSession } from "next-auth/react";
import Button from "../components/Button";

export default function SignIn() {
  const { status } = useSession();
  if (status === "loading") return <p>Laster…</p>;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-xl flex items-center justify-center z-50">
      <div className="bg-white p-9 rounded-2xl w-120 space-y-9">
        <div>
          <h2 className="text-2xl font-medium mb-1">Logg inn</h2>
          <div className="opacity-60">Vennligst bruk din @anti.as-adresse og tilhørende passord for å få tilgang.</div>
        </div>
        <div className="flex w-full justify-end gap-2">
          <Button
            variant="primary"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Logg inn
          </Button>
          </div>
      </div>
    </div>
  );
}