"use client";
import { signIn, useSession } from "next-auth/react";
import Button from "../components/Button";

export default function SignIn() {
  const { status } = useSession();
  if (status === "loading") return <p className="p-8 text-sm text-zinc-500">Laster…</p>;

  return (
    <div className="fixed inset-0 bg-zinc-100 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-md w-full max-w-md flex flex-col gap-8 p-8">
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold leading-none">Logg inn</h2>
          <p className="text-zinc-500 leading-tight">
            Vennligst bruk din @anti.as-adresse og tilhørende passord for å få tilgang.
          </p>
        </div>
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={() => signIn("google", { callbackUrl: "/" })}
          >
            Logg inn med Google
          </Button>
        </div>
      </div>
    </div>
  );
}
