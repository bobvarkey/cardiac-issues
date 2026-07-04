import { Link, createFileRoute } from "@tanstack/react-router";
import { HeartPulse, Zap, TrendingDown, Waves, Activity, ChevronRight } from "lucide-react";
import { algorithms } from "@/data/cardiac";

export const Route = createFileRoute("/_layout/")({
  head: () => ({
    meta: [
      { title: "CardiacRef — Clinical Cardiac Protocols" },
      {
        name: "description",
        content:
          "Interactive bedside reference for adult cardiac emergencies: Code Blue, tachycardia, bradycardia, atrial fibrillation, and ventricular ectopy.",
      },
      { property: "og:title", content: "CardiacRef — Clinical Cardiac Protocols" },
      {
        property: "og:description",
        content: "Interactive bedside reference for common adult cardiac emergencies.",
      },
    ],
  }),
  component: Home,
});

const iconMap: Record<string, typeof HeartPulse> = {
  "code-blue": HeartPulse,
  tachycardia: Zap,
  bradycardia: TrendingDown,
  "atrial-fibrillation": Waves,
  pvc: Activity,
};

function Home() {
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
      </section>
    </div>
  );
}
