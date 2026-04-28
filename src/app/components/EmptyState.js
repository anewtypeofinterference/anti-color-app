export default function EmptyState({
  title = "Ingenting å vise her",
  description = "",
  children,
}) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center gap-3">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="text-sm text-zinc-500 max-w-sm">{description}</p>
      )}
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}
