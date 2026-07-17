// Placeholder — the real Dashboard screen (stat cards, department breakdown,
// recently joined) is its own numbered screen in the layout spec, not part
// of this pass. This exists so the shell has something to wrap and the
// login -> dashboard redirect is verifiable end to end.
export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-xs text-muted-foreground">Coming next.</p>
    </div>
  );
}
