export default function PageLoading({
  className = "bg-zinc-100",
  message = "Laster…",
}) {
  return (
    <div className={`min-h-screen ${className} flex items-center justify-center`}>
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  );
}
