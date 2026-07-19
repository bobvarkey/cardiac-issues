export type FieldType = "number" | "select";

export type CalcField = {
  key: string;
  label: string;
  unit?: string;
  type: FieldType;
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: number }[];
  placeholder?: string;
};

export type CalcResult = {
  value: string;
  unit?: string;
  interpretation?: { label: string; tone: "ok" | "warn" | "danger" | "info" }[];
  detail?: string;
};

export type Calculator = {
  id: string;
  name: string;
  tagline: string;
  category: "Cardiac" | "Renal" | "General" | "Risk";
  symbol: string; // emoji-ish glyph for visual
  fields: CalcField[];
  compute: (v: Record<string, number>) => CalcResult | null;
};

const round = (n: number, d = 1) =>
  Number.isFinite(n) ? Number(n.toFixed(d)).toString() : "—";

export const calculators: Calculator[] = [
  {
    id: "bmi",
    name: "BMI",
    tagline: "Body Mass Index",
    category: "General",
    symbol: "⚖️",
    fields: [
      { key: "weight", label: "Weight", unit: "kg", type: "number", min: 1, max: 400, step: 0.1, placeholder: "70" },
      { key: "height", label: "Height", unit: "cm", type: "number", min: 30, max: 250, step: 0.5, placeholder: "170" },
    ],
    compute: ({ weight, height }) => {
      if (!weight || !height) return null;
      const m = height / 100;
      const bmi = weight / (m * m);
      const tone = bmi < 18.5 ? "warn" : bmi < 25 ? "ok" : bmi < 30 ? "warn" : "danger";
      const label = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
      return {
        value: round(bmi, 1),
        unit: "kg/m²",
        interpretation: [{ label, tone }],
        detail: "WHO adult classification. Use age/ethnicity-specific cutoffs where appropriate.",
      };
    },
  },
  {
    id: "bsa",
    name: "BSA (Mosteller)",
    tagline: "Body Surface Area",
    category: "General",
    symbol: "📐",
    fields: [
      { key: "weight", label: "Weight", unit: "kg", type: "number", min: 1, max: 400, step: 0.1 },
      { key: "height", label: "Height", unit: "cm", type: "number", min: 30, max: 250, step: 0.5 },
    ],
    compute: ({ weight, height }) => {
      if (!weight || !height) return null;
      const bsa = Math.sqrt((height * weight) / 3600);
      return {
        value: round(bsa, 2),
        unit: "m²",
        detail: "Mosteller formula: √((height × weight) / 3600). Common for chemo & cardiac index.",
      };
    },
  },
  {
    id: "map",
    name: "Mean Arterial Pressure",
    tagline: "MAP from SBP / DBP",
    category: "Cardiac",
    symbol: "❤️‍🔥",
    fields: [
      { key: "sbp", label: "Systolic BP", unit: "mmHg", type: "number", min: 40, max: 260, step: 1 },
      { key: "dbp", label: "Diastolic BP", unit: "mmHg", type: "number", min: 20, max: 200, step: 1 },
    ],
    compute: ({ sbp, dbp }) => {
      if (!sbp || !dbp) return null;
      const map = (sbp + 2 * dbp) / 3;
      const tone = map < 65 ? "danger" : map > 110 ? "warn" : "ok";
      const label = map < 65 ? "Low — organ perfusion risk" : map > 110 ? "Elevated" : "Adequate perfusion";
      return {
        value: round(map, 0),
        unit: "mmHg",
        interpretation: [{ label, tone }],
        detail: "Target MAP ≥ 65 mmHg is a common resuscitation goal.",
      };
    },
  },
  {
    id: "crcl",
    name: "Creatinine Clearance",
    tagline: "Cockcroft-Gault",
    category: "Renal",
    symbol: "🧪",
    fields: [
      { key: "age", label: "Age", unit: "yrs", type: "number", min: 12, max: 120, step: 1 },
      { key: "weight", label: "Weight", unit: "kg", type: "number", min: 1, max: 400, step: 0.1 },
      { key: "cr", label: "Serum creatinine", unit: "mg/dL", type: "number", min: 0.1, max: 20, step: 0.01 },
      {
        key: "sex",
        label: "Sex",
        type: "select",
        options: [
          { label: "Male", value: 1 },
          { label: "Female", value: 0.85 },
        ],
      },
    ],
    compute: ({ age, weight, cr, sex }) => {
      if (!age || !weight || !cr || sex === undefined) return null;
      const crcl = (((140 - age) * weight) / (72 * cr)) * sex;
      const tone = crcl < 30 ? "danger" : crcl < 60 ? "warn" : "ok";
      const label = crcl < 15 ? "Kidney failure" : crcl < 30 ? "Severe ↓" : crcl < 60 ? "Moderate ↓" : crcl < 90 ? "Mild ↓" : "Normal";
      return {
        value: round(crcl, 0),
        unit: "mL/min",
        interpretation: [{ label, tone }],
        detail: "Cockcroft-Gault. Adjust dosing for renally-cleared drugs (e.g., DOACs, LMWH).",
      };
    },
  },
  {
    id: "qtc",
    name: "Corrected QT",
    tagline: "Bazett's formula",
    category: "Cardiac",
    symbol: "📈",
    fields: [
      { key: "qt", label: "QT interval", unit: "ms", type: "number", min: 200, max: 700, step: 1 },
      { key: "hr", label: "Heart rate", unit: "bpm", type: "number", min: 30, max: 220, step: 1 },
    ],
    compute: ({ qt, hr }) => {
      if (!qt || !hr) return null;
      const rr = 60 / hr;
      const qtc = qt / Math.sqrt(rr);
      const tone = qtc > 500 ? "danger" : qtc > 460 ? "warn" : "ok";
      const label = qtc > 500 ? "High TdP risk" : qtc > 460 ? "Prolonged" : "Normal range";
      return {
        value: round(qtc, 0),
        unit: "ms",
        interpretation: [{ label, tone }],
        detail: "Bazett over-corrects at high HR. Consider Fridericia if HR > 100.",
      };
    },
  },
  {
    id: "chadsvasc",
    name: "CHA₂DS₂-VASc",
    tagline: "AF stroke risk",
    category: "Risk",
    symbol: "🧠",
    fields: [
      { key: "chf", label: "CHF / LV dysfunction", type: "select", options: [{ label: "No", value: 0 }, { label: "Yes (+1)", value: 1 }] },
      { key: "htn", label: "Hypertension", type: "select", options: [{ label: "No", value: 0 }, { label: "Yes (+1)", value: 1 }] },
      { key: "age", label: "Age", type: "select", options: [{ label: "< 65", value: 0 }, { label: "65–74 (+1)", value: 1 }, { label: "≥ 75 (+2)", value: 2 }] },
      { key: "dm", label: "Diabetes", type: "select", options: [{ label: "No", value: 0 }, { label: "Yes (+1)", value: 1 }] },
      { key: "stroke", label: "Prior stroke/TIA", type: "select", options: [{ label: "No", value: 0 }, { label: "Yes (+2)", value: 2 }] },
      { key: "vasc", label: "Vascular disease", type: "select", options: [{ label: "No", value: 0 }, { label: "Yes (+1)", value: 1 }] },
      { key: "sex", label: "Sex", type: "select", options: [{ label: "Male", value: 0 }, { label: "Female (+1)", value: 1 }] },
    ],
    compute: (v) => {
      const keys = ["chf", "htn", "age", "dm", "stroke", "vasc", "sex"];
      if (keys.some((k) => v[k] === undefined)) return null;
      const score = keys.reduce((a, k) => a + (v[k] || 0), 0);
      const tone = score >= 2 ? "danger" : score === 1 ? "warn" : "ok";
      const label = score >= 2 ? "Anticoagulation recommended" : score === 1 ? "Consider anticoagulation" : "Low risk";
      return {
        value: String(score),
        unit: "points",
        interpretation: [{ label, tone }],
        detail: "2020 ESC AF guidelines. Weigh with HAS-BLED before starting anticoagulation.",
      };
    },
  },
];

export function getCalculator(id: string) {
  return calculators.find((c) => c.id === id);
}
