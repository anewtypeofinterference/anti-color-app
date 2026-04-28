export default function ViewportGate({ children }) {
  return (
    <>
      <div
        className="fixed inset-0 z-100 flex flex-col items-center justify-center gap-3 bg-white px-6 text-center md:hidden"
        role="alert"
        aria-live="polite"
      >
        <p className="font-medium text-black">Større skjerm nødvendig</p>
        <p className="max-w-sm text-black/50">
          Dette verktøyet krever en bredere visning. Bruk en datamaskin, eller gjør
          nettleservinduet bredere.
        </p>
      </div>
      <div className="hidden min-h-dvh sm:block">{children}</div>
    </>
  );
}
