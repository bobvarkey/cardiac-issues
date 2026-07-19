import { useEffect, useLayoutEffect, useState } from "react";

const STORAGE_KEY = "medcalc.tour.v1";

type Step = {
  selector: string;
  title: string;
  body: string;
  placement: "bottom" | "top";
};

const STEPS: Step[] = [
  {
    selector: '[data-tour="search"]',
    title: "Search anything",
    body: "Type a name like “BMI” or “creatinine” to jump straight to a calculator. The background blurs so results stay in focus.",
    placement: "bottom",
  },
  {
    selector: '[data-tour="collapsible"]',
    title: "Tap to expand a section",
    body: "Sections stay tidy and collapsed by default. Tap any category to reveal the calculators inside.",
    placement: "bottom",
  },
  {
    selector: '[data-tour="history"]',
    title: "Your saved results live here",
    body: "Every calculation you keep shows up in History, ready to search and reopen offline.",
    placement: "top",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

export function HomeTour({ enabled }: { enabled: boolean }) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "done") return;
    } catch {
      return;
    }
    const t = setTimeout(() => setActive(true), 500);
    return () => clearTimeout(t);
  }, [enabled]);

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

  const tipStyle: React.CSSProperties = rect
    ? current.placement === "bottom"
      ? { top: rect.top + rect.height + 16, left: Math.max(12, Math.min(rect.left, window.innerWidth - 320)) }
      : { top: Math.max(12, rect.top - 180), left: Math.max(12, Math.min(rect.left, window.innerWidth - 320)) }
    : { top: 120, left: 24 };

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Home walkthrough">
      {/* Dim + blur underlay with cut-out via box-shadow */}
      <div
        className="pointer-events-auto absolute inset-0 backdrop-blur-[3px]"
        style={{ background: "rgba(10, 6, 30, 0.55)" }}
        onClick={finish}
      />
      {rect && (
        <div
          className="pointer-events-none absolute rounded-2xl ring-2 ring-white/80 transition-all duration-300"
          style={{
            ...spot,
            boxShadow: "0 0 0 9999px rgba(10,6,30,0.55), 0 0 40px 4px rgba(255,180,120,0.55)",
          }}
        />
      )}

      <div
        className="pointer-events-auto absolute w-[300px] rounded-2xl border border-white/25 bg-white/95 p-4 text-slate-900 shadow-2xl"
        style={tipStyle}
      >
        <div className="text-[10px] font-semibold uppercase tracking-widest text-fuchsia-600">
          Step {step + 1} of {STEPS.length}
        </div>
        <div className="mt-1 text-base font-semibold">{current.title}</div>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{current.body}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={finish}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium"
              >
                Back
              </button>
            )}
            <button
              onClick={() => {
                if (step === STEPS.length - 1) finish();
                else setStep((s) => s + 1);
              }}
              className="rounded-full bg-gradient-to-r from-amber-500 via-fuchsia-500 to-violet-600 px-4 py-1.5 text-xs font-semibold text-white shadow"
            >
              {step === STEPS.length - 1 ? "Got it" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
