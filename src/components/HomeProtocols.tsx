import { Link } from "@tanstack/react-router";
import { HeartPulse, Zap, TrendingDown, Waves, Activity, ChevronRight, Heart, Pill } from "lucide-react";

import { AntiarrhythmicsChart } from "@/components/AntiarrhythmicsChart";
import { algorithms } from "@/data/cardiac";

const iconMap: Record<string, typeof HeartPulse> = {
  "code-blue": HeartPulse,
  tachycardia: Zap,
  bradycardia: TrendingDown,
  "atrial-fibrillation": Waves,
  pvc: Activity,
};

export function HomeProtocols() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Adult · In-hospital</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Fast-access cardiac protocols
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Step through common adult cardiac emergencies with branching decisions, drug doses, and
          rhythm-check cycles. Choose a protocol to begin.
        </p>
      </section>

      <Link
        to="/treatment"
        className="group relative block overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 transition hover:border-primary hover:from-primary/25"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-semibold">Treatment Mini App</h2>
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                  Featured
                </span>
              </div>
              <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
                Live, weight-based dosing calculator for AF / VT / VF with stability-first
                recommendations and per-drug mg/mcg outputs.
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-1" />
        </div>
      </Link>

      <Link
        to="/medcalc"
        className="group relative block overflow-hidden rounded-xl border p-6 transition hover:opacity-95"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,154,90,0.18), rgba(255,92,138,0.18), rgba(122,46,196,0.18))",
          borderColor: "rgba(255,154,90,0.35)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-5">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
              style={{ background: "linear-gradient(135deg,#ff9a5a,#ff5c8a,#7a2ec4)" }}
            >
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-semibold">MedCalc</h2>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                  Sunset Blaze
                </span>
              </div>
              <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
                Warm, mobile-styled clinical calculators — BMI, MAP, CrCl, QTc, CHA₂DS₂-VASc — with
                local history, live results, and a glass UI.
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
        </div>
      </Link>

      <section className="grid gap-4 sm:grid-cols-2">
        {algorithms.map((a) => {
          const Icon = iconMap[a.id] ?? HeartPulse;
          return (
            <Link
              key={a.id}
              to="/protocol/$id"
              params={{ id: a.id }}
              className="group surface-panel flex flex-col gap-4 transition hover:border-primary/40 hover:bg-surface-elevated"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{a.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.summary}</p>
              </div>
              {a.context && (
                <div className="mt-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {a.context}
                </div>
              )}
            </Link>
          );
        })}
        <Link
          to="/rhythms"
          className="group surface-panel flex flex-col gap-4 transition hover:border-primary/40 hover:bg-surface-elevated"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Waves className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Rhythm Reference</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Catalog of common arrhythmias with ECG features and clinical notes.
            </p>
          </div>
        </Link>
        <Link
          to="/goldman"
          className="group surface-panel flex flex-col gap-4 transition hover:border-primary/40 hover:bg-surface-elevated"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Heart className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Goldman Cardiac Risk Index</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Pre-operative cardiac risk stratification with ECG patterns, anti-arrhythmics, and ACLS
              algorithms.
            </p>
          </div>
          <div className="mt-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Pre-operative · Risk Calculator
          </div>
        </Link>
        <Link
          to="/antiarrhythmics"
          className="group surface-panel flex flex-col gap-4 transition hover:border-primary/40 hover:bg-surface-elevated"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Anti-arrhythmic drugs</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Vaughan-Williams classes with mnemonics. Tap a drug to preselect it in the dosing
              calculator.
            </p>
          </div>
          <div className="mt-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Reference · Mnemonics
          </div>
        </Link>
      </section>

      <AntiarrhythmicsChart />
    </div>
  );
}