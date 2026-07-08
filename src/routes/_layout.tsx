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
        <div className="mx-auto max-w-5xl px-4 py-3">
          <div className="flex items-center gap-3">
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
            <div className="flex-1">
              <GlobalSearch />
            </div>
          </div>

          {/* Primary Navigation */}
          <nav className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
            <NavSection label="Protocols">
              <NavLink to="/">Home</NavLink>
            </NavSection>
            <NavSection label="Treatment">
              <NavLink to="/treatment">Arrhythmia</NavLink>
              <NavLink to="/antiarrhythmics">Drugs</NavLink>
            </NavSection>
            <NavSection label="Anticoagulation">
              <NavLink to="/anticoagulation">Guidelines</NavLink>
              <NavLink to="/scores">Scores</NavLink>
              <NavLink to="/warfarin">Warfarin</NavLink>
            </NavSection>
            <NavSection label="Other">
              <NavLink to="/rhythms">Rhythms</NavLink>
              <NavLink to="/syncope">Syncope</NavLink>
              <NavLink to="/syncope-triage">Triage</NavLink>
            </NavSection>
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

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 mr-2">
      <span className="text-xs font-medium text-muted-foreground/70 mr-1">{label}:</span>
      <div className="flex items-center gap-0.5">
        {children}
      </div>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-md px-2 py-1 text-muted-foreground transition hover:bg-surface hover:text-foreground text-sm"
      activeProps={{ className: "text-foreground bg-surface font-medium" }}
      activeOptions={{ exact: true }}
    >
      {children}
    </Link>
  );
}
