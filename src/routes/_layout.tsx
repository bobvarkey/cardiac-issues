import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { EcgLine } from "@/components/EcgLine";
import { GlobalSearch } from "@/components/GlobalSearch";

export const Route = createFileRoute("/_layout")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Activity className="h-4 w-4" />
              <span className="pulse-dot absolute -right-0.5 -top-0.5" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">CardiacRef</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Clinical protocols
              </div>
            </div>
          </Link>
          <div className="order-3 w-full sm:order-2 sm:ml-4 sm:w-auto sm:flex-1">
            <GlobalSearch />
          </div>
          <nav className="order-2 ml-auto flex items-center gap-1 text-sm sm:order-3">
            <NavLink to="/">Protocols</NavLink>
            <NavLink to="/treatment">Treatment</NavLink>
            <NavLink to="/rhythms">Rhythms</NavLink>
            <NavLink to="/antiarrhythmics">Drugs</NavLink>
          </nav>
        </div>
        <div className="pointer-events-none h-4 text-primary/40">
          <EcgLine className="h-full w-full" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-6">
        <div className="rounded-lg border border-warn/30 bg-warn/5 p-3 text-xs text-warn">
          For educational reference only. Not a substitute for clinical judgment, institutional
          protocols, or current guidelines.
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-md px-3 py-1.5 text-muted-foreground transition hover:bg-surface hover:text-foreground"
      activeProps={{ className: "text-foreground bg-surface" }}
      activeOptions={{ exact: true }}
    >
      {children}
    </Link>
  );
}
