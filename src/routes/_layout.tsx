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
        <div className="mx-auto max-w-5xl px-5 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
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
          <nav className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
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
        <div className="pointer-events-none h-3 text-primary/30">
          <EcgLine className="h-full w-full" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-5xl px-5 pb-10 pt-8">
        <div className="rounded-xl border border-warn/25 bg-warn/5 p-4 text-xs text-warn">
          For educational reference only. Not a substitute for clinical judgment, institutional
          protocols, or current guidelines.
        </div>
      </footer>
    </div>
  );
}

function NavSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 mr-3">
      <span className="text-xs font-medium text-muted-foreground/60 mr-1.5">{label}:</span>
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
      className="rounded-lg px-2.5 py-1.5 text-muted-foreground transition hover:bg-surface hover:text-foreground"
      activeProps={{ className: "text-foreground bg-surface font-medium" }}
      activeOptions={{ exact: true }}
    >
      {children}
    </Link>
  );
}