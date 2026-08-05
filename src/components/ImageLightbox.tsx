import { Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
};

export function LightboxImage({ src, alt, caption, className }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <figure className={`surface-panel space-y-2 p-3 ${className ?? ""}`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative block w-full overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={`Expand image: ${alt}`}
        >
          <img src={src} alt={alt} loading="lazy" className="w-full rounded-lg" />
          <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-1 text-[10px] font-medium text-foreground opacity-0 backdrop-blur transition group-hover:opacity-100">
            <Maximize2 className="h-3 w-3" /> Expand
          </span>
        </button>
        {caption && (
          <figcaption className="text-[11px] text-muted-foreground">{caption}</figcaption>
        )}
      </figure>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close image"
            className="absolute right-4 top-4 rounded-md border border-border bg-surface p-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <figure
            className="max-h-full w-full max-w-5xl space-y-2 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={src} alt={alt} className="mx-auto max-h-[80vh] w-auto rounded-lg" />
            {caption && (
              <figcaption className="text-center text-xs text-muted-foreground">
                {caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </>
  );
}
