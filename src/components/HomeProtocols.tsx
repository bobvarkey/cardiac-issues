import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  HeartPulse,
  Zap,
  TrendingDown,
  Waves,
  Activity,
  ChevronRight,
  Heart,
  Pill,
  Search,
  X,
  Stethoscope,
  Timer,
  Brain,
} from "lucide-react";

import { AntiarrhythmicsChart } from "@/components/AntiarrhythmicsChart";
import { HUTTMiniApp } from "@/components/HUTTMiniApp";
import { algorithms } from "@/data/cardiac";

const iconMap: Record<string, typeof HeartPulse> = {
  "code-blue": HeartPulse,
  tachycardia: Zap,
  bradycardia: TrendingDown,
  "atrial-fibrillation": Waves,
  pvc: Activity,
};

type MiniAppEntry = {
  key: string;
  title: string;
  to: string;
  description: string;
  keywords: string;
  icon: typeof HeartPulse;
  badge?: string;
  featured?: "primary" | "sunset";
};

export function HomeProtocols() {
  const [query, setQuery] = useState("");

  const entries = useMemo<MiniAppEntry[]>(() => {
    const protocolEntries: MiniAppEntry[] = algorithms.map((a) => ({
      key: `protocol-${a.id}`,
      title: a.name,
      to: `/protocol/${a.id}`,
      description: a.summary,
      keywords: `${a.name} ${a.summary} ${a.context ?? ""} protocol algorithm acls`,
      icon: iconMap[a.id] ?? HeartPulse,
      badge: a.context,
    }));

    return [
      {
        key: "treatment",
        title: "Treatment Mini App",
        to: "/treatment",
        description:
          "Live, weight-based dosing calculator for AF / VT / VF with stability-first recommendations.",
        keywords: "treatment dosing calculator af vt vf weight amiodarone lidocaine",
        icon: Pill,
        featured: "primary",
        badge: "Featured",
      },
      {
        key: "medcalc",
        title: "MedCalc",
        to: "/medcalc",
        description:
          "Mobile-styled clinical calculators — BMI, MAP, CrCl, QTc, CHA₂DS₂-VASc — with history and glass UI.",
        keywords: "medcalc bmi map crcl qtc cha2ds2 vasc calculator sunset",
        icon: Pill,
        featured: "sunset",
        badge: "Sunset Blaze",
      },
      {
        key: "hutt",
        title: "HUTT Test",
        to: "/hutt",
        description:
          "Head-up tilt table protocol with phase timer, vitals log, checklist, dose calculator, and EMR export.",
        keywords: "hutt head up tilt table syncope italian westminster protocol timer",
        icon: Timer,
        badge: "Protocol",
      },
      {
        key: "syncope",
        title: "Syncope Triage",
        to: "/syncope",
        description: "Bedside triage for syncope with red flags and workup pathways.",
        keywords: "syncope triage red flags fainting vasovagal",
        icon: Stethoscope,
      },
      ...protocolEntries,
      {
        key: "rhythms",
        title: "Rhythm Reference",
        to: "/rhythms",
        description: "Catalog of common arrhythmias with ECG features and clinical notes.",
        keywords: "rhythm arrhythmia ecg reference svt vt afib flutter",
        icon: Waves,
      },
      {
        key: "goldman",
        title: "Goldman Cardiac Risk Index",
        to: "/goldman",
        description:
          "Pre-operative cardiac risk stratification with ECG patterns and ACLS algorithms.",
        keywords: "goldman risk index pre-operative surgery cardiac",
        icon: Heart,
        badge: "Pre-operative · Risk",
      },
      {
        key: "antiarrhythmics",
        title: "Anti-arrhythmic drugs",
        to: "/antiarrhythmics",
        description:
          "Vaughan-Williams classes with mnemonics. Tap a drug to preselect it in the dosing calculator.",
        keywords:
          "antiarrhythmic vaughan williams class 0 1 2 3 4 ivabradine amiodarone sotalol flecainide",
        icon: Zap,
        badge: "Reference · Mnemonics",
      },
      {
        key: "stellate",
        title: "Stellate Ganglion Block",
        to: "/stellate",
        description:
          "Ultrasound-guided rescue block for refractory VT/VF storm — anatomy, dosing, complications, and evidence.",
        keywords:
          "stellate ganglion block electrical storm vt storm vf storm ultrasound sympathetic block",
        icon: Brain,
        badge: "Rescue · VT/VF storm",
      },
      {
        key: "anticoagulation",
        title: "Anticoagulation",
        to: "/anticoagulation",
        description: "DOAC and warfarin guidance with renal dosing and interactions.",
        keywords: "anticoagulation doac warfarin rivaroxaban apixaban dabigatran edoxaban inr",
        icon: Pill,
      },
      {
        key: "warfarin",
        title: "Warfarin dosing",
        to: "/warfarin",
        description: "INR-guided warfarin dose adjustments and bridging.",
        keywords: "warfarin inr dosing bridging vitamin k",
        icon: Pill,
      },
      {
        key: "scores",
        title: "Clinical Scores",
        to: "/scores",
        description: "Common cardiac risk and severity scores.",
        keywords: "scores risk chads has-bled timi grace",
        icon: Activity,
      },
      {
        key: "ccad",
        title: "Chronic Coronary Artery Disease",
        to: "/ccad",
        description:
          "Secondary prevention for CCAD with LoDoCo2 evidence for low-dose colchicine 0.5 mg daily.",
        keywords:
          "ccad chronic coronary artery disease colchicine lodoco2 secondary prevention mace",
        icon: Heart,
        badge: "Evidence · LoDoCo2",
      },
    ];
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? entries.filter((e) => `${e.title} ${e.description} ${e.keywords}`.toLowerCase().includes(q))
    : entries;

  const featured = filtered.filter((e) => e.featured);
  const grid = filtered.filter((e) => !e.featured);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Adult · In-hospital</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Fast-access cardiac protocols</h1>
        <p className="max-w-2xl text-muted-foreground">
          Step through common adult cardiac emergencies with branching decisions, drug doses, and
          rhythm-check cycles. Choose a protocol to begin.
        </p>

        <div className="relative max-w-xl pt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search mini-apps and tabs (e.g. QTc, tilt, amiodarone)…"
            aria-label="Search mini-apps and tabs"
            className="w-full rounded-xl border border-border bg-surface-elevated/60 py-2.5 pl-10 pr-10 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-surface-elevated"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {q && (
            <div className="mt-2 text-xs text-muted-foreground">
              {filtered.length} match{filtered.length === 1 ? "" : "es"} for "{query}"
            </div>
          )}
        </div>
      </section>

      {featured.map((e) => {
        const Icon = e.icon;
        const isSunset = e.featured === "sunset";
        return (
          <Link
            key={e.key}
            to={e.to}
            className={
              isSunset
                ? "group relative block overflow-hidden rounded-xl border p-6 transition hover:opacity-95"
                : "group relative block overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 transition hover:border-primary hover:from-primary/25"
            }
            style={
              isSunset
                ? {
                    background:
                      "linear-gradient(135deg, rgba(255,154,90,0.18), rgba(255,92,138,0.18), rgba(122,46,196,0.18))",
                    borderColor: "rgba(255,154,90,0.35)",
                  }
                : undefined
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-5">
                <div
                  className={
                    isSunset
                      ? "flex h-12 w-12 items-center justify-center rounded-xl text-white"
                      : "flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
                  }
                  style={
                    isSunset
                      ? { background: "linear-gradient(135deg,#ff9a5a,#ff5c8a,#7a2ec4)" }
                      : undefined
                  }
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-semibold">{e.title}</h2>
                    {e.badge && (
                      <span
                        className={
                          isSunset
                            ? "rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                            : "rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary"
                        }
                      >
                        {e.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">{e.description}</p>
                </div>
              </div>
              <ChevronRight
                className={
                  isSunset
                    ? "h-5 w-5 shrink-0 transition group-hover:translate-x-1"
                    : "h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-1"
                }
              />
            </div>
          </Link>
        );
      })}

      {grid.length > 0 && (
        <section className="grid gap-4 sm:grid-cols-2">
          {grid.map((e) => {
            const Icon = e.icon;
            return (
              <Link
                key={e.key}
                to={e.to}
                className="group surface-panel flex flex-col gap-4 transition hover:border-primary/40 hover:bg-surface-elevated"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{e.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{e.description}</p>
                </div>
                {e.badge && (
                  <div className="mt-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {e.badge}
                  </div>
                )}
              </Link>
            );
          })}
        </section>
      )}

      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No mini-apps or tabs match "{query}". Try a different keyword.
        </div>
      )}

      {!q && (
        <>
          <HUTTMiniApp />
          <AntiarrhythmicsChart />
        </>
      )}
    </div>
  );
}
