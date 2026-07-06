import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Zap, ArrowRight, AlertTriangle, Activity, Stethoscope, Calculator, Ban, Pill, Link2, ShieldAlert, X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { CALCULATOR_DRUGS, DRUG_DETAILS, type DrugDetails } from "@/lib/antiarrhythmic-details";
import { COMPANION_MEDS, findInteractions } from "@/lib/interaction-checker";

type Subclass = { key: string; mnemonic: string; drugs: string[] };
type ClassEntry = {
  key: string;
  type: string;
  mnemonic?: string;
  drugs?: string[];
  subclasses?: Subclass[];
};

const overallMnemonic = {
  text: "Some Block Potassium Channels",
  mapping: [
    { word: "Some", meaning: "Sodium channel blockers", cls: "Class I" },
    { word: "Block", meaning: "Beta blockers", cls: "Class II" },
    { word: "Potassium", meaning: "Potassium channel blockers", cls: "Class III" },
    { word: "Channels", meaning: "Calcium channel blockers", cls: "Class IV" },
  ],
};

const classes: ClassEntry[] = [
  {
    key: "Class I",
    type: "Na+ channel blockers",
    subclasses: [
      { key: "Ia", mnemonic: "Quinidine", drugs: ["Quinidine", "Procainamide", "Disopyramide"] },
      { key: "Ib", mnemonic: "likes", drugs: ["Lidocaine", "Mexiletine"] },
      { key: "Ic", mnemonic: "fever", drugs: ["Flecainide", "Propafenone"] },
    ],
  },
  {
    key: "Class II",
    type: "Beta blockers",
    mnemonic: "LOL",
    drugs: ["Propranolol", "Metoprolol", "Atenolol"],
  },
  {
    key: "Class III",
    type: "K+ channel blockers",
    mnemonic: "AIDS",
    drugs: ["Amiodarone", "Ibutilide", "Dofetilide", "Sotalol"],
  },
  {
    key: "Class IV",
    type: "Ca2+ channel blockers",
    drugs: ["Verapamil", "Diltiazem"],
  },
];

function DrugChip({ name, onOpen }: { name: string; onOpen: (name: string) => void }) {
  const inCalc = CALCULATOR_DRUGS.has(name);
  return (
    <button
      type="button"
      onClick={() => onOpen(name)}
      className={
        inCalc
          ? "rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs text-primary transition hover:border-primary hover:bg-primary/20"
          : "rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
      }
      title={`Details for ${name}`}
    >
      {name}
    </button>
  );
}

function classHasCalculatorDrug(c: ClassEntry): string | null {
  const all = [...(c.drugs ?? []), ...(c.subclasses?.flatMap((s) => s.drugs) ?? [])];
  return all.find((d) => CALCULATOR_DRUGS.has(d)) ?? null;
}

function InteractionChecker({ details }: { details: DrugDetails }) {
  const [selected, setSelected] = useState<string[]>([]);


  const hits = useMemo(() => findInteractions(details, selected), [details, selected]);
  const hitNames = new Set(hits.map((h) => h.companion.name));

  const toggle = (name: string) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );

  return (
    <section>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <ShieldAlert className="h-3.5 w-3.5" /> Interaction checker
      </div>
      <p className="mb-2 text-xs text-muted-foreground">
        Select any co-administered medications to see real-time conflicts with{" "}
        <span className="font-medium text-foreground">{details.name}</span>.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {COMPANION_MEDS.map((m) => {
          const isSelected = selected.includes(m.name);
          const isConflict = isSelected && hitNames.has(m.name);
          return (
            <button
              key={m.name}
              type="button"
              onClick={() => toggle(m.name)}
              className={
                isConflict
                  ? "inline-flex items-center gap-1 rounded-md border border-destructive bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive"
                  : isSelected
                  ? "inline-flex items-center gap-1 rounded-md border border-primary bg-primary/15 px-2 py-0.5 text-xs text-primary"
                  : "rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              }
            >
              {isConflict && <AlertTriangle className="h-3 w-3" />}
              {m.name}
              {isSelected && !isConflict && <X className="h-3 w-3 opacity-60" />}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="mt-3 space-y-2">
          {hits.length === 0 ? (
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400">
              ✓ No major interaction listed for {details.name} with the selected medication{selected.length > 1 ? "s" : ""}. Always verify clinically.
            </div>
          ) : (
            hits.map((h) => (
              <div
                key={h.companion.name}
                className="rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-sm"
              >
                <div className="flex items-center gap-2 font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {details.name} + {h.companion.name}
                  <span className="ml-auto font-mono text-[10px] uppercase text-destructive/80">
                    {h.companion.category}
                  </span>
                </div>
                <ul className="mt-1.5 space-y-1 pl-6 text-xs text-foreground">
                  {h.matches.map((m) => (
                    <li key={m} className="list-disc">{m}</li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}


function DrugDetailsBody({ details }: { details: DrugDetails }) {
  return (
    <div className="mt-4 space-y-5">
      <div className="rounded-lg border border-border bg-surface-elevated p-3">
        <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
          {details.classKey}
        </div>
        <div className="text-sm font-medium">{details.className}</div>
        {details.mnemonic && (
          <div className="mt-2 rounded-md bg-primary/10 px-2 py-1 font-mono text-xs text-primary">
            Mnemonic: {details.mnemonic}
          </div>
        )}
      </div>

      <section>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Stethoscope className="h-3.5 w-3.5" /> Common indications
        </div>
        <ul className="space-y-1 text-sm">
          {details.indications.map((i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{i}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">
          <Ban className="h-3.5 w-3.5" /> Contraindications
        </div>
        <ul className="space-y-1 text-sm">
          {details.contraindications.map((c) => (
            <li key={c} className="flex gap-2">
              <span className="text-amber-600 dark:text-amber-500">•</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Pill className="h-3.5 w-3.5" /> Dosing & routes
        </div>
        <div className="space-y-1.5">
          {details.dosing.map((d) => (
            <div key={d.route + d.dose} className="rounded-md border border-border bg-background p-2 text-sm">
              <div className="font-mono text-[10px] uppercase tracking-wider text-primary">{d.route}</div>
              <div>{d.dose}</div>
              {d.notes && <div className="text-xs text-muted-foreground">{d.notes}</div>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" /> Adverse effects
        </div>
        <ul className="space-y-1 text-sm">
          {details.adverse.map((a) => (
            <li key={a} className="flex gap-2">
              <span className="text-destructive">•</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Link2 className="h-3.5 w-3.5" /> Major interactions
        </div>
        <ul className="space-y-1 text-sm">
          {details.interactions.map((i) => (
            <li key={i} className="flex gap-2">
              <span className="text-primary">•</span>
              <span>{i}</span>
            </li>
          ))}
        </ul>
      </section>

      <InteractionChecker details={details} />


      <section>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Activity className="h-3.5 w-3.5" /> Monitoring checklist
        </div>
        <ul className="space-y-2 text-sm">
          {details.monitoring.map((m) => (
            <li key={m.watch} className="rounded-md border border-border bg-background p-2">
              <div className="flex gap-2">
                <span className="text-primary">☐</span>
                <span>{m.watch}</span>
              </div>
              {m.stopOrEscalate && (
                <div className="mt-1 ml-5 rounded bg-destructive/10 px-2 py-1 text-xs text-destructive">
                  ⚠ {m.stopOrEscalate}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>


      {CALCULATOR_DRUGS.has(details.name) && (
        <Link
          to="/treatment"
          search={{ drug: details.name }}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <Calculator className="h-4 w-4" />
          Open in dosing calculator
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function AntiarrhythmicsChart() {
  const [openDrug, setOpenDrug] = useState<string | null>(null);
  const details = openDrug ? DRUG_DETAILS[openDrug] : null;

  return (
    <section className="surface-panel p-5 space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Anti-arrhythmic drugs</h2>
          <p className="text-sm text-muted-foreground">
            Vaughan-Williams classification with memory hooks. Tap any drug for class,
            indications, adverse effects, and monitoring.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div className="font-mono text-xs uppercase tracking-wider text-primary">Mnemonic</div>
        <div className="mt-1 text-lg font-semibold">"{overallMnemonic.text}"</div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {overallMnemonic.mapping.map((m) => (
            <div
              key={m.word}
              className="flex items-baseline gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <span className="font-mono text-primary">{m.word}</span>
              <span className="text-muted-foreground">→ {m.meaning}</span>
              <span className="ml-auto font-mono text-[10px] uppercase text-muted-foreground">
                {m.cls}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {classes.map((c) => {
          const calcDrug = classHasCalculatorDrug(c);
          return (
            <div
              key={c.key}
              className="rounded-lg border border-border bg-surface-elevated p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
                    {c.key}
                  </div>
                  <h3 className="font-semibold">{c.type}</h3>
                </div>
                {c.mnemonic && (
                  <span className="rounded-full bg-primary/15 px-2 py-1 font-mono text-xs text-primary">
                    {c.mnemonic}
                  </span>
                )}
              </div>

              {c.subclasses && (
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    Sub-mnemonic:{" "}
                    <span className="font-mono text-primary">
                      {c.subclasses.map((s) => s.mnemonic).join(" ")}
                    </span>{" "}
                    · <span className="italic">(Quinidine likes fever)</span>
                  </div>
                  {c.subclasses.map((s) => (
                    <div
                      key={s.key}
                      className="rounded-md border border-border bg-background p-3"
                    >
                      <div className="flex items-baseline justify-between">
                        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                          Class {s.key}
                        </div>
                        <div className="font-mono text-[10px] text-primary">"{s.mnemonic}"</div>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {s.drugs.map((d) => (
                          <DrugChip key={d} name={d} onOpen={setOpenDrug} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {c.drugs && c.drugs.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {c.drugs.map((d) => (
                    <DrugChip key={d} name={d} onOpen={setOpenDrug} />
                  ))}
                </div>
              )}

              {calcDrug && (
                <Link
                  to="/treatment"
                  search={{ drug: calcDrug }}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  Open in dosing calculator →
                </Link>
              )}
            </div>
          );
        })}
      </div>

      <Sheet open={!!openDrug} onOpenChange={(o) => !o && setOpenDrug(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {details ? (
            <>
              <SheetHeader>
                <SheetTitle>{details.name}</SheetTitle>
                <SheetDescription>{details.classKey} · {details.className}</SheetDescription>
              </SheetHeader>
              <DrugDetailsBody details={details} />
            </>
          ) : openDrug ? (
            <>
              <SheetHeader>
                <SheetTitle>{openDrug}</SheetTitle>
                <SheetDescription>Details not yet available for this drug.</SheetDescription>
              </SheetHeader>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </section>
  );
}
