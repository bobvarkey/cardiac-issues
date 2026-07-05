import { Link } from "@tanstack/react-router";
import { HeartPulse, Zap, TrendingDown, Waves, Activity, ChevronRight, Heart, Pill } from "lucide-react";

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
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Adult · In-hospital</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Fast-access cardiac protocols
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Step through common adult cardiac emergencies with branching decisions, drug doses, and
          rhythm-check cycles. Choose a protocol to begin.
        </p>
      </section>

      <Link
        to="/treatment"
        className="group relative block overflow-hidden rounded-xl border border-primary/50 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 transition hover:border-primary hover:from-primary/30"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Treatment Mini App</h2>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                  Featured
                </span>
              </div>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Live, weight-based dosing calculator for AF / VT / VF with stability-first
                recommendations and per-drug mg/mcg outputs.
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-primary transition group-hover:translate-x-1" />
        </div>
      </Link>

      <section className="grid gap-3 sm:grid-cols-2">
        {algorithms.map((a) => {
          const Icon = iconMap[a.id] ?? HeartPulse;
          return (
            <Link
              key={a.id}
              to="/protocol/$id"
              params={{ id: a.id }}
              className="group surface-panel flex flex-col gap-3 p-5 transition hover:border-primary/50 hover:bg-surface-elevated"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold">{a.name}</h2>
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
          className="group surface-panel flex flex-col gap-3 p-5 transition hover:border-primary/50 hover:bg-surface-elevated"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Waves className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Rhythm Reference</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Catalog of common arrhythmias with ECG features and clinical notes.
            </p>
          </div>
        </Link>
        <Link
          to="/goldman"
          className="group surface-panel flex flex-col gap-3 p-5 transition hover:border-primary/50 hover:bg-surface-elevated"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Heart className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Goldman Cardiac Risk Index</h2>
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
          to="/treatment"
          className="group surface-panel flex flex-col gap-3 p-5 transition hover:border-primary/50 hover:bg-surface-elevated"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Pill className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Treatment Mini App</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              AF / VT / VF stability-first recommendations with weight-based dosing and drug cards.
            </p>
          </div>
          <div className="mt-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Decision Support · Dosing
          </div>
        </Link>
      </section>
    </div>
  );
}