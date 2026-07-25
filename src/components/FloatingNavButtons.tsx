import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUp, Home } from "lucide-react";

export function FloatingNavButtons() {
  const [showTop, setShowTop] = useState(false);
  const { location } = useRouterState();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2 print:hidden">
      {!isHome && (
        <Link
          to="/"
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/90 text-primary shadow-lg backdrop-blur transition hover:bg-card"
          aria-label="Back to home"
          title="Back to home"
        >
          <Home className="h-5 w-5" />
        </Link>
      )}
      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/90 text-primary shadow-lg backdrop-blur transition hover:bg-card"
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
