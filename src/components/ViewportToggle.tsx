import { Laptop, Smartphone, Tablet } from "lucide-react";
import { useEffect, useState } from "react";

export function ViewportToggle() {
  const [active, setActive] = useState<"mobile" | "tablet" | "desktop">("desktop");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const width = window.innerWidth;
    if (width < 640) setActive("mobile");
    else if (width < 1024) setActive("tablet");
    else setActive("desktop");
  }, []);

  const setViewport = (mode: "mobile" | "tablet" | "desktop") => {
    setActive(mode);
    document.body.setAttribute("data-preview-viewport", mode);
  };

  if (!isMounted) return null;

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-surface/80 p-1 backdrop-blur-sm shadow-sm hidden sm:flex">
      <button
        type="button"
        onClick={() => setViewport("mobile")}
        className={`rounded-full p-1.5 transition-colors ${
          active === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-surface"
        }`}
        title="Mobile view"
      >
        <Smartphone className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setViewport("tablet")}
        className={`rounded-full p-1.5 transition-colors ${
          active === "tablet" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-surface"
        }`}
        title="Tablet view"
      >
        <Tablet className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => setViewport("desktop")}
        className={`rounded-full p-1.5 transition-colors ${
          active === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-surface"
        }`}
        title="Desktop view"
      >
        <Laptop className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
