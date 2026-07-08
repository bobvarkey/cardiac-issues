import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";

type Arrhythmia = "AF" | "VT" | "VF" | "SVT" | "AFlutter" | "MAT" | "Junctional";

type DoseRule = {
  key: string;
  label: string;
  // returns computed dose string; if perKg provided, computed from weight
  compute: (weight: number) => { value: string; detail?: string };
  reference: string;
};

type Drug = {
  name: string;
  class: string;
  indications: string[];
  doseRules: DoseRule[];
  comments: string;
};

const round = (n: number, d = 1) => {
  const f = Math.pow(10, d);
  return Math.round(n * f) / f;
};

const drugs: Drug[] = [
  {
    name: "Adenosine",
    class: "Purinergic agonist (AV nodal blocker)",
    indications: ["SVT termination", "SVT diagnostic"],
    doseRules: [
      {
        key: "first_dose",
        label: "First dose (rapid bolus)",
        compute: () => ({ value: "6 mg IV rapid push", detail: "flush with 20 mL saline" }),
        reference: "6 mg IV rapid push",
      },
      {
        key: "second_dose",
        label: "Second dose (if no response)",
        compute: () => ({ value: "12 mg IV rapid push", detail: "may repeat once" }),
        reference: "12 mg IV rapid push",
      },
      {
        key: "third_dose",
        label: "Third dose (if no response)",
        compute: () => ({ value: "12 mg IV rapid push", detail: "max 2 doses of 12 mg" }),
        reference: "12 mg IV (max single dose)",
      },
    ],
    comments: "Must be rapid IV push via large vein; avoid in WPW with AF; monitor ECG continuously.",
  },
  {
    name: "Verapamil",
    class: "Non-dihydropyridine CCB",
    indications: ["SVT termination", "Rate control in AF/SVT"],
    doseRules: [
      {
        key: "initial",
        label: "Initial dose",
        compute: () => ({ value: "2.5–5 mg IV over 2 min", detail: "may repeat" }),
        reference: "2.5–5 mg IV over 2 min",
      },
      {
        key: "repeat",
        label: "Repeat dose",
        compute: () => ({ value: "5–10 mg IV in 15–30 min", detail: "max 20 mg" }),
        reference: "5–10 mg IV, max 20 mg",
      },
      {
        key: "infusion",
        label: "Infusion (if needed)",
        compute: () => ({ value: "5–10 mg/hr IV", detail: "for refractory" }),
        reference: "5–10 mg/hr IV",
      },
    ],
    comments: "Avoid in WPW with AF; negative inotrope — use cautiously in HF or hypotension.",
  },
  {
    name: "Diltiazem",
    class: "Non-dihydropyridine CCB",
    indications: ["Rate control in AF", "SVT termination"],
    doseRules: [
      {
        key: "iv_bolus",
        label: "IV bolus",
        compute: (w) => ({ value: `${round(0.25 * w)} mg IV over 2 min`, detail: "0.25 mg/kg" }),
        reference: "0.25 mg/kg IV over 2 min",
      },
      {
        key: "repeat_bolus",
        label: "Repeat bolus (if HR > 90 after 15 min)",
        compute: (w) => ({ value: `${round(0.35 * w)} mg IV`, detail: "0.35 mg/kg" }),
        reference: "0.35 mg/kg IV",
      },
      {
        key: "infusion",
        label: "Maintenance infusion",
        compute: () => ({ value: "5–15 mg/hr IV", detail: "fixed range" }),
        reference: "5–15 mg/hr IV",
      },
    ],
    comments: "Negative inotrope; use cautiously in HF or hypotension.",
  },
  {
    name: "Metoprolol",
    class: "Beta-blocker",
    indications: ["Rate control in AF", "Hyperadrenergic states"],
    doseRules: [
      {
        key: "iv_bolus",
        label: "IV bolus",
        compute: () => ({ value: "2.5–5 mg IV over 2 min", detail: "not weight-based" }),
        reference: "2.5–5 mg IV",
      },
      {
        key: "repeat",
        label: "Repeat dose",
        compute: () => ({ value: "Repeat q5–10 min × up to 3", detail: "max 15 mg" }),
        reference: "q5–10 min × 3",
      },
    ],
    comments: "Useful when sympathetic drive is high.",
  },
  {
    name: "Esmolol",
    class: "Ultra-short acting beta-blocker",
    indications: ["Rapid titration rate control"],
    doseRules: [
      {
        key: "bolus",
        label: "Loading bolus",
        compute: (w) => ({
          value: `${round(500 * w)} mcg (${round((500 * w) / 1000, 2)} mg) IV`,
          detail: "500 mcg/kg",
        }),
        reference: "500 mcg/kg IV",
      },
      {
        key: "infusion_start",
        label: "Infusion (start)",
        compute: (w) => ({
          value: `${round(50 * w)} mcg/min = ${round((50 * w * 60) / 1000)} mg/hr`,
          detail: "50 mcg/kg/min",
        }),
        reference: "50 mcg/kg/min",
      },
      {
        key: "infusion_max",
        label: "Infusion (max)",
        compute: (w) => ({
          value: `${round(200 * w)} mcg/min = ${round((200 * w * 60) / 1000)} mg/hr`,
          detail: "200 mcg/kg/min",
        }),
        reference: "up to 200 mcg/kg/min",
      },
    ],
    comments: "Titrate by 25 mcg/kg/min every 5 min.",
  },
  {
    name: "Digoxin",
    class: "Cardiac glycoside",
    indications: ["AF with HF or low BP"],
    doseRules: [
      {
        key: "loading",
        label: "Loading",
        compute: () => ({ value: "0.25 mg IV q2h to total 1.5 mg", detail: "fixed" }),
        reference: "0.25 mg IV q2h → 1.5 mg total",
      },
      {
        key: "maintenance",
        label: "Maintenance",
        compute: () => ({ value: "0.125–0.375 mg PO daily", detail: "fixed" }),
        reference: "0.125–0.375 mg daily",
      },
    ],
    comments: "Slow onset; not ideal as sole acute agent.",
  },
  {
    name: "Amiodarone",
    class: "Class III antiarrhythmic",
    indications: ["AF rhythm control", "VT/VF"],
    doseRules: [
      {
        key: "bolus",
        label: "Loading bolus",
        compute: () => ({ value: "150 mg IV over 10 min", detail: "fixed" }),
        reference: "150 mg IV over 10 min",
      },
      {
        key: "infusion1",
        label: "Infusion phase 1",
        compute: () => ({ value: "1 mg/min × 6 hr = 360 mg", detail: "fixed" }),
        reference: "1 mg/min × 6 hr",
      },
      {
        key: "infusion2",
        label: "Infusion phase 2",
        compute: () => ({ value: "0.5 mg/min × 18 hr = 540 mg", detail: "fixed" }),
        reference: "0.5 mg/min × 18 hr",
      },
      {
        key: "arrest",
        label: "Cardiac arrest (VF/pulseless VT)",
        compute: () => ({ value: "300 mg IV push, then 150 mg", detail: "fixed" }),
        reference: "300 mg → 150 mg IV push",
      },
    ],
    comments: "Do not exceed ~2.2 g / 24 hr.",
  },
];

function hasInstability(s: {
  hypotension: boolean;
  shock: boolean;
  pulmonaryEdema: boolean;
  ischemicPain: boolean;
  alteredSensorium: boolean;
}) {
  return Object.values(s).some(Boolean);
}

export function TreatmentMiniApp() {
  const search = useSearch({ strict: false }) as { drug?: string };
  const initialDrug = drugs.find((d) => d.name === search.drug)?.name ?? drugs[0].name;

  const [arrhythmia, setArrhythmia] = useState<Arrhythmia>("AF");
  const [weight, setWeight] = useState<number>(70);
  const [afDuration, setAfDuration] = useState<number>(24);
  const [ef, setEf] = useState<number>(60);
  const [selectedDrug, setSelectedDrug] = useState<string>(initialDrug);

  useEffect(() => {
    if (search.drug && drugs.some((d) => d.name === search.drug)) {
      setSelectedDrug(search.drug);
    }
  }, [search.drug]);

  const [unstable, setUnstable] = useState({
    hypotension: false,
    shock: false,
    pulmonaryEdema: false,
    ischemicPain: false,
    alteredSensorium: false,
  });

  const unstableNow = useMemo(() => hasInstability(unstable), [unstable]);
  const safeWeight = Number.isFinite(weight) && weight > 0 ? weight : 0;

  const recommendation = useMemo(() => {
    if (unstableNow) {
      return {
        title: "Immediate synchronized DC cardioversion",
        note: "Hemodynamic instability present.",
      };
    }
    if (arrhythmia === "AF") {
      if (afDuration >= 48) {
        return {
          title: "Anticoagulate 3 weeks or use TEE-guided cardioversion",
          note: "AF duration is 48 hours or more / unknown.",
        };
      }
      if (ef <= 35) {
        return {
          title: "Prefer amiodarone for rhythm control",
          note: "Reduced EF or structural heart disease.",
        };
      }
      return {
        title: "Rate control or rhythm control based on symptoms",
        note: "Stable AF with duration under 48 hours.",
      };
    }
    if (arrhythmia === "VT") {
      return { title: "Follow ACLS VT algorithm", note: "Assess pulse and stability first." };
    }
    if (arrhythmia === "VF") {
      return { title: "Defibrillation + CPR if pulseless VF", note: "Treat as a shockable rhythm." };
    }
    if (arrhythmia === "SVT") {
      return {
        title: "Vagal maneuvers → Adenosine → CCB/BB",
        note: "If regular narrow-complex tachycardia without pre-excitation.",
      };
    }
    if (arrhythmia === "AFlutter") {
      if (afDuration >= 48) {
        return {
          title: "Anticoagulate or TEE before cardioversion",
          note: "Atrial flutter carries similar thromboembolic risk as AF.",
        };
      }
      return {
        title: "Rate control (CCB/BB) or rhythm control",
        note: "Consider typical vs atypical flutter for ablation planning.",
      };
    }
    if (arrhythmia === "MAT") {
      return {
        title: "Treat underlying condition (COPD, hypoxia, sepsis)",
        note: "Avoid AV nodal blockers if unstable; rate control may be ineffective.",
      };
    }
    if (arrhythmia === "Junctional") {
      return {
        title: "Identify and treat underlying cause",
        note: "Consider digoxin toxicity, inferior MI, post-cardiac surgery; avoid aggressive rate control.",
      };
    }
    return { title: "Assess and treat per ACLS algorithm", note: "Identify rhythm and stability first." };
  }, [arrhythmia, afDuration, ef, unstableNow]);

  const instabilityFields: Array<[keyof typeof unstable, string]> = [
    ["hypotension", "Hypotension"],
    ["shock", "Shock"],
    ["pulmonaryEdema", "Pulmonary edema"],
    ["ischemicPain", "Ischemic chest pain"],
    ["alteredSensorium", "Altered sensorium"],
  ];

  const activeDrug = drugs.find((d) => d.name === selectedDrug) ?? drugs[0];

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Treatment · Arrhythmias</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Treatment mini app</h1>
        <p className="text-muted-foreground max-w-2xl">
          Enter patient inputs to get a stability-first recommendation and live weight-based dosing.
          Supports AF, atrial flutter, SVT, MAT, junctional tachycardia, VT, and VF.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="surface-panel p-5 space-y-4">
          <h2 className="text-lg font-semibold">Patient input</h2>

          <label className="block text-sm font-medium">
            Arrhythmia
            <select
              value={arrhythmia}
              onChange={(e) => setArrhythmia(e.target.value as Arrhythmia)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="AF">Atrial Fibrillation (AF)</option>
              <option value="AFlutter">Atrial Flutter</option>
              <option value="SVT">SVT (Supraventricular Tachycardia)</option>
              <option value="MAT">Multifocal Atrial Tachycardia (MAT)</option>
              <option value="Junctional">Junctional Tachycardia</option>
              <option value="VT">Ventricular Tachycardia (VT)</option>
              <option value="VF">Ventricular Fibrillation (VF)</option>
            </select>
          </label>

          <label className="block text-sm font-medium">
            Weight (kg) — {safeWeight} kg
            <input
              type="range"
              min={30}
              max={150}
              step={1}
              value={safeWeight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="mt-2 block w-full accent-primary"
            />
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="mt-2 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium">
            {(arrhythmia === "AF" || arrhythmia === "AFlutter") ? "Duration (hr)" : "Onset (hr)"}
            <input
              type="number"
              value={afDuration}
              onChange={(e) => setAfDuration(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            {(arrhythmia === "AF" || arrhythmia === "AFlutter") && (
              <p className="text-xs text-muted-foreground mt-1">
                {afDuration >= 48 ? "≥48h: anticoagulation required before cardioversion" : "<48h: direct cardioversion may be considered"}
              </p>
            )}
          </label>

          {(arrhythmia === "AF" || arrhythmia === "AFlutter" || arrhythmia === "VT") && (
            <label className="block text-sm font-medium">
              EF (%)
              <input
                type="number"
                value={ef}
                onChange={(e) => setEf(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              {ef <= 35 && <p className="text-xs text-muted-foreground mt-1">Reduced EF: consider amiodarone for rhythm control</p>}
            </label>
          )}

          <div className="pt-2">
            <div className="text-sm font-semibold mb-2">Instability</div>
            <div className="space-y-1.5">
              {instabilityFields.map(([key, text]) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={unstable[key]}
                    onChange={(e) =>
                      setUnstable((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                  />
                  {text}
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-panel p-5 space-y-4">
          <h2 className="text-lg font-semibold">Recommendation</h2>
          <div
            className={`rounded-lg p-4 border ${
              unstableNow
                ? "border-danger/40 bg-danger/10 text-danger"
                : "border-border bg-surface-elevated"
            }`}
          >
            <h3 className="font-semibold">{recommendation.title}</h3>
            <p className="text-sm mt-1 opacity-90">{recommendation.note}</p>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-primary">Live dosing calculator</h3>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                {safeWeight} kg
              </span>
            </div>

            <label className="block text-xs font-medium">
              Drug
              <select
                value={selectedDrug}
                onChange={(e) => setSelectedDrug(e.target.value)}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {drugs.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} — {d.class}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              {activeDrug.doseRules.map((rule) => {
                const { value, detail } = rule.compute(safeWeight);
                return (
                  <div
                    key={rule.key}
                    className="rounded-md border border-border bg-background p-3"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        {rule.label}
                      </div>
                      {detail && (
                        <div className="font-mono text-[10px] text-muted-foreground">{detail}</div>
                      )}
                    </div>
                    <div className="mt-1 font-mono text-base font-semibold text-primary">
                      {value}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      ref: {rule.reference}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground">{activeDrug.comments}</p>
          </div>
        </section>
      </div>

      <section className="surface-panel p-5 space-y-4">
        <h2 className="text-lg font-semibold">Drug reference</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {drugs.map((drug) => (
            <button
              type="button"
              key={drug.name}
              onClick={() => setSelectedDrug(drug.name)}
              className={`text-left rounded-lg border p-4 transition ${
                selectedDrug === drug.name
                  ? "border-primary bg-primary/10"
                  : "border-border bg-surface-elevated hover:border-primary/40"
              }`}
            >
              <h3 className="font-semibold">{drug.name}</h3>
              <div className="text-xs text-muted-foreground">{drug.class}</div>
              <div className="mt-3 text-sm">
                <div className="font-medium">Indications</div>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {drug.indications.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3 text-sm">
                <div className="font-medium">Reference dosing</div>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {drug.doseRules.map((r) => (
                    <li key={r.key}>
                      <span className="font-mono text-xs">{r.key}</span>: {r.reference}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{drug.comments}</p>
            </button>
          ))}
        </div>
        <Link
          to="/antiarrhythmics"
          className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
        >
          Browse full anti-arrhythmic classification →
        </Link>
      </section>
    </div>
  );
}
