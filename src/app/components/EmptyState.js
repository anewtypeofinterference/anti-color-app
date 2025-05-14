export default function EmptyState({ 
  title = "Ingenting å vise her", 
  description = "", 
  children 
}) {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center justify-center h-screen text-center">
      <h2 className="text-5xl mb-4">{title}</h2>
      {description && <p className="mb-16 opacity-60">{description}</p>}
      {children}
    </div>
  );
}