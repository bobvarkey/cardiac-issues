import { useState, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Droplets,
  FileText,
  Heart,
  Info,
  LineChart,
  Printer,
  RefreshCw,
  User,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types */
/* -------------------------------------------------------------------------- */

type Sex = "M" | "F";
type Modality = "treadmill" | "bike";
type SamplingMethod = "capillary" | "iv_lactate" | "iv_vbg";
type SuspectedDiagnosis =
  | "unspecified"
  | "mitochondrial_myopathy"
  | "mcardle_gsd"
  | "glycolytic_defect"
  | "fatty_acid_oxidation"
  | "exercise_intolerance"
  | "other_myopathy";

interface Patient {
  name: string;
  age: number;
  sex: Sex;
  weightKg: number;
  heightCm: number;
  suspected: SuspectedDiagnosis;
  orthoLimitations: string;
}

interface PrepChecks {
  fasted: boolean;
  noExercise: boolean;
  noSubstances: boolean;
  hydrated: boolean;
  consent: boolean;
}

interface StageData {
  stage: number;
  heartRate: number | null;
  rpe: number | null;
  lactate: number | null;
  sao2: number | null;
  symptoms: string;
  ph: number | null;
  hco3: number | null;
  pco2: number | null;
  po2: number | null;
}

interface VitalsRecovery {
  hr: number | null;
  lactate: number | null;
  sao2: number | null;
  symptoms: string;
}

/* -------------------------------------------------------------------------- */
/* Constants */
/* -------------------------------------------------------------------------- */

const BRUCE_STAGES = [
  { stage: 1, speed: 1.7, grade: 10, mets: 4.6 },
  { stage: 2, speed: 2.5, grade: 12, mets: 7.0 },
  { stage: 3, speed: 3.4, grade: 14, mets: 10.1 },
  { stage: 4, speed: 4.2, grade: 16, mets: 12.9 },
  { stage: 5, speed: 5.0, grade: 18, mets: 15.0 },
  { stage: 6, speed: 5.5, grade: 20, mets: 16.9 },
  { stage: 7, speed: 6.0, grade: 22, mets: 19.0 },
];

const BIKE_STAGES = [
  { stage: 1, watts: 25, mets: 2.5 },
  { stage: 2, watts: 50, mets: 3.8 },
  { stage: 3, watts: 75, mets: 5.2 },
  { stage: 4, watts: 100, mets: 6.5 },
  { stage: 5, watts: 125, mets: 7.9 },
  { stage: 6, watts: 150, mets: 9.2 },
  { stage: 7, watts: 175, mets: 10.5 },
  { stage: 8, watts: 200, mets: 11.8 },
];

const BORG_SCALE = [
  { value: 6, label: "6 – No exertion" },
  { value: 7, label: "7 – Extremely light" },
  { value: 8, label: "8" },
  { value: 9, label: "9 – Very light" },
  { value: 10, label: "10" },
  { value: 11, label: "11 – Light" },
  { value: 12, label: "12" },
  { value: 13, label: "13 – Somewhat hard" },
  { value: 14, label: "14" },
  { value: 15, label: "15 – Hard" },
  { value: 16, label: "16" },
  { value: 17, label: "17 – Very hard" },
  { value: 18, label: "18" },
  { value: 19, label: "19 – Extremely hard" },
  { value: 20, label: "20 – Maximal" },
];

const TERMINATION_REASONS = [
  "Patient request / fatigue",
  "Chest pain / angina",
  "Dyspnoea",
  "Leg fatigue / claudication",
  "Dizziness / pre-syncope",
  "Hypertensive response (SBP >250 / DBP >115)",
  "Hypotension (SBP drop >20 from baseline)",
  "ST depression >2 mm",
  "ST elevation >1 mm",
  "Sustained arrhythmia",
  "O2 desaturation <85%",
  "Ataxia / near-fall",
  "Equipment malfunction",
  "Other",
];

/* -------------------------------------------------------------------------- */
/* Helpers */
/* -------------------------------------------------------------------------- */

function vo2BruceMen(T: number) {
  return 14.76 - 1.379 * T + 0.451 * T ** 2 - 0.012 * T ** 3;
}
function vo2BruceWomen(T: number) {
  return 4.38 * T - 3.9;
}
function vo2FromBike(watts: number, weightKg: number) {
  return (10.8 * watts) / weightKg + 7;
}
function metsFromVo2(vo2: number) {
  return vo2 / 3.5;
}

function predictedVo2Max(age: number, sex: Sex): number {
  if (sex === "M") return 60 - 0.55 * age;
  return 48 - 0.37 * age;
}

function categorizeFitness(vo2: number, age: number, sex: Sex): string {
  const pred = predictedVo2Max(age, sex);
  const pct = (vo2 / pred) * 100;
  if (pct >= 100) return "Excellent";
  if (pct >= 85) return "Good";
  if (pct >= 70) return "Average";
  if (pct >= 55) return "Below average";
  return "Poor";
}

function analyzeLactate(stages: StageData[]): string {
  const lacs = stages
    .map((s) => s.lactate)
    .filter((l): l is number => l != null);
  const hrs = stages
    .map((s) => s.heartRate)
    .filter((h): h is number => h != null);

  if (lacs.length === 0)
    return "No lactate values entered → pattern analysis impossible.";

  const baseline = lacs[0];
  const peak = Math.max(...lacs);
  const parts: string[] = [
    `Baseline lactate ${baseline.toFixed(2)} mmol/L | Peak ${peak.toFixed(2)} mmol/L.`,
  ];

  const early = lacs.slice(0, Math.min(3, lacs.length));
  if (early.some((l) => l > 3.5)) {
    parts.push(
      "Early lactate spike (>3.5 mmol/L at low workload) → suggests impaired oxidative phosphorylation (mitochondrial myopathy possible).",
    );
  }
  if (peak > 6.0 && stages.length <= 3) {
    parts.push(
      "Severe lactic acidosis (>6 mmol/L) at modest workload → highly suspicious for mitochondrial disease.",
    );
  }
  if (peak < 2.0 && baseline <= 1.5 && lacs.length >= 3) {
    parts.push(
      "Completely flat lactate curve (<2 mmol/L) despite rising workload → classic for blocked glycogenolysis (McArdle disease / GSD V).",
    );
  }
  if (hrs.length >= 3 && hrs[2] <= hrs[1]) {
    parts.push(
      "Heart-rate plateau or drop after ~6–9 min may represent the 'second-wind' phenomenon (supports McArdle).",
    );
  }

  if (parts.length === 1) {
    parts.push(
      "No clear mitochondrial or glycogen-storage signature; clinical correlation required.",
    );
  }
  return parts.join(" ");
}

function formatTime(minutes: number): string {
  const m = Math.floor(minutes);
  const s = Math.round((minutes - m) * 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* -------------------------------------------------------------------------- */
/* Sub-components */
/* -------------------------------------------------------------------------- */

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>
        Step {current + 1} of {total}
      </span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-5 shadow-sm ${className}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500/15 text-rose-400">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function CheckItem({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-surface/60">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="h-4 w-4 accent-rose-500"
      />
      <span className={checked ? "text-muted-foreground line-through" : ""}>
        {label}
      </span>
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  unit,
  placeholder,
  min,
  max,
  step,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
        {unit && (
          <span className="ml-1 font-mono text-[10px] text-muted-foreground/60">
            ({unit})
          </span>
        )}
      </span>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className="w-full rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/30 disabled:opacity-40"
        />
      </div>
    </label>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/30 disabled:opacity-40"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Lactate Curve Chart (simple SVG) */
/* -------------------------------------------------------------------------- */

function LactateCurve({ stages }: { stages: StageData[] }) {
  const data = stages
    .map((s) => ({ stage: s.stage, lactate: s.lactate }))
    .filter((d): d is { stage: number; lactate: number } => d.lactate != null);

  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-8 text-xs text-muted-foreground">
        Enter at least 2 lactate values to see the curve.
      </div>
    );
  }

  const W = 320;
  const H = 160;
  const pad = { top: 16, right: 16, bottom: 28, left: 36 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;

  const maxLac = Math.max(...data.map((d) => d.lactate)) * 1.15;
  const minLac = Math.min(...data.map((d) => d.lactate)) * 0.85;
  const lacRange = maxLac - minLac || 1;
  const maxStage = Math.max(...data.map((d) => d.stage));

  const xScale = (s: number) => pad.left + (s / maxStage) * iw;
  const yScale = (l: number) => pad.top + ih - ((l - minLac) / lacRange) * ih;

  const points = data.map((d) => `${xScale(d.stage)},${yScale(d.lactate)}`).join(" ");

  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) =>
    (minLac + (lacRange / yTicks) * i).toFixed(1),
  );

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[360px]">
        {/* Grid lines */}
        {yLabels.map((_, i) => {
          const y = pad.top + (ih / yTicks) * i;
          return (
            <g key={i}>
              <line
                x1={pad.left}
                y1={y}
                x2={W - pad.right}
                y2={y}
                stroke="currentColor"
                className="text-border"
                strokeWidth={0.5}
              />
              <text
                x={pad.left - 4}
                y={y + 3}
                textAnchor="end"
                className="fill-muted-foreground"
                fontSize={9}
              >
                {yLabels[yTicks - i]}
              </text>
            </g>
          );
        })}

        {/* Axes labels */}
        <text
          x={W / 2}
          y={H - 2}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={9}
        >
          Stage
        </text>
        <text
          x={10}
          y={H / 2}
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize={9}
          transform={`rotate(-90, 10, ${H / 2})`}
        >
          Lactate (mmol/L)
        </text>

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#f43f5e"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {/* Dots */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={xScale(d.stage)}
            cy={yScale(d.lactate)}
            r={3.5}
            fill="#f43f5e"
            className="drop-shadow-sm"
          />
        ))}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */

export function ExerciseToleranceTest() {
  const [step, setStep] = useState<
    "patient" | "prep" | "protocol" | "recovery" | "report"
  >("patient");

  /* ---- Patient ---- */
  const [patient, setPatient] = useState<Patient>({
    name: "",
    age: 0,
    sex: "M",
    weightKg: 70,
    heightCm: 170,
    suspected: "unspecified",
    orthoLimitations: "",
  });

  /* ---- Pre-test ---- */
  const [prepChecks, setPrepChecks] = useState<PrepChecks>({
    fasted: false,
    noExercise: false,
    noSubstances: false,
    hydrated: false,
    consent: false,
  });
  const [preCpk, setPreCpk] = useState<number | null>(null);

  /* ---- Protocol ---- */
  const [modality, setModality] = useState<Modality>("treadmill");
  const [samplingMethod, setSamplingMethod] =
    useState<SamplingMethod>("capillary");
  const [stages, setStages] = useState<StageData[]>([]);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [terminatedEarly, setTerminatedEarly] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");

  /* ---- Recovery ---- */
  const [postCpk, setPostCpk] = useState<number | null>(null);
  const [recoveryVitals, setRecoveryVitals] = useState<VitalsRecovery>({
    hr: null,
    lactate: null,
    sao2: null,
    symptoms: "",
  });
  const [recoveryDone, setRecoveryDone] = useState(false);

  /* ---- Current stage form ---- */
  const [hr, setHr] = useState("");
  const [rpe, setRpe] = useState("");
  const [lactate, setLactate] = useState("");
  const [sao2, setSao2] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [ph, setPh] = useState("");
  const [hco3, setHco3] = useState("");
  const [pco2, setPco2] = useState("");
  const [po2, setPo2] = useState("");

  /* ---- Computed ---- */
  const totalSteps = 5; // patient, prep, protocol, recovery, report

  const stageDefs = modality === "treadmill" ? BRUCE_STAGES : BIKE_STAGES;
  const currentStageDef = stageDefs[currentStageIdx];

  const computedVo2 = useMemo(() => {
    if (stages.length === 0) return null;
    const last = stages[stages.length - 1];
    const idx = last.stage - 1;
    if (modality === "treadmill") {
      const T = idx + 1;
      const vo2 =
        patient.sex === "M"
          ? vo2BruceMen(T)
          : vo2BruceWomen(T);
      return { vo2, mets: metsFromVo2(vo2) };
    } else {
      const watts = BIKE_STAGES[idx]?.watts ?? 0;
      const vo2 = vo2FromBike(watts, patient.weightKg);
      return { vo2, mets: metsFromVo2(vo2) };
    }
  }, [stages, modality, patient.sex, patient.weightKg]);

  const peakVo2 = computedVo2?.vo2 ?? 0;
  const peakMets = computedVo2?.mets ?? 0;
  const fitness = peakVo2
    ? categorizeFitness(peakVo2, patient.age, patient.sex)
    : "";

  /* ---- Handlers ---- */

  function addStage() {
    const stageNum = currentStageIdx + 1;
    const data: StageData = {
      stage: stageNum,
      heartRate: hr ? parseFloat(hr) : null,
      rpe: rpe ? parseInt(rpe) : null,
      lactate: lactate ? parseFloat(lactate) : null,
      sao2: sao2 ? parseFloat(sao2) : null,
      symptoms,
      ph: samplingMethod === "iv_vbg" && ph ? parseFloat(ph) : null,
      hco3: samplingMethod === "iv_vbg" && hco3 ? parseFloat(hco3) : null,
      pco2: samplingMethod === "iv_vbg" && pco2 ? parseFloat(pco2) : null,
      po2: samplingMethod === "iv_vbg" && po2 ? parseFloat(po2) : null,
    };
    setStages((prev) => [...prev, data]);
    setCurrentStageIdx((prev) => prev + 1);
    // Reset form
    setHr("");
    setRpe("");
    setLactate("");
    setSao2("");
    setSymptoms("");
    setPh("");
    setHco3("");
    setPco2("");
    setPo2("");
  }

  function finishProtocol() {
    // Add current stage if data entered
    if (hr || lactate || rpe) {
      addStage();
    }
    setStep("recovery");
  }

  function finishRecovery() {
    setRecoveryDone(true);
    setStep("report");
  }

  function resetAll() {
    setStep("patient");
    setPatient({
      name: "",
      age: 0,
      sex: "M",
      weightKg: 70,
      heightCm: 170,
      suspected: "unspecified",
      orthoLimitations: "",
    });
    setPrepChecks({
      fasted: false,
      noExercise: false,
      noSubstances: false,
      hydrated: false,
      consent: false,
    });
    setPreCpk(null);
    setModality("treadmill");
    setSamplingMethod("capillary");
    setStages([]);
    setCurrentStageIdx(0);
    setTerminatedEarly(false);
    setTerminationReason("");
    setPostCpk(null);
    setRecoveryVitals({ hr: null, lactate: null, sao2: null, symptoms: "" });
    setRecoveryDone(false);
    setHr("");
    setRpe("");
    setLactate("");
    setSao2("");
    setSymptoms("");
    setPh("");
    setHco3("");
    setPco2("");
    setPo2("");
  }

  function handlePrint() {
    window.print();
  }

  /* ---- Safety check ---- */
  const allPrepDone = Object.values(prepChecks).every(Boolean);
  const patientValid =
    patient.name.trim().length > 0 && patient.age > 0 && patient.weightKg > 0;

  /* ---- Render ---- */
  const stepIndex = ["patient", "prep", "protocol", "recovery", "report"].indexOf(step);

  return (
    <div className="space-y-6">
      {/* Progress */}
      <ProgressBar current={stepIndex} total={totalSteps} />

      {/* ========== PATIENT ========== */}
      {step === "patient" && (
        <SectionCard title="Patient Demographics" icon={User}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">
                Patient Name
              </span>
              <input
                type="text"
                value={patient.name}
                onChange={(e) =>
                  setPatient((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. John Doe"
                className="rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/30"
              />
            </label>
            <NumberInput
              label="Age"
              value={patient.age ? String(patient.age) : ""}
              onChange={(v) =>
                setPatient((p) => ({ ...p, age: parseFloat(v) || 0 }))
              }
              unit="years"
              min={0}
              max={120}
            />
            <SelectInput
              label="Sex"
              value={patient.sex}
              onChange={(v) =>
                setPatient((p) => ({ ...p, sex: v as Sex }))
              }
              options={[
                { value: "M", label: "Male" },
                { value: "F", label: "Female" },
              ]}
            />
            <NumberInput
              label="Weight"
              value={patient.weightKg ? String(patient.weightKg) : ""}
              onChange={(v) =>
                setPatient((p) => ({ ...p, weightKg: parseFloat(v) || 0 }))
              }
              unit="kg"
              min={20}
              max={300}
            />
            <NumberInput
              label="Height"
              value={patient.heightCm ? String(patient.heightCm) : ""}
              onChange={(v) =>
                setPatient((p) => ({ ...p, heightCm: parseFloat(v) || 0 }))
              }
              unit="cm"
              min={100}
              max={250}
            />
            <SelectInput
              label="Suspected Diagnosis"
              value={patient.suspected}
              onChange={(v) =>
                setPatient((p) => ({
                  ...p,
                  suspected: v as SuspectedDiagnosis,
                }))
              }
              options={[
                { value: "unspecified", label: "Unspecified / Exercise intolerance" },
                { value: "mitochondrial_myopathy", label: "Mitochondrial myopathy" },
                { value: "mcardle_gsd", label: "McArdle disease / GSD V" },
                { value: "glycolytic_defect", label: "Glycolytic defect (e.g. GSD VII)" },
                { value: "fatty_acid_oxidation", label: "Fatty acid oxidation disorder" },
                { value: "other_myopathy", label: "Other myopathy" },
              ]}
            />
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">
                Orthopaedic / Other Limitations
              </span>
              <input
                type="text"
                value={patient.orthoLimitations}
                onChange={(e) =>
                  setPatient((p) => ({ ...p, orthoLimitations: e.target.value }))
                }
                placeholder="e.g. knee pain, recent ankle sprain"
                className="rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/30"
              />
            </label>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setStep("prep")}
              disabled={!patientValid}
              className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-40"
            >
              Next: Pre-test Checks
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </SectionCard>
      )}

      {/* ========== PREP ========== */}
      {step === "prep" && (
        <SectionCard title="Pre-test Checklist" icon={ClipboardList}>
          <div className="space-y-1">
            <CheckItem
              checked={prepChecks.fasted}
              label="Fasted ≥4 hours (no food, clear fluids allowed)"
              onToggle={() =>
                setPrepChecks((c) => ({ ...c, fasted: !c.fasted }))
              }
            />
            <CheckItem
              checked={prepChecks.noExercise}
              label="No strenuous exercise in past 24 h"
              onToggle={() =>
                setPrepChecks((c) => ({ ...c, noExercise: !c.noExercise }))
              }
            />
            <CheckItem
              checked={prepChecks.noSubstances}
              label="No caffeine / nicotine / alcohol ≥4 h prior"
              onToggle={() =>
                setPrepChecks((c) => ({ ...c, noSubstances: !c.noSubstances }))
              }
            />
            <CheckItem
              checked={prepChecks.hydrated}
              label="Well hydrated (500 mL water 1–2 h before)"
              onToggle={() =>
                setPrepChecks((c) => ({ ...c, hydrated: !c.hydrated }))
              }
            />
            <CheckItem
              checked={prepChecks.consent}
              label="Informed consent obtained"
              onToggle={() =>
                setPrepChecks((c) => ({ ...c, consent: !c.consent }))
              }
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberInput
              label="Pre-test CPK"
              value={preCpk !== null ? String(preCpk) : ""}
              onChange={(v) => setPreCpk(v ? parseFloat(v) : null)}
              unit="U/L"
              placeholder="e.g. 120"
              min={0}
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep("patient")}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <button
              type="button"
              onClick={() => setStep("protocol")}
              disabled={!allPrepDone}
              className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-40"
            >
              Next: Protocol
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </SectionCard>
      )}

      {/* ========== PROTOCOL ========== */}
      {step === "protocol" && (
        <div className="space-y-4">
          {/* Protocol settings */}
          <SectionCard title="Protocol Settings" icon={Activity}>
            <div className="grid gap-4 sm:grid-cols-3">
              <SelectInput
                label="Modality"
                value={modality}
                onChange={(v) => {
                  setModality(v as Modality);
                  setStages([]);
                  setCurrentStageIdx(0);
                }}
                options={[
                  { value: "treadmill", label: "Modified Bruce (Treadmill)" },
                  { value: "bike", label: "Bicycle Ergometer" },
                ]}
              />
              <SelectInput
                label="Blood Sampling"
                value={samplingMethod}
                onChange={(v) => setSamplingMethod(v as SamplingMethod)}
                options={[
                  { value: "capillary", label: "Capillary (finger-prick)" },
                  { value: "iv_lactate", label: "IV line — Lactate only" },
                  { value: "iv_vbg", label: "IV line — Lactate + VBG" },
                ]}
              />
              <div className="flex items-end">
                <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Stage {currentStageIdx + 1} of {stageDefs.length}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Current stage data entry */}
          <SectionCard
            title={`Stage ${currentStageIdx + 1} — ${
              modality === "treadmill"
                ? `${(currentStageDef as (typeof BRUCE_STAGES)[number]).speed} mph @ ${(currentStageDef as (typeof BRUCE_STAGES)[number]).grade}%`
                : `${(currentStageDef as (typeof BIKE_STAGES)[number]).watts} W`
            }`}
            icon={BarChart3}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <NumberInput
                label="Heart Rate"
                value={hr}
                onChange={setHr}
                unit="bpm"
                placeholder="e.g. 120"
                min={30}
                max={250}
              />
              <SelectInput
                label="Borg RPE"
                value={rpe}
                onChange={setRpe}
                options={BORG_SCALE.map((b) => ({
                  value: String(b.value),
                  label: b.label,
                }))}
              />
              <NumberInput
                label="Lactate"
                value={lactate}
                onChange={setLactate}
                unit="mmol/L"
                placeholder="e.g. 2.5"
                min={0}
                max={25}
                step={0.1}
              />
              <NumberInput
                label="SpO₂"
                value={sao2}
                onChange={setSao2}
                unit="%"
                placeholder="e.g. 98"
                min={60}
                max={100}
              />
              <label className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Symptoms
                </span>
                <input
                  type="text"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. mild leg fatigue"
                  className="rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/30"
                />
              </label>
            </div>

            {/* VBG fields (only when iv_vbg) */}
            {samplingMethod === "iv_vbg" && (
              <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-violet-400">
                  <Droplets className="h-3.5 w-3.5" />
                  Venous Blood Gas
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <NumberInput
                    label="pH"
                    value={ph}
                    onChange={setPh}
                    placeholder="e.g. 7.40"
                    min={6.5}
                    max={7.8}
                    step={0.01}
                  />
                  <NumberInput
                    label="HCO₃⁻"
                    value={hco3}
                    onChange={setHco3}
                    unit="mmol/L"
                    placeholder="e.g. 24"
                    min={5}
                    max={50}
                  />
                  <NumberInput
                    label="pCO₂"
                    value={pco2}
                    onChange={setPco2}
                    unit="mmHg"
                    placeholder="e.g. 40"
                    min={10}
                    max={100}
                  />
                  <NumberInput
                    label="pO₂"
                    value={po2}
                    onChange={setPo2}
                    unit="mmHg"
                    placeholder="e.g. 60"
                    min={10}
                    max={200}
                  />
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {stages.length > 0 && (
                  <span>
                    {stages.length} stage{stages.length > 1 ? "s" : ""} recorded
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTerminatedEarly(true);
                    finishProtocol();
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Terminate
                </button>
                <button
                  type="button"
                  onClick={addStage}
                  disabled={!hr && !lactate && !rpe}
                  className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-40"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Record Stage
                </button>
              </div>
            </div>
          </SectionCard>

          {/* Recorded stages table */}
          {stages.length > 0 && (
            <SectionCard title="Recorded Stages" icon={LineChart}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="px-2 py-1.5">Stage</th>
                      <th className="px-2 py-1.5">HR</th>
                      <th className="px-2 py-1.5">Borg</th>
                      <th className="px-2 py-1.5">Lactate</th>
                      <th className="px-2 py-1.5">SpO₂</th>
                      <th className="px-2 py-1.5">Symptoms</th>
                      {samplingMethod === "iv_vbg" && (
                        <>
                          <th className="px-2 py-1.5">pH</th>
                          <th className="px-2 py-1.5">HCO₃⁻</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {stages.map((s) => (
                      <tr
                        key={s.stage}
                        className="border-b border-border/50 hover:bg-surface/30"
                      >
                        <td className="px-2 py-1.5 font-medium">{s.stage}</td>
                        <td className="px-2 py-1.5">
                          {s.heartRate ?? "—"}
                        </td>
                        <td className="px-2 py-1.5">{s.rpe ?? "—"}</td>
                        <td className="px-2 py-1.5">
                          {s.lactate != null
                            ? `${s.lactate.toFixed(2)}`
                            : "—"}
                        </td>
                        <td className="px-2 py-1.5">
                          {s.sao2 != null ? `${s.sao2}%` : "—"}
                        </td>
                        <td className="max-w-[120px] truncate px-2 py-1.5">
                          {s.symptoms || "—"}
                        </td>
                        {samplingMethod === "iv_vbg" && (
                          <>
                            <td className="px-2 py-1.5">
                              {s.ph != null ? s.ph.toFixed(2) : "—"}
                            </td>
                            <td className="px-2 py-1.5">
                              {s.hco3 != null ? s.hco3.toFixed(1) : "—"}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lactate curve */}
              <div className="mt-4">
                <h3 className="mb-2 text-xs font-medium text-muted-foreground">
                  Lactate Curve
                </h3>
                <LactateCurve stages={stages} />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={finishProtocol}
                  className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
                >
                  Finish Protocol
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </SectionCard>
          )}

          {/* Termination reason (if early) */}
          {terminatedEarly && (
            <SectionCard title="Termination Reason" icon={AlertTriangle}>
              <SelectInput
                label="Reason for early termination"
                value={terminationReason}
                onChange={setTerminationReason}
                options={TERMINATION_REASONS.map((r) => ({
                  value: r,
                  label: r,
                }))}
              />
            </SectionCard>
          )}
        </div>
      )}

      {/* ========== RECOVERY ========== */}
      {step === "recovery" && (
        <SectionCard title="Recovery Phase" icon={Heart}>
          <p className="mb-4 text-xs text-muted-foreground">
            Record recovery vitals at 1, 3, and 5 minutes post-exercise.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberInput
              label="Recovery HR (1 min)"
              value={recoveryVitals.hr !== null ? String(recoveryVitals.hr) : ""}
              onChange={(v) =>
                setRecoveryVitals((r) => ({ ...r, hr: v ? parseFloat(v) : null }))
              }
              unit="bpm"
              placeholder="e.g. 110"
            />
            <NumberInput
              label="Recovery Lactate"
              value={
                recoveryVitals.lactate !== null
                  ? String(recoveryVitals.lactate)
                  : ""
              }
              onChange={(v) =>
                setRecoveryVitals((r) => ({
                  ...r,
                  lactate: v ? parseFloat(v) : null,
                }))
              }
              unit="mmol/L"
              placeholder="e.g. 4.0"
              step={0.1}
            />
            <NumberInput
              label="Recovery SpO₂"
              value={
                recoveryVitals.sao2 !== null ? String(recoveryVitals.sao2) : ""
              }
              onChange={(v) =>
                setRecoveryVitals((r) => ({
                  ...r,
                  sao2: v ? parseFloat(v) : null,
                }))
              }
              unit="%"
              placeholder="e.g. 97"
            />
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">
                Recovery Symptoms
              </span>
              <input
                type="text"
                value={recoveryVitals.symptoms}
                onChange={(e) =>
                  setRecoveryVitals((r) => ({ ...r, symptoms: e.target.value }))
                }
                placeholder="e.g. mild dizziness resolving"
                className="rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/30"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberInput
              label="Post-test CPK"
              value={postCpk !== null ? String(postCpk) : ""}
              onChange={(v) => setPostCpk(v ? parseFloat(v) : null)}
              unit="U/L"
              placeholder="e.g. 180"
              min={0}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={finishRecovery}
              className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
            >
              Generate Report
              <FileText className="h-4 w-4" />
            </button>
          </div>
        </SectionCard>
      )}

      {/* ========== REPORT ========== */}
      {step === "report" && (
        <div className="space-y-4 print:space-y-6">
          {/* Report header */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm print:border-0 print:shadow-none">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">Exercise Tolerance Test Report</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  VO₂ max / Lactate stress test
                </p>
              </div>
              <div className="flex gap-2 print:hidden">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface"
                >
                  <RefreshCw className="h-4 w-4" />
                  New Test
                </button>
              </div>
            </div>

            {/* Patient info */}
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="text-xs text-muted-foreground">Patient</span>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">
                  Age / Sex
                </span>
                <p className="font-medium">
                  {patient.age} y / {patient.sex === "M" ? "Male" : "Female"}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Weight</span>
                <p className="font-medium">{patient.weightKg} kg</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Height</span>
                <p className="font-medium">{patient.heightCm} cm</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">
                  Suspected Diagnosis
                </span>
                <p className="font-medium capitalize">
                  {patient.suspected.replace(/_/g, " ")}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">
                  Limitations
                </span>
                <p className="font-medium">
                  {patient.orthoLimitations || "None"}
                </p>
              </div>
            </div>
          </div>

          {/* Protocol summary */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm print:border-0 print:shadow-none">
            <h3 className="mb-3 text-sm font-semibold">Protocol Summary</h3>
            <div className="grid gap-2 text-xs sm:grid-cols-3">
              <div>
                <span className="text-muted-foreground">Modality</span>
                <p className="font-medium">
                  {modality === "treadmill"
                    ? "Modified Bruce Treadmill"
                    : "Bicycle Ergometer"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Sampling</span>
                <p className="font-medium capitalize">
                  {samplingMethod === "capillary"
                    ? "Capillary"
                    : samplingMethod === "iv_lactate"
                      ? "IV Lactate"
                      : "IV Lactate + VBG"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Stages completed</span>
                <p className="font-medium">{stages.length}</p>
              </div>
              {terminatedEarly && (
                <div className="sm:col-span-3">
                  <span className="text-muted-foreground">
                    Early termination
                  </span>
                  <p className="font-medium text-amber-400">
                    {terminationReason || "Not specified"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm print:border-0 print:shadow-none">
            <h3 className="mb-3 text-sm font-semibold">Results</h3>
            <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-rose-500/10 p-3">
                <div className="text-muted-foreground">Peak VO₂</div>
                <div className="mt-1 text-lg font-bold text-rose-400">
                  {peakVo2.toFixed(1)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    mL/kg/min
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-fuchsia-500/10 p-3">
                <div className="text-muted-foreground">Peak METs</div>
                <div className="mt-1 text-lg font-bold text-fuchsia-400">
                  {peakMets.toFixed(1)}
                </div>
              </div>
              <div className="rounded-lg bg-violet-500/10 p-3">
                <div className="text-muted-foreground">Fitness Category</div>
                <div className="mt-1 text-lg font-bold text-violet-400">
                  {fitness}
                </div>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-3">
                <div className="text-muted-foreground">Predicted VO₂max</div>
                <div className="mt-1 text-lg font-bold text-amber-400">
                  {predictedVo2Max(patient.age, patient.sex).toFixed(1)}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    mL/kg/min
                  </span>
                </div>
              </div>
            </div>

            {/* % predicted */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  % Age-predicted VO₂max
                </span>
                <span className="font-semibold">
                  {((peakVo2 / predictedVo2Max(patient.age, patient.sex)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-500 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (peakVo2 / predictedVo2Max(patient.age, patient.sex)) * 100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Lactate analysis */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm print:border-0 print:shadow-none">
            <h3 className="mb-3 text-sm font-semibold">Lactate Pattern Analysis</h3>
            <LactateCurve stages={stages} />
            <div className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-relaxed">
              {analyzeLactate(stages)}
            </div>
          </div>

          {/* CPK */}
          {(preCpk !== null || postCpk !== null) && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm print:border-0 print:shadow-none">
              <h3 className="mb-3 text-sm font-semibold">CPK</h3>
              <div className="grid gap-3 text-xs sm:grid-cols-2">
                {preCpk !== null && (
                  <div>
                    <span className="text-muted-foreground">Pre-test</span>
                    <p className="font-medium">{preCpk} U/L</p>
                  </div>
                )}
                {postCpk !== null && (
                  <div>
                    <span className="text-muted-foreground">Post-test</span>
                    <p className="font-medium">{postCpk} U/L</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recovery */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm print:border-0 print:shadow-none">
            <h3 className="mb-3 text-sm font-semibold">Recovery</h3>
            <div className="grid gap-2 text-xs sm:grid-cols-3">
              <div>
                <span className="text-muted-foreground">HR (1 min)</span>
                <p className="font-medium">
                  {recoveryVitals.hr ?? "—"} bpm
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Lactate</span>
                <p className="font-medium">
                  {recoveryVitals.lactate != null
                    ? `${recoveryVitals.lactate.toFixed(2)} mmol/L`
                    : "—"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">SpO₂</span>
                <p className="font-medium">
                  {recoveryVitals.sao2 != null
                    ? `${recoveryVitals.sao2}%`
                    : "—"}
                </p>
              </div>
            </div>
            {recoveryVitals.symptoms && (
              <div className="mt-2 text-xs">
                <span className="text-muted-foreground">Symptoms: </span>
                {recoveryVitals.symptoms}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="rounded-xl border border-warn/25 bg-warn/5 p-3 text-xs text-warn print:border-0">
            For educational reference only. Not a substitute for clinical judgment,
            institutional protocols, or current guidelines.
          </div>
        </div>
      )}
    </div>
  );
}
