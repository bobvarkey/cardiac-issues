import { Outlet, createFileRoute } from "@tanstack/react-router";
import { EcgLine } from "@/components/EcgLine";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Sidebar } from "@/components/Sidebar";

export const Route = createFileRoute("/_layout")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-5xl px-5 py-3">
            <GlobalSearch />
          </div>
          <div className="pointer-events-none h-3 text-primary/30">
            <EcgLine className="h-full w-full" />
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
          <Outlet />
        </main>

        <footer className="mx-auto w-full max-w-5xl px-5 pb-10 pt-8">
          <div className="rounded-xl border border-warn/25 bg-warn/5 p-4 text-xs text-warn">
            For educational reference only. Not a substitute for clinical judgment, institutional
            protocols, or current guidelines.
          </div>
        </footer>
      </div>
    </div>
  );
}