export default function PageLoadError({ message = "Feil ved lasting" }) {
  return <div className="p-10 text-red-600">{message}</div>;
}
