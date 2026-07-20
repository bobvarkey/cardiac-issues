import { useEffect, useLayoutEffect, useState } from "react";

const STORAGE_KEY = "hutt.tour.v1";

type Step = {
  selector: string;
  title: string;
  body: string;
  placement: "bottom" | "top";
};

const STEPS: Step[] = [
  {
    selector: '[data-tour="hutt-timer"]',
    title: "Phase timer",
    body: "Start, pause, and advance between Supine → Tilt → (NTG) → Recovery. The timer auto-saves and keeps counting even if you close the tab.",
    placement: "bottom",
  },
  {
    selector: '[data-tour="hutt-vitals"]',
    title: "Log vitals",
    body: "Enter HR, SBP/DBP, and symptoms at each check. Every entry is time-stamped and tagged with the current phase.",
    placement: "top",
  },
  {
    selector: '[data-tour="hutt-findings"]',
    title: "Findings",
    body: "Capture typical symptoms and your clinical impression. These flow directly into the final report.",
    placement: "top",
  },
  {
    selector: '[data-tour="hutt-export"]',
    title: "Interpretation & export",
    body: "Pick an interpretation, review the auto-built EMR note, then export it as a text file or print-friendly PDF.",
    placement: "top",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

export function HUTTTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "done") return;
    } catch {
      return;
    }
    const t = setTimeout(() => setActive(true), 500);
    return () => clearTimeout(t);
  }, []);

  useLayoutEffect(() => {
    if (!active) return;
    const measure = () => {
      const el = document.querySelector(STEPS[step].selector) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    const id = window.setInterval(measure, 250);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [active, step]);

  const finish = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "done");
    } catch {
      /* ignore */
    }
    setActive(false);
  };

  if (!active) return null;

  const current = STEPS[step];
  const pad = 8;
  const spot: React.CSSProperties = rect
    ? {
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : { top: 0, left: 0, width: 0, height: 0 };

  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const tipWidth = Math.min(320, vw - 24);
  const tipStyle: React.CSSProperties = rect
    ? current.placement === "bottom"
      ? {
          top: rect.top + rect.height + 16,
          left: Math.max(12, Math.min(rect.left, vw - tipWidth - 12)),
          width: tipWidth,
        }
      : {
          top: Math.max(12, rect.top - 200),
          left: Math.max(12, Math.min(rect.left, vw - tipWidth - 12)),
          width: tipWidth,
        }
    : { top: 120, left: 24, width: tipWidth };

  return (
    <div
      className="fixed inset-0 z-[100] animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="HUTT walkthrough"
    >
      <div
        className="pointer-events-auto absolute inset-0 backdrop-blur-[3px]"
        style={{ background: "rgba(10, 6, 30, 0.55)" }}
        onClick={finish}
      />
      {rect && (
        <div
          className="pointer-events-none absolute rounded-2xl ring-2 ring-primary/80 transition-all duration-300"
          style={{
            ...spot,
            boxShadow:
              "0 0 0 9999px rgba(10,6,30,0.55), 0 0 40px 4px rgba(217, 70, 239, 0.45)",
          }}
        />
      )}

      <div
        className="pointer-events-auto absolute rounded-2xl border border-border bg-background p-4 text-foreground shadow-2xl animate-scale-in"
        style={tipStyle}
      >
        <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">
          Step {step + 1} of {STEPS.length}
        </div>
        <div className="mt-1 text-base font-semibold">{current.title}</div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{current.body}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={finish}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (step === STEPS.length - 1) finish();
                else setStep((s) => s + 1);
              }}
              className="rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-600 px-4 py-1.5 text-xs font-semibold text-white shadow"
            >
              {step === STEPS.length - 1 ? "Got it" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
