export default function ColorEditPageLayout({ aside, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {aside}
      <main className="flex-1 bg-white overflow-auto">
        <div className="h-full p-8">{children}</div>
      </main>
    </div>
  );
}
