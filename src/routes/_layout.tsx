import { Outlet, createFileRoute } from "@tanstack/react-router";
import { EcgLine } from "@/components/EcgLine";
import { FloatingNavButtons } from "@/components/FloatingNavButtons";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Sidebar } from "@/components/Sidebar";
import { ViewportToggle } from "@/components/ViewportToggle";


export const Route = createFileRoute("/_layout")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <div className="flex min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-3">
            <div className="flex-1">
              <GlobalSearch />
            </div>
            <ViewportToggle />
          </div>
          <div className="pointer-events-none h-3 text-primary/30">
            <EcgLine className="h-full w-full" />
          </div>
        </header>

        <main id="main-content" className="mx-auto w-full max-w-5xl flex-1 px-5 py-10" tabIndex={-1}>
          <Outlet />
        </main>

        <footer className="mx-auto w-full max-w-5xl px-5 pb-10 pt-8">
          <div className="rounded-xl border border-warn/25 bg-warn/5 p-4 text-xs text-warn">
            For educational reference only. Not a substitute for clinical judgment, institutional
            protocols, or current guidelines.
          </div>
        </footer>
      </div>
      <FloatingNavButtons />
    </div>
  );
}

