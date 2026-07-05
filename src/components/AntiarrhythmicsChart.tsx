import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

type Subclass = { key: string; mnemonic: string; drugs: string[] };
type ClassEntry = {
  key: string;
  type: string;
  mnemonic?: string;
  drugs?: string[];
  subclasses?: Subclass[];
};

// Drugs that exist in the TreatmentMiniApp dosing calculator.
const CALCULATOR_DRUGS = new Set([
  "Diltiazem",
  "Metoprolol",
  "Esmolol",
  "Digoxin",
  "Amiodarone",
]);

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
      { key: "Ia", mnemonic: "Quinine", drugs: ["Quinidine", "Procainamide", "Disopyramide"] },
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

function DrugChip({ name }: { name: string }) {
  if (CALCULATOR_DRUGS.has(name)) {
    return (
      <Link
        to="/treatment"
        search={{ drug: name }}
        className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs text-primary transition hover:border-primary hover:bg-primary/20"
        title={`Open ${name} in dosing calculator`}
      >
        {name} →
      </Link>
    );
  }
  return (
    <span className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
      {name}
    </span>
  );
}

function classHasCalculatorDrug(c: ClassEntry): string | null {
  const all = [...(c.drugs ?? []), ...(c.subclasses?.flatMap((s) => s.drugs) ?? [])];
  return all.find((d) => CALCULATOR_DRUGS.has(d)) ?? null;
}

export function AntiarrhythmicsChart() {
  return (
    <section className="surface-panel p-5 space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Anti-arrhythmic drugs</h2>
          <p className="text-sm text-muted-foreground">
            Vaughan-Williams classification with memory hooks. Tap a highlighted drug to preselect
            it in the dosing calculator.
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
                          <DrugChip key={d} name={d} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {c.drugs && c.drugs.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {c.drugs.map((d) => (
                    <DrugChip key={d} name={d} />
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
    </section>
  );
}
