import { useMemo, useState } from "react";
import type { Algorithm, Section } from "@/data/cardiac";
import { hsAndTs } from "@/data/cardiac";
import { ChevronRight, RotateCcw, AlertTriangle } from "lucide-react";

export function AlgorithmView({ algo }: { algo: Algorithm }) {
  const [path, setPath] = useState<string[]>([algo.sections[0].id]);
  const byId = useMemo(
    () => Object.fromEntries(algo.sections.map((s) => [s.id, s])) as Record<string, Section>,
    [algo],
  );

  const goto = (id: string) => setPath((p) => [...p, id]);
  const reset = () => setPath([algo.sections[0].id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Interactive protocol</span>
        </div>
        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground hover:border-primary/40"
        >
          <RotateCcw className="h-3 w-3" /> Restart
        </button>
      </div>

      <div className="space-y-3">
        {path.map((id, idx) => {
          const section = byId[id];
          if (!section) return null;
          const isLast = idx === path.length - 1;
          return (
            <StepCard
              key={`${id}-${idx}`}
              section={section}
              index={idx + 1}
              active={isLast}
              onGoto={goto}
            />
          );
        })}
      </div>
    </div>
  );
}

function StepCard({
  section,
  index,
  active,
  onGoto,
}: {
  section: Section;
  index: number;
  active: boolean;
  onGoto: (id: string) => void;
}) {
  return (
    <div
      className={`surface-panel p-5 transition ${
        active ? "border-primary/40 shadow-[0_0_0_1px_var(--color-primary)]" : "opacity-70"
      }`}
    >
      <div className="mb-3 flex items-baseline gap-3">
        <span className="font-mono text-xs text-primary">{String(index).padStart(2, "0")}</span>
        <h3 className="text-lg font-semibold">{section.label}</h3>
      </div>

      {section.criteria && (
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Object.entries(section.criteria).map(([k, v]) => (
            <div key={k} className="rounded-md bg-muted px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
              <div className="mt-0.5 font-mono text-sm">{String(v)}</div>
            </div>
          ))}
        </div>
      )}

      {section.actions && (
        <ul className="space-y-1.5">
          {section.actions.map((a) => (
            <li key={a} className="flex items-start gap-2 text-sm">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      )}

      {section.details && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {Object.entries(section.details).map(([k, v]) => (
            <div key={k} className="rounded-md border border-border px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
              <div className="mt-0.5 font-mono text-sm">{String(v)}</div>
            </div>
          ))}
        </div>
      )}

      {section.parameters && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.entries(section.parameters).map(([k, v]) => (
            <div key={k} className="rounded-md border border-border bg-muted/40 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</div>
              <div className="mt-0.5 font-mono text-sm">{String(v)}</div>
            </div>
          ))}
        </div>
      )}

      {section.loop && (
        <div className="mt-4 space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            {section.loop.cycle_minutes}-minute cycle
          </div>
          {section.loop.sequence.map((s, i) => (
            <div key={i} className="rounded-md border border-border bg-surface-elevated px-3 py-2">
              <div className="text-sm font-medium">{s.action}</div>
              {s.drug && (
                <div className="mt-0.5 font-mono text-xs text-primary">
                  {s.drug} — {s.dose}
                </div>
              )}
              {s.duration_minutes && (
                <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {s.duration_minutes} min
                </div>
              )}
              {s.parameters && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {Object.entries(s.parameters).map(([k, v]) => (
                    <span key={k} className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                      {k}: {String(v)}
                    </span>
                  ))}
                </div>
              )}
              {s.details && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {Object.entries(s.details).map(([k, v]) => (
                    <span key={k} className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                      {k}: {String(v)}
                    </span>
                  ))}
                </div>
              )}
              {s.options && (
                <div className="mt-2 space-y-1">
                  {s.options.map((o) => (
                    <div key={o.drug} className="font-mono text-xs">
                      <span className="text-primary">{o.drug}:</span>{" "}
                      <span className="text-muted-foreground">{o.dose_sequence.join(" → ")}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {section.loop.sequence.some((s) => s.action.toLowerCase().includes("reversible")) && (
            <HsAndTsGrid />
          )}
        </div>
      )}

      {section.notes && (
        <div className="mt-3 flex gap-2 rounded-md border border-warn/40 bg-warn/10 p-3 text-xs text-warn">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div className="space-y-1">
            {section.notes.map((n) => (
              <div key={n}>{n}</div>
            ))}
          </div>
        </div>
      )}

      {section.branches && active && (
        <div className="mt-4 grid gap-2">
          {section.branches.map((b) => (
            <button
              key={b.goto}
              onClick={() => onGoto(b.goto)}
              className={`group flex items-center justify-between rounded-md border px-4 py-3 text-left text-sm font-medium transition hover:translate-x-0.5 ${
                b.tone === "danger"
                  ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : b.tone === "warn"
                    ? "border-warn/40 bg-warn/10 text-warn hover:bg-warn/20"
                    : b.tone === "ok"
                      ? "border-ok/40 bg-ok/10 text-ok hover:bg-ok/20"
                      : "border-border bg-surface hover:border-primary/40"
              }`}
            >
              <span>{b.label}</span>
              <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function HsAndTsGrid() {
  return (
    <div className="mt-2 rounded-md border border-border bg-surface-elevated p-3">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
        Reversible causes — Hs & Ts
      </div>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
        {hsAndTs.map((c) => (
          <div key={c} className="flex items-center gap-1.5 text-xs">
            <span className="h-1 w-1 rounded-full bg-primary" />
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}
