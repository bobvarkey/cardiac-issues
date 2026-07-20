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
  text: "Funny, Some Block Potassium Channels Mainly",
  mapping: [
    { word: "Funny", meaning: "HCN (\"funny\" If) channel blockers", cls: "Class 0" },
    { word: "Some", meaning: "Sodium channel blockers", cls: "Class I" },
    { word: "Block", meaning: "Beta blockers", cls: "Class II" },
    { word: "Potassium", meaning: "Potassium channel blockers", cls: "Class III" },
    { word: "Channels", meaning: "Calcium channel blockers", cls: "Class IV" },
    { word: "Mainly", meaning: "Miscellaneous agents", cls: "Class V" },
  ],
};

const classes: ClassEntry[] = [
  {
    key: "Class 0",
    type: "HCN (\"funny\" If) channel blockers",
    mnemonic: "Funny",
    drugs: ["Ivabradine"],
  },
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
  {
    key: "Class V",
    type: "Miscellaneous agents",
    drugs: ["Digoxin", "Adenosine", "Magnesium Sulfate"],
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

      <div className="flex flex-wrap gap-2">
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
                  ? "chip border border-destructive bg-destructive/15 text-destructive font-medium"
                  : isSelected
                  ? "chip border border-primary bg-primary/15 text-primary"
                  : "chip border border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }
            >
              {isConflict && <AlertTriangle className="h-3 w-3 mr-1" />}
              {m.name}
              {isSelected && !isConflict && <X className="h-3 w-3 ml-1 opacity-60" />}
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="mt-4 space-y-3">
          {hits.length === 0 ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
              ✓ No major interaction listed for {details.name} with the selected medication{selected.length > 1 ? "s" : ""}. Always verify clinically.
            </div>
          ) : (
            hits.map((h) => {
              const sevStyle =
                h.severity === "contraindicated"
                  ? "border-destructive bg-destructive/15"
                  : h.severity === "major"
                  ? "border-destructive/50 bg-destructive/10"
                  : "border-amber-500/40 bg-amber-500/10";
              const badgeStyle =
                h.severity === "contraindicated"
                  ? "bg-destructive text-destructive-foreground"
                  : h.severity === "major"
                  ? "bg-destructive/80 text-destructive-foreground"
                  : "bg-amber-500/90 text-white";
              const actionStyle =
                h.action === "avoid"
                  ? "border-destructive/50 text-destructive"
                  : "border-amber-500/50 text-amber-700 dark:text-amber-400";
              return (
                <div
                  key={h.companion.name}
                  className={`rounded-xl border p-4 ${sevStyle}`}
                >
                  <div className="flex flex-wrap items-center gap-2 font-medium">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span>{details.name} + {h.companion.name}</span>
                    <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${badgeStyle}`}>
                      {h.severity}
                    </span>
                    <span className={`rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${actionStyle}`}>
                      {h.action === "avoid" ? "Avoid" : "Monitor"}
                    </span>
                    <span className="ml-auto font-mono text-[10px] uppercase text-muted-foreground">
                      {h.companion.category}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 pl-6">
                    {h.matches.map((m) => (
                      <li key={m} className="list-disc">{m}</li>
                    ))}
                  </ul>
                  <div className="mt-3 rounded-lg border border-border bg-surface p-3">
                    <div className="font-semibold uppercase tracking-wider text-[10px] text-primary">Management</div>
                    <div className="mt-1 text-sm">{h.companion.management}</div>
                  </div>
                  <div className="mt-2 rounded-lg border border-border bg-surface/60 p-3">
                    <div className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">Rationale</div>
                    <div className="mt-1 text-sm text-muted-foreground">{h.companion.rationale}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </section>
  );
}


function DrugDetailsBody({ details }: { details: DrugDetails }) {
  return (
    <div className="mt-4 space-y-6">
      <div className="rounded-xl border border-border bg-surface-elevated p-4">
        <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
          {details.classKey}
        </div>
        <div className="text-base font-medium">{details.className}</div>
        {details.mnemonic && (
          <div className="mt-2 rounded-lg bg-primary/10 px-3 py-1.5 font-mono text-xs text-primary">
            Mnemonic: {details.mnemonic}
          </div>
        )}
      </div>

      <section>
        <div className="section-label">
          <Stethoscope className="h-3.5 w-3.5" /> Common indications
        </div>
        <ul className="space-y-1.5">
          {details.indications.map((i) => (
            <li key={i} className="flex gap-2.5">
              <span className="text-primary">•</span>
              <span>{i}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="section-label text-amber-600 dark:text-amber-500">
          <Ban className="h-3.5 w-3.5" /> Contraindications
        </div>
        <ul className="space-y-1.5">
          {details.contraindications.map((c) => (
            <li key={c} className="flex gap-2.5">
              <span className="text-amber-600 dark:text-amber-500">•</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="section-label">
          <Pill className="h-3.5 w-3.5" /> Dosing & routes
        </div>
        <div className="space-y-2">
          {details.dosing.map((d) => (
            <div key={d.route + d.dose} className="rounded-lg border border-border bg-surface p-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-primary">{d.route}</div>
              <div className="mt-0.5">{d.dose}</div>
              {d.notes && <div className="text-xs text-muted-foreground mt-1">{d.notes}</div>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="section-label text-destructive">
          <AlertTriangle className="h-3.5 w-3.5" /> Adverse effects
        </div>
        <ul className="space-y-1.5">
          {details.adverse.map((a) => (
            <li key={a} className="flex gap-2.5">
              <span className="text-destructive">•</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="section-label">
          <Link2 className="h-3.5 w-3.5" /> Major interactions
        </div>
        <ul className="space-y-1.5">
          {details.interactions.map((i) => (
            <li key={i} className="flex gap-2.5">
              <span className="text-primary">•</span>
              <span>{i}</span>
            </li>
          ))}
        </ul>
      </section>

      <InteractionChecker key={details.name} details={details} />


      <section>
        <div className="section-label">
          <Activity className="h-3.5 w-3.5" /> Monitoring checklist
        </div>
        <ul className="space-y-2.5">
          {details.monitoring.map((m) => (
            <li key={m.watch} className="rounded-lg border border-border bg-surface p-3">
              <div className="flex gap-2.5">
                <span className="text-primary">☐</span>
                <span>{m.watch}</span>
              </div>
              {m.stopOrEscalate && (
                <div className="mt-2 ml-7 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
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
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
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
    <section className="surface-panel space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Anti-arrhythmic drugs</h1>
          <p className="mt-1 text-muted-foreground">
            Vaughan-Williams classification with memory hooks. Tap any drug for details.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <div className="font-mono text-[11px] uppercase tracking-wider text-primary/80">Mnemonic</div>
        <div className="mt-1 text-xl font-semibold">"{overallMnemonic.text}"</div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {overallMnemonic.mapping.map((m) => (
            <div
              key={m.word}
              className="flex items-baseline gap-2 rounded-lg border border-border bg-surface px-3 py-2.5"
            >
              <span className="font-mono text-sm font-medium text-primary">{m.word}</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-sm">{m.meaning}</span>
              <span className="ml-auto font-mono text-[10px] uppercase text-muted-foreground">
                {m.cls}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface-elevated p-5 space-y-4">
        <div className="section-label">
          Vaughan-Williams Classification
        </div>
        <img
          src="/images/antiarrhythmics-classification.jpg"
          alt="Vaughan-Williams Antiarrhythmic Drug Classification"
          className="w-full h-auto rounded-lg"
        />
        <div>
          <div className="section-label mt-2">
            Targets of different anti-arrhythmic classes
          </div>
          <img
            src="/images/antiarrhythmics-targets.png"
            alt="Targets of different anti-arrhythmic classes — cellular schematic showing Class 0 (HCN/If), Class 1 (Na+), Class 2 (β-adrenergic), Class 3 (K+), and Class 4 (L-type Ca2+) channels"
            className="w-full h-auto rounded-lg border border-border"
            loading="lazy"
          />
          <p className="mt-2 text-xs text-muted-foreground italic">
            Schematic mapping each Vaughan-Williams class to its ionic target. Class 0 (ivabradine, If/HCN) is a modern addition to the classic scheme.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {classes.map((c) => {
          const calcDrug = classHasCalculatorDrug(c);
          return (
            <div
              key={c.key}
              className="rounded-xl border border-border bg-surface-elevated p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
                    {c.key}
                  </div>
                  <h3 className="text-base font-semibold">{c.type}</h3>
                </div>
                {c.mnemonic && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 font-mono text-[11px] text-primary">
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
                      className="rounded-lg border border-border bg-surface p-3"
                    >
                      <div className="flex items-baseline justify-between">
                        <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                          Class {s.key}
                        </div>
                        <div className="font-mono text-[10px] text-primary">"{s.mnemonic}"</div>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
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
