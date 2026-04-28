export default function UnsavedIndicator({ label = "Ulagret" }) {
  return (
    <span className="flex items-center gap-1.5 text-black select-none">
      {label}
    </span>
  );
}
