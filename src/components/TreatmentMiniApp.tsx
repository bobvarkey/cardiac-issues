import React, { useMemo, useState } from "react";

type Arrhythmia = "AF" | "VT" | "VF";

type Drug = {
  name: string;
  class: string;
  indications: string[];
  dosing: Record<string, string>;
  comments: string;
};

const drugs: Drug[] = [
  {
    name: "Diltiazem",
    class: "Non-dihydropyridine CCB",
    indications: ["Rate control in AF"],
    dosing: {
      iv_bolus: "0.25 mg/kg IV over 2 min",
      repeat_bolus: "0.35 mg/kg IV if HR > 90 bpm after 15 min",
      infusion: "5-15 mg/hr IV infusion",
    },
    comments: "Negative inotrope; use cautiously in HF or hypotension.",
  },
  {
    name: "Metoprolol",
    class: "Beta-blocker",
    indications: ["Rate control in AF", "Hyperadrenergic states"],
    dosing: {
      iv_bolus: "2.5-5 mg IV over 2 min",
      repeat: "Repeat every 5-10 min up to 3 doses",
    },
    comments: "Useful when sympathetic drive is high.",
  },
  {
    name: "Esmolol",
    class: "Ultra-short acting beta-blocker",
    indications: ["Rapid titration rate control"],
    dosing: {
      bolus: "500 mcg/kg IV bolus",
      infusion: "50 mcg/kg/min infusion",
      titration: "Increase by 25 mcg/kg/min every 5 min",
      max: "200 mcg/kg/min",
    },
    comments: "Good when quick titration is needed.",
  },
  {
    name: "Digoxin",
    class: "Cardiac glycoside",
    indications: ["AF with HF or low BP", "Adjunct rate control"],
    dosing: {
      loading: "0.25 mg IV every 2 hr to total 1.5 mg",
      maintenance: "0.125-0.375 mg daily",
    },
    comments: "Slow onset; not ideal as sole acute agent.",
  },
  {
    name: "Amiodarone",
    class: "Class III antiarrhythmic",
    indications: ["AF rhythm control", "VT/VF"],
    dosing: {
      bolus: "150 mg IV over 10 min",
      infusion1: "1 mg/min for 6 hr",
      infusion2: "0.5 mg/min for 18 hr",
      max24h: "Do not exceed ~2.2 g in 24 hr",
    },
    comments: "Useful when HF is present; monitor for cardioversion anticoagulation needs.",
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
  const [arrhythmia, setArrhythmia] = useState<Arrhythmia>("AF");
  const [weight, setWeight] = useState<number>(70);
  const [afDuration, setAfDuration] = useState<number>(24);
  const [ef, setEf] = useState<number>(60);
  const [unstable, setUnstable] = useState({
    hypotension: false,
    shock: false,
    pulmonaryEdema: false,
    ischemicPain: false,
    alteredSensorium: false,
  });

  const unstableNow = useMemo(() => hasInstability(unstable), [unstable]);

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
      return {
        title: "Follow ACLS VT algorithm",
        note: "Assess pulse and stability first.",
      };
    }
    return {
      title: "Defibrillation + CPR if pulseless VF",
      note: "Treat as a shockable rhythm.",
    };
  }, [arrhythmia, afDuration, ef, unstableNow]);

  const instabilityFields: Array<[keyof typeof unstable, string]> = [
    ["hypotension", "Hypotension"],
    ["shock", "Shock"],
    ["pulmonaryEdema", "Pulmonary edema"],
    ["ischemicPain", "Ischemic chest pain"],
    ["alteredSensorium", "Altered sensorium"],
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Treatment · AF / VT / VF</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Treatment mini app</h1>
        <p className="text-muted-foreground max-w-2xl">
          Enter patient inputs to get a stability-first recommendation and quick weight-based dose
          examples.
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
              <option value="AF">AF</option>
              <option value="VT">VT</option>
              <option value="VF">VF</option>
            </select>
          </label>

          <label className="block text-sm font-medium">
            Weight (kg)
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium">
            AF duration (hr)
            <input
              type="number"
              value={afDuration}
              onChange={(e) => setAfDuration(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

          <label className="block text-sm font-medium">
            EF (%)
            <input
              type="number"
              value={ef}
              onChange={(e) => setEf(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>

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

          <div>
            <h3 className="text-sm font-semibold mb-2">Weight-based examples</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>Diltiazem 0.25 mg/kg = {Math.round(weight * 0.25 * 10) / 10} mg</li>
              <li>Esmolol 500 mcg/kg = {Math.round(weight * 500)} mcg</li>
              <li>Amiodarone bolus = 150 mg</li>
            </ul>
          </div>
        </section>
      </div>

      <section className="surface-panel p-5 space-y-4">
        <h2 className="text-lg font-semibold">Drug cards</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {drugs.map((drug) => (
            <div key={drug.name} className="rounded-lg border border-border bg-surface-elevated p-4">
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
                <div className="font-medium">Dosing</div>
                <ul className="list-disc pl-5 text-muted-foreground">
                  {Object.entries(drug.dosing).map(([k, v]) => (
                    <li key={k}>
                      <span className="font-mono text-xs">{k}</span>: {v}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">{drug.comments}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
