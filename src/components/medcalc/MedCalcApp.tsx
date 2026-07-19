import { useEffect, useMemo, useState } from "react";
import {
  Home as HomeIcon,
  Calculator as CalcIcon,
  Clock,
  Settings as SettingsIcon,
  Search,
  ArrowUp,
  ChevronDown,
  Trash2,
  Sparkles,
  Heart,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

import { calculators, getCalculator, type Calculator } from "@/lib/medcalc/calculators";
import { history, type HistoryEntry } from "@/lib/medcalc/history";
import heartHero from "@/assets/medcalc-heart.png";

type Tab = "home" | "calc" | "history" | "settings";

// ---------- haptics + scroll helpers ----------
const tap = () => {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(6);
};
const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

// ---------- root ----------
export function MedCalcApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [activeCalc, setActiveCalc] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBack(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    scrollTop();
  }, [tab, activeCalc]);

  const openCalc = (id: string) => {
    tap();
    setActiveCalc(id);
    setTab("calc");
    setSearch("");
  };

  const goHome = () => {
    tap();
    setActiveCalc(null);
    setTab("home");
  };

  const searching = search.trim().length > 0;
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return calculators.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="sunset-shell relative min-h-[900px] overflow-hidden rounded-3xl border border-white/10">
      {/* Sunset background */}
      <div className="sunset-bg pointer-events-none absolute inset-0" />
      <div className="sunset-noise pointer-events-none absolute inset-0" />

      {/* Sticky glass header */}
      <header className="glass-header sticky top-0 z-30 px-5 pb-3 pt-4">
        <div className="flex items-center gap-3">
          {tab !== "home" && (
            <button
              onClick={goHome}
              className="glass-icon-btn"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="flex-1">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-white/70">
              MedCalc
            </div>
            <div className="text-lg font-semibold leading-tight text-white">
              {tab === "home"
                ? "Good to see you"
                : tab === "calc"
                  ? activeCalc
                    ? getCalculator(activeCalc)?.name
                    : "Calculators"
                  : tab === "history"
                    ? "Your history"
                    : "Settings"}
            </div>
          </div>
        </div>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search calculators…"
            className="w-full rounded-full border border-white/20 bg-white/10 py-2.5 pl-10 pr-4 text-[15px] text-white placeholder:text-white/60 backdrop-blur focus:border-white/40 focus:outline-none"
            aria-label="Search MedCalc"
            data-tour="search"
          />

        </div>
      </header>

      {/* Blur overlay when searching */}
      {searching && (
        <div className="absolute inset-0 top-[110px] z-20 bg-black/30 backdrop-blur-md">
          <div className="mx-auto max-w-xl px-5 py-6">
            <div className="mb-3 text-xs uppercase tracking-widest text-white/70">
              {searchResults.length} match{searchResults.length === 1 ? "" : "es"}
            </div>
            <div className="space-y-2">
              {searchResults.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openCalc(c.id)}
                  className="glass-card w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.symbol}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{c.name}</div>
                      <div className="text-sm text-white/75">{c.tagline}</div>
                    </div>
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/80">
                      {c.category}
                    </span>
                  </div>
                </button>
              ))}
              {searchResults.length === 0 && (
                <div className="glass-card text-center text-white/80">
                  <div className="text-4xl">🌅</div>
                  <div className="mt-2 font-semibold text-white">Nothing here yet</div>
                  <div className="text-sm">Try “BMI”, “MAP”, or “creatinine”.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <main className="relative z-10 px-5 pb-32 pt-5 text-white">
        {tab === "home" && <HomeView onOpen={openCalc} onGoTab={setTab} />}
        {tab === "calc" && (
          <CalculatorView
            activeId={activeCalc}
            onSelect={openCalc}
            onClear={() => {
              setActiveCalc(null);
              tap();
            }}
          />
        )}
        {tab === "history" && <HistoryView onOpen={openCalc} />}
        {tab === "settings" && <SettingsView />}
      </main>

      {/* Back to top */}
      {showBack && (
        <button
          onClick={() => {
            tap();
            scrollTop();
          }}
          className="fixed bottom-24 right-6 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white shadow-lg backdrop-blur transition hover:scale-105"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}

      {/* Bottom tab bar */}
      <nav className="glass-tabbar absolute bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2">
        <TabButton icon={HomeIcon} label="Home" active={tab === "home"} onClick={() => { tap(); setTab("home"); }} />
        <TabButton icon={CalcIcon} label="Calc" active={tab === "calc"} onClick={() => { tap(); setTab("calc"); }} />
        <TabButton icon={Clock} label="History" active={tab === "history"} onClick={() => { tap(); setTab("history"); }} />
        <TabButton icon={SettingsIcon} label="Settings" active={tab === "settings"} onClick={() => { tap(); setTab("settings"); }} />
      </nav>
    </div>
  );
}

// ---------- Home ----------
function HomeView({ onOpen, onGoTab }: { onOpen: (id: string) => void; onGoTab: (t: Tab) => void }) {
  const grouped = useMemo(() => {
    const map = new Map<string, Calculator[]>();
    for (const c of calculators) {
      const arr = map.get(c.category) ?? [];
      arr.push(c);
      map.set(c.category, arr);
    }
    return [...map.entries()];
  }, []);

  return (
    <div className="space-y-6 text-[17px] leading-[1.55]">
      {/* Hero */}
      <section className="hero-card relative overflow-hidden rounded-3xl border border-white/20 p-6">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/25 blur-3xl" />
        <div className="absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-fuchsia-400/40 blur-3xl" />

        {/* Glowing heart */}
        <div className="pointer-events-none absolute -right-8 -top-6 h-56 w-56 sm:-right-4 sm:h-64 sm:w-64">
          <div className="absolute inset-4 rounded-full bg-fuchsia-400/50 blur-3xl" />
          <div className="absolute inset-8 rounded-full bg-amber-300/40 blur-2xl" />
          <img
            src={heartHero}
            alt="Glowing sunset-gradient anatomical heart"
            width={512}
            height={512}
            className="relative h-full w-full animate-[heartFloat_6s_ease-in-out_infinite] object-contain drop-shadow-[0_0_30px_rgba(255,120,180,0.55)]"
          />
        </div>

        <div className="relative max-w-[68%]">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-white backdrop-blur">
            <Sparkles className="h-3 w-3" /> Sunset Blaze
          </div>
          <h1 className="mt-3 text-[28px] font-semibold leading-tight text-white">
            Quick clinical math,{" "}
            <span className="bg-gradient-to-r from-amber-100 to-white bg-clip-text text-transparent">
              beautifully calm.
            </span>
          </h1>
          <p className="mt-2 text-[15px] text-white/90">
            Type numbers. Get answers. Save what matters. You're always one tap from a fresh
            calculation.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { id: "chadsvasc", label: "CHA₂DS₂-VASc" },
              { id: "crcl", label: "CrCl" },
              { id: "qtc", label: "QTc" },
              { id: "bmi", label: "BMI" },
            ].map((q) => (
              <button
                key={q.id}
                onClick={() => { tap(); onOpen(q.id); }}
                className="cta-primary !py-2 !px-3 !text-[13px]"
              >
                <Heart className="h-3.5 w-3.5" /> {q.label}
              </button>
            ))}
            <button
              onClick={() => { tap(); onGoTab("calc"); }}
              className="cta-secondary !py-2 !px-3 !text-[13px]"
            >
              All calculators
            </button>
            <button
              onClick={() => { tap(); onGoTab("history"); }}
              className="cta-secondary !py-2 !px-3 !text-[13px]"
            >
              <Clock className="h-3.5 w-3.5" /> History
            </button>
          </div>

        </div>
      </section>

      {/* Grouped calculators */}
      {grouped.map(([cat, list]) => (
        <CollapsibleSection key={cat} title={cat} count={list.length} defaultOpen={false}>
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((c) => (
              <button
                key={c.id}
                onClick={() => onOpen(c.id)}
                className="glass-card group text-left transition active:scale-[0.98]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-2xl">
                    {c.symbol}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-white">{c.name}</div>
                    <div className="text-sm text-white/75">{c.tagline}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CollapsibleSection>
      ))}

      <Disclaimer />
    </div>
  );
}

// ---------- Calculator ----------
function CalculatorView({
  activeId,
  onSelect,
  onClear,
}: {
  activeId: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
}) {
  if (!activeId) {
    return (
      <div className="space-y-4">
        <p className="text-white/85">Pick a calculator to get started.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {calculators.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="glass-card text-left active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.symbol}</span>
                <div>
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-sm text-white/75">{c.tagline}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }
  const calc = getCalculator(activeId);
  if (!calc) return null;
  return <CalculatorForm calc={calc} onSwitch={onClear} />;
}

function CalculatorForm({ calc, onSwitch }: { calc: Calculator; onSwitch: () => void }) {
  const [values, setValues] = useState<Record<string, number>>({});
  const [skeleton, setSkeleton] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValues({});
    setSaved(false);
  }, [calc.id]);

  useEffect(() => {
    setSkeleton(true);
    const t = setTimeout(() => setSkeleton(false), 220);
    return () => clearTimeout(t);
  }, [values]);

  const result = useMemo(() => calc.compute(values), [calc, values]);

  const save = () => {
    if (!result) return;
    tap();
    history.add({
      calcId: calc.id,
      calcName: calc.name,
      inputs: values,
      result: {
        value: result.value,
        unit: result.unit,
        label: result.interpretation?.[0]?.label,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <div className="space-y-5 text-[16px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{calc.symbol}</span>
          <div>
            <div className="text-lg font-semibold text-white">{calc.name}</div>
            <div className="text-sm text-white/75">{calc.tagline}</div>
          </div>
        </div>
        <button onClick={onSwitch} className="glass-chip text-xs">
          Switch
        </button>
      </div>

      <div className="glass-card space-y-4">
        {calc.fields.map((f) => (
          <div key={f.key}>
            <label className="mb-1.5 block text-sm font-medium text-white/90">
              {f.label}{" "}
              {f.unit && <span className="text-white/60">({f.unit})</span>}
            </label>
            {f.type === "number" ? (
              <input
                type="number"
                inputMode="decimal"
                min={f.min}
                max={f.max}
                step={f.step ?? 1}
                placeholder={f.placeholder ?? ""}
                value={values[f.key] ?? ""}
                onChange={(e) =>
                  setValues((v) => {
                    const raw = e.target.value;
                    const next = { ...v };
                    if (raw === "") delete next[f.key];
                    else next[f.key] = Number(raw);
                    return next;
                  })
                }
                className="w-full rounded-xl border border-white/20 bg-white/10 px-3.5 py-2.5 text-[17px] text-white placeholder:text-white/50 focus:border-white/50 focus:outline-none"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {f.options?.map((o) => {
                  const active = values[f.key] === o.value;
                  return (
                    <button
                      key={o.label}
                      onClick={() => {
                        tap();
                        setValues((v) => ({ ...v, [f.key]: o.value }));
                      }}
                      className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                        active
                          ? "bg-white text-slate-900 shadow"
                          : "border border-white/25 bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Result panel */}
      <div className="result-panel relative overflow-hidden rounded-2xl border border-white/25 p-5">
        {skeleton && (
          <div className="absolute inset-0 animate-pulse bg-white/10" aria-hidden />
        )}
        {result ? (
          <div className="relative animate-[fadeIn_.35s_ease-out]">
            <div className="text-xs uppercase tracking-widest text-white/75">Result</div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-4xl font-semibold text-white">{result.value}</div>
              {result.unit && <div className="text-lg text-white/80">{result.unit}</div>}
            </div>
            {result.interpretation?.map((i) => (
              <span
                key={i.label}
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-medium ${toneClass(i.tone)}`}
              >
                {i.label}
              </span>
            ))}
            {result.detail && (
              <details className="group mt-4">
                <summary className="flex cursor-pointer items-center gap-2 text-sm text-white/85">
                  <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
                  Interpretation & notes
                </summary>
                <p className="mt-2 text-sm text-white/85">{result.detail}</p>
              </details>
            )}
            <div className="mt-5 flex gap-3">
              <button onClick={save} className="cta-primary">
                <ShieldCheck className="h-4 w-4" />
                {saved ? "Saved!" : "Save to history"}
              </button>
            </div>
          </div>
        ) : (
          <div className="relative text-center text-white/85">
            <div className="text-4xl">✨</div>
            <div className="mt-2 font-semibold text-white">Fill in the fields above</div>
            <div className="text-sm">Your result appears here the instant we have enough info.</div>
          </div>
        )}
      </div>

      <Disclaimer />
    </div>
  );
}

// ---------- History ----------
function HistoryView({ onOpen }: { onOpen: (id: string) => void }) {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const refresh = () => setItems(history.list());
    refresh();
    window.addEventListener("medcalc:history", refresh);
    return () => window.removeEventListener("medcalc:history", refresh);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (e) =>
        e.calcName.toLowerCase().includes(s) ||
        e.result.value.toLowerCase().includes(s) ||
        (e.result.label ?? "").toLowerCase().includes(s),
    );
  }, [items, q]);

  if (items.length === 0) {
    return (
      <div className="glass-card text-center text-white/85">
        <div className="text-5xl">🌤️</div>
        <div className="mt-3 text-lg font-semibold text-white">You're all caught up!</div>
        <p className="mt-1 text-sm">
          Saved calculations will land here. Try one from the library and hit “Save to history”.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search your history…"
          className="w-full rounded-full border border-white/20 bg-white/10 py-2.5 pl-10 pr-4 text-[15px] text-white placeholder:text-white/60 focus:border-white/40 focus:outline-none"
        />
      </div>
      <div className="space-y-2">
        {filtered.map((e) => (
          <div key={e.id} className="glass-card">
            <div className="flex items-start justify-between gap-3">
              <button onClick={() => onOpen(e.calcId)} className="min-w-0 flex-1 text-left">
                <div className="truncate font-semibold text-white">{e.calcName}</div>
                <div className="text-sm text-white/80">
                  {e.result.value} {e.result.unit}
                  {e.result.label ? ` · ${e.result.label}` : ""}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-wider text-white/60">
                  {new Date(e.timestamp).toLocaleString()}
                </div>
              </button>
              <button
                onClick={() => {
                  tap();
                  history.remove(e.id);
                }}
                className="glass-icon-btn"
                aria-label="Delete entry"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="glass-card text-center text-white/85">
            No matches — try a different word.
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Settings ----------
function SettingsView() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const refresh = () => setCount(history.list().length);
    refresh();
    window.addEventListener("medcalc:history", refresh);
    return () => window.removeEventListener("medcalc:history", refresh);
  }, []);
  return (
    <div className="space-y-4">
      <div className="glass-card">
        <div className="text-sm text-white/80">Local history</div>
        <div className="mt-1 text-lg font-semibold text-white">{count} entries saved on this device</div>
        <button
          onClick={() => {
            if (confirm("Clear all saved calculations?")) {
              tap();
              history.clear();
            }
          }}
          className="mt-3 cta-secondary"
        >
          <Trash2 className="h-4 w-4" /> Clear history
        </button>
      </div>
      <div className="glass-card space-y-2 text-sm text-white/85">
        <div className="text-white font-semibold">About MedCalc</div>
        <p>
          Offline-first clinical math with a warm Sunset Blaze theme. History stays on your device —
          nothing is uploaded.
        </p>
      </div>
      <Disclaimer />
    </div>
  );
}

// ---------- Shared bits ----------
function TabButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px] transition ${
        active ? "text-white" : "text-white/70"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <Icon className={`h-5 w-5 ${active ? "scale-110" : ""} transition`} strokeWidth={active ? 2.6 : 2} />
      <span className={active ? "font-semibold" : ""}>{label}</span>
    </button>
  );
}

function CollapsibleSection({
  title,
  count,
  defaultOpen,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <section>
      <button
        onClick={() => {
          tap();
          setOpen((o) => !o);
        }}
        className="flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left backdrop-blur transition hover:bg-white/10"
      >
        <div>
          <div className="text-[11px] uppercase tracking-widest text-white/70">Section</div>
          <div className="text-base font-semibold text-white">
            {title} {count !== undefined && <span className="text-white/60">· {count}</span>}
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 text-white transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-3 animate-[fadeIn_.25s_ease-out]">{children}</div>}
    </section>
  );
}

function Disclaimer() {
  return (
    <div className="rounded-2xl border border-white/20 bg-black/25 p-4 text-[13px] leading-relaxed text-white/85 backdrop-blur">
      This app is for informational and educational purposes only and does not provide medical
      diagnosis, treatment, or emergency advice.
    </div>
  );
}

function toneClass(tone: "ok" | "warn" | "danger" | "info") {
  switch (tone) {
    case "ok":
      return "bg-emerald-400/25 text-emerald-50 border border-emerald-200/40";
    case "warn":
      return "bg-amber-400/25 text-amber-50 border border-amber-200/40";
    case "danger":
      return "bg-rose-500/30 text-rose-50 border border-rose-200/40";
    default:
      return "bg-white/15 text-white border border-white/30";
  }
}
