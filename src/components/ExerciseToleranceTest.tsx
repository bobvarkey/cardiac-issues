import { useState, useMemo, useRef } from "react";
import jsPDF from "jspdf";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Download,
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
  restingHr: number;
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

interface EquipmentChecks {
  treadmillOrBike: boolean;
  ecg: boolean;
  pulseOx: boolean;
  bpCuff: boolean;
  lactateMeter: boolean;
  vbgSyringes: boolean;
  cpkTubes: boolean;
  ammoniaTubes: boolean;
  ivAccess: boolean;
  crashCart: boolean;
}

interface StageData {
  stage: number;
  heartRate: number | null;
  rpe: number | null;
  lactate: number | null;
  pyruvate: number | null;
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
  pyruvate: number | null;
  sao2: number | null;
  symptoms: string;
}

interface SecondWind {
  tested: boolean;
  minute: number | null;
  heartRate: number | null;
  lactate: number | null;
  pyruvate: number | null;
  rpe: number | null;
  improved: boolean;
  notes: string;
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

/* Blood-sampling timeline (baseline, during, post) */
const SAMPLING_TIMELINE: {
  when: string;
  samples: string[];
  notes: string;
}[] = [
  {
    when: "Baseline (T = 0, before exercise)",
    samples: ["Lactate", "Ammonia (on ice)", "CPK", "VBG (pH, HCO₃⁻, pCO₂)"],
    notes:
      "Resting supine 10 min. IV or capillary — record method. Confirms starting metabolic state.",
  },
  {
    when: "During test — end of each 3-min stage",
    samples: ["Lactate", "SpO₂ (continuous)"],
    notes:
      "Draw in last 30 s of stage. Ammonia/VBG optional at peak workload if line permits.",
  },
  {
    when: "Immediate post-exercise (T = 0 min recovery)",
    samples: ["Lactate", "Ammonia", "VBG"],
    notes: "Draw within 60 s of stopping — peak lactate typically here or +2 min.",
  },
  {
    when: "Recovery +2, +5, +10 min",
    samples: ["Lactate", "HR", "SpO₂"],
    notes:
      "Tracks lactate clearance. Failure to clear by 30 min suggests severe metabolic block.",
  },
  {
    when: "24 h post-exercise",
    samples: ["CPK", "Myoglobin (if rhabdo suspected)"],
    notes: "Detects delayed muscle-fibre injury / exertional rhabdomyolysis.",
  },
];

/* Absolute + relative stopping criteria */
const STOPPING_CRITERIA_ABSOLUTE: string[] = [
  "Patient requests to stop (always honoured)",
  "Sustained ventricular tachycardia or other haemodynamically significant arrhythmia",
  "ST-elevation ≥1 mm in non-Q-wave leads",
  "Drop in SBP ≥10 mmHg below baseline with signs of ischaemia",
  "Moderate-to-severe angina",
  "CNS symptoms (ataxia, dizziness, near-syncope, confusion)",
  "Signs of poor perfusion (cyanosis, pallor)",
  "SpO₂ < 85% sustained",
  "Failure of HR to rise with increasing workload (chronotropic failure) with symptoms",
  "Technical difficulty monitoring ECG or BP",
];

const STOPPING_CRITERIA_RELATIVE: string[] = [
  "SBP ≥ 250 mmHg or DBP ≥ 115 mmHg",
  "ST depression ≥ 2 mm horizontal / down-sloping",
  "Multifocal PVCs, triplets, SVT, bradyarrhythmias, heart block",
  "Severe leg cramps / claudication or disabling muscle pain",
  "Increasing chest pain not yet meeting angina criteria",
  "Fatigue, SOB, wheezing that limit continuation",
  "HR ≥ 100% of predicted HRmax (220 − age) with symptoms",
  "SpO₂ 85–89% with symptoms",
  "Hypertensive response with headache",
];

/* Modality-specific equipment / setup / execution */
interface ModalitySpec {
  equipment: string[];
  setup: string[];
  execution: string[];
}

const TREADMILL_SPEC: ModalitySpec = {
  equipment: [
    "Motorised treadmill (0–22% grade, 0–7 mph)",
    "Front handrails (light touch only — do not weight-bear)",
    "12-lead exercise ECG with cable long enough for full stride",
    "Automated BP cuff (arm brace to reduce motion artefact)",
    "Pulse oximeter on non-dominant finger or forehead",
    "Rating of Perceived Exertion (Borg 6–20) chart at eye level",
  ],
  setup: [
    "Skin prep and place 10 ECG electrodes (Mason–Likar torso positions).",
    "Baseline supine and standing 12-lead ECG + BP × 2.",
    "Fit SpO₂ probe; confirm signal quality with walking motion.",
    "Explain Bruce ramp (speed + grade every 3 min) and hand signals for stop.",
    "Trial 1 min at 1.7 mph / 0% flat to teach gait and handrail use.",
  ],
  execution: [
    "Start Stage 1 (1.7 mph @ 10%) — begin continuous ECG recording.",
    "At each 3-min stage: record HR, BP, SpO₂, RPE, symptoms, lactate.",
    "Increment speed AND grade at every stage transition per Bruce protocol.",
    "Verbal encouragement each minute; check patient every 30 s in last stage.",
    "Terminate for any absolute criterion OR patient request; hit E-STOP.",
    "Cool-down: 1.5 mph / 0% for 3 min unless clinically unstable.",
  ],
};

const BIKE_SPEC: ModalitySpec = {
  equipment: [
    "Electronically braked cycle ergometer (25 W increments)",
    "Adjustable seat and handlebars (knee 5–10° flexion at pedal bottom)",
    "12-lead ECG with limb leads on torso (Mason–Likar)",
    "Automated BP cuff on the arm resting on handlebar",
    "Pulse oximeter on ear-clip (finger motion is less on bike but still noisy)",
    "Rating of Perceived Exertion (Borg 6–20) chart",
  ],
  setup: [
    "Adjust saddle height so knee ~10° flexion at pedal bottom.",
    "Place 10 ECG electrodes (Mason–Likar torso positions).",
    "Baseline seated + standing ECG and BP.",
    "Set target cadence 60 rpm; teach patient to hold cadence within ±5 rpm.",
    "Zero the ergometer; unloaded 1-min warm-up at 0 W, 60 rpm.",
  ],
  execution: [
    "Start Stage 1 (25 W) — begin continuous ECG recording.",
    "Every 3 min: increase load by 25 W (or 15 W for de-conditioned patients).",
    "At each stage: record HR, BP, SpO₂, RPE, symptoms, lactate in last 30 s.",
    "Terminate if cadence drops below 50 rpm despite encouragement, or any stopping criterion.",
    "Cool-down: 3 min at 25 W, 60 rpm; continue ECG until HR < 100 or 5 min.",
  ],
};


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

function predictedHRmax(age: number) {
  return 220 - age;
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
  if (early.some((l) => l > 3.5))
    parts.push(
      "Early lactate spike (>3.5 mmol/L at low workload) → suggests impaired oxidative phosphorylation (mitochondrial myopathy possible).",
    );
  if (peak > 6.0 && stages.length <= 3)
    parts.push(
      "Severe lactic acidosis (>6 mmol/L) at modest workload → highly suspicious for mitochondrial disease.",
    );
  if (peak < 2.0 && baseline <= 1.5 && lacs.length >= 3)
    parts.push(
      "Completely flat lactate curve (<2 mmol/L) despite rising workload → classic for blocked glycogenolysis (McArdle disease / GSD V).",
    );
  if (hrs.length >= 3 && hrs[2] <= hrs[1])
    parts.push(
      "Heart-rate plateau or drop after ~6–9 min may represent the 'second-wind' phenomenon (supports McArdle).",
    );

  if (parts.length === 1)
    parts.push(
      "No clear mitochondrial or glycogen-storage signature; clinical correlation required.",
    );
  return parts.join(" ");
}

/* Indications and interpretive thresholds (metabolic myopathy focus) */
const ETT_INDICATIONS: string[] = [
  "Exercise intolerance disproportionate to weakness",
  "Suspected mitochondrial myopathy (CPEO, MELAS, MERRF)",
  "Evaluation of the second-wind phenomenon in glycogen storage diseases",
  "Unexplained exertional dyspnoea with normal cardiopulmonary work-up",
  "Assessment of functional capacity in known metabolic myopathies",
  "Differentiation between deconditioning and metabolic muscle disease",
];

const ETT_KEY_INTERPRETATIONS: { title: string; text: string }[] = [
  {
    title: "VO₂max",
    text: "Reduced (<80% predicted) suggests impaired oxidative capacity — seen in mitochondrial myopathies.",
  },
  {
    title: "Lactate threshold",
    text: "Premature rise (<50% of predicted workload) indicates mitochondrial dysfunction.",
  },
  {
    title: "Excessive lactate",
    text: ">8–10 mmol/L at submaximal work suggests mitochondrial disease.",
  },
  {
    title: "Lactate : Pyruvate ratio",
    text: "Elevated (>20:1) supports mitochondrial dysfunction (block at complex I / respiratory chain).",
  },
  {
    title: "Second-wind phenomenon",
    text: "Improved performance after 8–10 min suggests McArdle disease (glycogenosis V).",
  },
  {
    title: "Normal test",
    text: "Does not exclude metabolic myopathy — some disorders only manifest during specific activities.",
  },
];

interface MitoFlags {
  pctPredictedVo2: number | null;
  vo2Reduced: boolean;
  earlyLactateThreshold: boolean;
  excessiveSubmaxLactate: boolean;
  elevatedLpRatio: boolean;
  worstLpRatio: number | null;
  secondWindPositive: boolean;
}

function computeMitoFlags(
  peakVo2: number,
  predictedVo2: number,
  stages: StageData[],
  totalStages: number,
  secondWind: SecondWind,
): MitoFlags {
  const pctPredictedVo2 = predictedVo2 > 0 ? (peakVo2 / predictedVo2) * 100 : null;

  // Lactate threshold ≈ first stage where lactate ≥ 4 mmol/L (OBLA); early if occurs before 50% of planned stages
  const thresholdStage = stages.find((s) => s.lactate != null && s.lactate >= 4);
  const earlyLactateThreshold =
    !!thresholdStage &&
    totalStages > 0 &&
    thresholdStage.stage / totalStages < 0.5;

  // Excessive submax lactate: >8 mmol/L before the last stage
  const excessiveSubmaxLactate = stages.some(
    (s, i) =>
      s.lactate != null && s.lactate > 8 && i < Math.max(0, stages.length - 1),
  );

  // L:P ratio
  const ratios = stages
    .map((s) =>
      s.lactate != null && s.pyruvate != null && s.pyruvate > 0
        ? s.lactate / s.pyruvate
        : null,
    )
    .filter((r): r is number => r != null);
  const worstLpRatio = ratios.length ? Math.max(...ratios) : null;
  const elevatedLpRatio = worstLpRatio != null && worstLpRatio > 20;

  // Second wind: HR drop or lactate drop/stabilisation with continued exercise around 8–10 min
  const secondWindPositive =
    secondWind.tested &&
    (secondWind.improved ||
      (secondWind.lactate != null &&
        stages.some(
          (s) => s.lactate != null && secondWind.lactate! < s.lactate,
        )));

  return {
    pctPredictedVo2,
    vo2Reduced: pctPredictedVo2 != null && pctPredictedVo2 < 80,
    earlyLactateThreshold,
    excessiveSubmaxLactate,
    elevatedLpRatio,
    worstLpRatio,
    secondWindPositive,
  };
}

/* -------------------------------------------------------------------------- */
/* Small reusable UI */
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

function InfoPopover({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <span className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-rose-400"
        aria-label={title}
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span className="absolute left-1/2 top-6 z-30 w-72 -translate-x-1/2 rounded-lg border border-border bg-popover p-3 text-xs text-popover-foreground shadow-xl">
          <span className="mb-1 block text-xs font-semibold text-rose-400">
            {title}
          </span>
          <span className="block leading-relaxed">{children}</span>
        </span>
      )}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Lactate curve with reference lines */
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

  const W = 360;
  const H = 180;
  const pad = { top: 12, right: 12, bottom: 30, left: 38 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;

  const maxLac = Math.max(6.5, ...data.map((d) => d.lactate)) * 1.1;
  const lacRange = maxLac || 1;
  const maxStage = Math.max(...data.map((d) => d.stage));

  const xScale = (s: number) => pad.left + ((s - 1) / Math.max(1, maxStage - 1)) * iw;
  const yScale = (l: number) => pad.top + ih - (l / lacRange) * ih;

  const points = data.map((d) => `${xScale(d.stage)},${yScale(d.lactate)}`).join(" ");

  const refs = [
    { y: 2, label: "AT ~2", color: "#38bdf8" },
    { y: 4, label: "OBLA ~4", color: "#fbbf24" },
    { y: 6, label: "Severe ≥6", color: "#f43f5e" },
  ];

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[420px]">
        {[0, 2, 4, 6, 8, 10].filter((v) => v <= maxLac).map((v) => (
          <g key={v}>
            <line
              x1={pad.left}
              y1={yScale(v)}
              x2={W - pad.right}
              y2={yScale(v)}
              stroke="currentColor"
              className="text-border"
              strokeWidth={0.5}
            />
            <text
              x={pad.left - 4}
              y={yScale(v) + 3}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {v}
            </text>
          </g>
        ))}

        {refs.map((r) =>
          r.y < maxLac ? (
            <g key={r.y}>
              <line
                x1={pad.left}
                y1={yScale(r.y)}
                x2={W - pad.right}
                y2={yScale(r.y)}
                stroke={r.color}
                strokeDasharray="3 3"
                strokeWidth={1}
                opacity={0.6}
              />
              <text
                x={W - pad.right - 2}
                y={yScale(r.y) - 3}
                textAnchor="end"
                fill={r.color}
                fontSize={8.5}
                opacity={0.9}
              >
                {r.label}
              </text>
            </g>
          ) : null,
        )}

        <text
          x={W / 2}
          y={H - 4}
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

        <polyline
          points={points}
          fill="none"
          stroke="#f43f5e"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={xScale(d.stage)}
            cy={yScale(d.lactate)}
            r={3.5}
            fill="#f43f5e"
          />
        ))}
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HR chart with rich tooltip + predicted HRmax overlay */
/* -------------------------------------------------------------------------- */

function HRChart({
  stages,
  modality,
  age,
}: {
  stages: StageData[];
  modality: Modality;
  age: number;
}) {
  const stageDefs = modality === "treadmill" ? BRUCE_STAGES : BIKE_STAGES;
  const [hovered, setHovered] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const data = stages
    .filter((s) => s.heartRate != null)
    .map((s) => {
      const def = stageDefs[s.stage - 1];
      const workload =
        modality === "treadmill" && def
          ? `${(def as (typeof BRUCE_STAGES)[number]).speed} mph @ ${(def as (typeof BRUCE_STAGES)[number]).grade}%`
          : def
            ? `${(def as (typeof BIKE_STAGES)[number]).watts} W`
            : "—";
      return {
        stage: s.stage,
        hr: s.heartRate as number,
        mets: def?.mets ?? 0,
        workload,
        time: s.stage * 3,
      };
    });

  if (data.length < 1)
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-8 text-xs text-muted-foreground">
        Enter at least one HR to see the chart.
      </div>
    );

  const W = 420;
  const H = 200;
  const pad = { top: 12, right: 14, bottom: 30, left: 38 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;

  const hrMax = predictedHRmax(age);
  const yMax = Math.max(hrMax + 15, ...data.map((d) => d.hr)) * 1.05;
  const maxStage = Math.max(...data.map((d) => d.stage), 2);

  const xScale = (s: number) => pad.left + ((s - 1) / Math.max(1, maxStage - 1)) * iw;
  const yScale = (v: number) => pad.top + ih - (v / yMax) * ih;

  const points = data.map((d) => `${xScale(d.stage)},${yScale(d.hr)}`).join(" ");

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[480px]"
        onMouseLeave={() => setHovered(null)}
      >
        {[0, 60, 100, 140, 180, 220].filter((v) => v <= yMax).map((v) => (
          <g key={v}>
            <line
              x1={pad.left}
              y1={yScale(v)}
              x2={W - pad.right}
              y2={yScale(v)}
              stroke="currentColor"
              className="text-border"
              strokeWidth={0.5}
            />
            <text
              x={pad.left - 4}
              y={yScale(v) + 3}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={9}
            >
              {v}
            </text>
          </g>
        ))}

        {/* Predicted HRmax line */}
        <line
          x1={pad.left}
          y1={yScale(hrMax)}
          x2={W - pad.right}
          y2={yScale(hrMax)}
          stroke="#fbbf24"
          strokeDasharray="4 3"
          strokeWidth={1.2}
        />
        <text
          x={W - pad.right - 2}
          y={yScale(hrMax) - 3}
          textAnchor="end"
          fill="#fbbf24"
          fontSize={9}
        >
          Predicted HRmax {hrMax}
        </text>

        <text
          x={W / 2}
          y={H - 4}
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
          HR (bpm)
        </text>

        <polyline
          points={points}
          fill="none"
          stroke="#f43f5e"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={xScale(d.stage)}
            cy={yScale(d.hr)}
            r={hovered === i ? 5 : 3.5}
            fill="#f43f5e"
            onMouseEnter={() => setHovered(i)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </svg>

      {hovered !== null && data[hovered] && (
        <div
          className="pointer-events-none absolute z-20 rounded-lg border border-border bg-popover px-3 py-2 text-[11px] shadow-xl"
          style={{
            left: `${(xScale(data[hovered].stage) / W) * 100}%`,
            top: 4,
            transform: "translateX(-50%)",
            minWidth: 160,
          }}
        >
          <div className="mb-1 font-semibold text-rose-400">
            Stage {data[hovered].stage} · {data[hovered].time} min
          </div>
          <div>Workload: {data[hovered].workload}</div>
          <div>METs: {data[hovered].mets.toFixed(1)}</div>
          <div>HR: {data[hovered].hr} bpm</div>
          <div>Predicted HRmax: {hrMax}</div>
          <div className="mt-0.5 text-fuchsia-400">
            {((data[hovered].hr / hrMax) * 100).toFixed(0)}% of predicted
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* RPE chart */
/* -------------------------------------------------------------------------- */

function RPEChart({ stages }: { stages: StageData[] }) {
  const data = stages
    .filter((s) => s.rpe != null)
    .map((s) => ({ stage: s.stage, rpe: s.rpe as number }));
  if (data.length < 1)
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-8 text-xs text-muted-foreground">
        No RPE recorded.
      </div>
    );
  const W = 360;
  const H = 160;
  const pad = { top: 12, right: 12, bottom: 28, left: 32 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;
  const maxStage = Math.max(...data.map((d) => d.stage), 2);
  const xScale = (s: number) => pad.left + ((s - 1) / Math.max(1, maxStage - 1)) * iw;
  const yScale = (v: number) => pad.top + ih - ((v - 6) / 14) * ih;
  const points = data.map((d) => `${xScale(d.stage)},${yScale(d.rpe)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[420px]">
      {[6, 10, 14, 18, 20].map((v) => (
        <g key={v}>
          <line
            x1={pad.left}
            y1={yScale(v)}
            x2={W - pad.right}
            y2={yScale(v)}
            stroke="currentColor"
            className="text-border"
            strokeWidth={0.5}
          />
          <text
            x={pad.left - 4}
            y={yScale(v) + 3}
            textAnchor="end"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {v}
          </text>
        </g>
      ))}
      <polyline
        points={points}
        fill="none"
        stroke="#a855f7"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {data.map((d, i) => (
        <circle key={i} cx={xScale(d.stage)} cy={yScale(d.rpe)} r={3.5} fill="#a855f7" />
      ))}
      <text
        x={10}
        y={H / 2}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={9}
        transform={`rotate(-90, 10, ${H / 2})`}
      >
        Borg RPE
      </text>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Formula explainer (always shown) */
/* -------------------------------------------------------------------------- */

function MethodExplainer() {
  return (
    <div className="rounded-lg border border-border bg-surface/40 p-4 text-xs leading-relaxed">
      <h4 className="mb-2 text-sm font-semibold text-rose-400">
        How the Estimated VO₂max is calculated
      </h4>
      <p className="mb-2">
        VO₂max is <em>estimated</em> from time-to-exhaustion (treadmill) or peak
        workload (bike). This is a prediction — not a gas-exchange measurement.
      </p>
      <ul className="ml-4 list-disc space-y-1">
        <li>
          <strong>T</strong> = total time to exhaustion on the treadmill in{" "}
          <em>decimal minutes</em>. Convert seconds by dividing by 60. Examples:
          9 min 15 s → 9.25 min; 7 min 30 s → 7.50 min; 10 min 45 s → 10.75 min.
        </li>
        <li>
          <strong>Bruce (men):</strong> VO₂ = 14.76 − 1.379·T + 0.451·T² −
          0.012·T³
        </li>
        <li>
          <strong>Bruce (women):</strong> VO₂ = 4.38·T − 3.9
        </li>
        <li>
          <strong>Bicycle:</strong> VO₂ = (10.8 × Watts / body-mass kg) + 7
        </li>
        <li>
          <strong>METs conversion:</strong> METs = VO₂ ÷ 3.5 (1 MET ≈ 3.5
          mL/kg/min)
        </li>
        <li>
          <strong>Predicted HRmax:</strong> 220 − age
        </li>
      </ul>
      <p className="mt-2 text-amber-400">
        Caveat: estimated only — a metabolic cart (gas exchange) is required for
        true VO₂max.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Combined Lactate / Pyruvate / VBG chart across baseline → stages → recovery */
/* -------------------------------------------------------------------------- */

function MultiParamChart({
  stages,
  recovery,
  secondWind,
  totalStages,
}: {
  stages: StageData[];
  recovery: VitalsRecovery;
  secondWind: SecondWind;
  totalStages: number;
}) {
  interface Pt {
    label: string;
    x: number;
    lactate: number | null;
    pyruvate: number | null;
    ph: number | null;
    hco3: number | null;
    lp: number | null;
  }
  const points: Pt[] = [];
  points.push({ label: "Base", x: 0, lactate: null, pyruvate: null, ph: null, hco3: null, lp: null });
  stages.forEach((s) => {
    const lp = s.lactate != null && s.pyruvate != null && s.pyruvate > 0
      ? s.lactate / s.pyruvate
      : null;
    points.push({
      label: `S${s.stage}`,
      x: s.stage,
      lactate: s.lactate,
      pyruvate: s.pyruvate,
      ph: s.ph,
      hco3: s.hco3,
      lp,
    });
  });
  if (recovery.lactate != null || recovery.pyruvate != null) {
    points.push({
      label: "Rec",
      x: (stages.length || 0) + 1,
      lactate: recovery.lactate,
      pyruvate: recovery.pyruvate,
      ph: null,
      hco3: null,
      lp:
        recovery.lactate != null && recovery.pyruvate != null && recovery.pyruvate > 0
          ? recovery.lactate / recovery.pyruvate
          : null,
    });
  }
  if (secondWind.tested && (secondWind.lactate != null || secondWind.pyruvate != null)) {
    points.push({
      label: "SW",
      x: (stages.length || 0) + 2,
      lactate: secondWind.lactate,
      pyruvate: secondWind.pyruvate,
      ph: null,
      hco3: null,
      lp:
        secondWind.lactate != null && secondWind.pyruvate != null && secondWind.pyruvate > 0
          ? secondWind.lactate / secondWind.pyruvate
          : null,
    });
  }

  const hasData = points.some((p) => p.lactate != null || p.pyruvate != null);
  if (!hasData) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-8 text-xs text-muted-foreground">
        Enter lactate and pyruvate to see the combined curve.
      </div>
    );
  }

  const W = 480;
  const H = 220;
  const pad = { top: 12, right: 46, bottom: 32, left: 40 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;

  const maxLac = Math.max(
    10,
    ...points.map((p) => p.lactate ?? 0),
    ...points.map((p) => (p.pyruvate ?? 0) * 5),
  );
  const maxX = Math.max(...points.map((p) => p.x), 1);
  const xScale = (x: number) => pad.left + (x / maxX) * iw;
  const yScale = (v: number) => pad.top + ih - (v / maxLac) * ih;

  // Detect lactate threshold (first stage lactate ≥ 4)
  const threshold = points.find((p) => p.lactate != null && p.lactate >= 4);
  const earlyThreshold =
    threshold &&
    threshold.x > 0 &&
    totalStages > 0 &&
    threshold.x / totalStages < 0.5;

  const line = (accessor: (p: Pt) => number | null) =>
    points
      .filter((p) => accessor(p) != null)
      .map((p) => `${xScale(p.x)},${yScale(accessor(p) as number)}`)
      .join(" ");

  const highLp = points.filter((p) => p.lp != null && p.lp > 20);

  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[560px]">
        {[0, 2, 4, 6, 8, 10, 14, 18].filter((v) => v <= maxLac).map((v) => (
          <g key={v}>
            <line
              x1={pad.left}
              y1={yScale(v)}
              x2={W - pad.right}
              y2={yScale(v)}
              stroke="currentColor"
              className="text-border"
              strokeWidth={0.5}
            />
            <text x={pad.left - 4} y={yScale(v) + 3} textAnchor="end" fontSize={9} className="fill-muted-foreground">{v}</text>
          </g>
        ))}
        {/* threshold ref */}
        {maxLac >= 4 && (
          <>
            <line x1={pad.left} y1={yScale(4)} x2={W - pad.right} y2={yScale(4)} stroke="#fbbf24" strokeDasharray="4 3" strokeWidth={1} opacity={0.7} />
            <text x={W - pad.right - 2} y={yScale(4) - 3} textAnchor="end" fill="#fbbf24" fontSize={9}>Lactate threshold ≈ 4</text>
          </>
        )}
        {/* threshold vertical marker */}
        {threshold && (
          <g>
            <line x1={xScale(threshold.x)} y1={pad.top} x2={xScale(threshold.x)} y2={pad.top + ih} stroke={earlyThreshold ? "#f43f5e" : "#38bdf8"} strokeDasharray="3 3" strokeWidth={1} opacity={0.8} />
            <text x={xScale(threshold.x) + 3} y={pad.top + 10} fontSize={9} fill={earlyThreshold ? "#f43f5e" : "#38bdf8"}>
              LT @ {threshold.label}{earlyThreshold ? " (early)" : ""}
            </text>
          </g>
        )}

        {/* x-axis labels */}
        {points.map((p) => (
          <text key={p.label} x={xScale(p.x)} y={H - 12} textAnchor="middle" fontSize={9} className="fill-muted-foreground">{p.label}</text>
        ))}

        {/* Lactate line */}
        <polyline points={line((p) => p.lactate)} fill="none" stroke="#f43f5e" strokeWidth={2} />
        {points.filter((p) => p.lactate != null).map((p, i) => (
          <circle key={`l${i}`} cx={xScale(p.x)} cy={yScale(p.lactate as number)} r={3} fill="#f43f5e" />
        ))}
        {/* Pyruvate line — scaled ×5 for visibility, dashed */}
        <polyline
          points={points.filter((p) => p.pyruvate != null).map((p) => `${xScale(p.x)},${yScale((p.pyruvate as number) * 5)}`).join(" ")}
          fill="none"
          stroke="#a855f7"
          strokeWidth={2}
          strokeDasharray="4 3"
        />
        {points.filter((p) => p.pyruvate != null).map((p, i) => (
          <circle key={`p${i}`} cx={xScale(p.x)} cy={yScale((p.pyruvate as number) * 5)} r={3} fill="#a855f7" />
        ))}
        {/* pH line — normalise: (pH − 7.2) × 40 to overlay */}
        <polyline
          points={points.filter((p) => p.ph != null).map((p) => `${xScale(p.x)},${yScale(((p.ph as number) - 7.2) * 40)}`).join(" ")}
          fill="none"
          stroke="#38bdf8"
          strokeWidth={1.5}
          strokeDasharray="1 2"
        />

        {/* L:P > 20 callouts */}
        {highLp.map((p, i) => (
          <g key={`lp${i}`}>
            <circle cx={xScale(p.x)} cy={yScale(p.lactate ?? 0)} r={7} fill="none" stroke="#f43f5e" strokeWidth={1.2} />
            <text x={xScale(p.x)} y={yScale(p.lactate ?? 0) - 10} textAnchor="middle" fontSize={9} fill="#f43f5e">
              L:P {p.lp!.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Legend */}
        <g transform={`translate(${pad.left}, ${pad.top - 2})`}>
          <text x={0} y={-2} fontSize={9} fill="#f43f5e">■ Lactate</text>
          <text x={60} y={-2} fontSize={9} fill="#a855f7">■ Pyruvate ×5</text>
          <text x={140} y={-2} fontSize={9} fill="#38bdf8">■ pH (normalised)</text>
        </g>
      </svg>
      <div className="flex flex-wrap gap-2 text-[11px]">
        {earlyThreshold && (
          <span className="rounded bg-rose-500/15 px-2 py-0.5 text-rose-400">
            Early lactate threshold ({"<"}50% workload) — consider mitochondrial dysfunction
          </span>
        )}
        {highLp.length > 0 && (
          <span className="rounded bg-rose-500/15 px-2 py-0.5 text-rose-400">
            L:P ratio {'>'} 20 detected — supports mitochondrial dysfunction
          </span>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main */
/* -------------------------------------------------------------------------- */

export function ExerciseToleranceTest() {
  const [step, setStep] = useState<
    "patient" | "prep" | "protocol" | "recovery" | "report"
  >("patient");

  const [patient, setPatient] = useState<Patient>({
    name: "",
    age: 0,
    sex: "M",
    weightKg: 70,
    heightCm: 170,
    restingHr: 70,
    suspected: "unspecified",
    orthoLimitations: "",
  });

  const [prepChecks, setPrepChecks] = useState<PrepChecks>({
    fasted: false,
    noExercise: false,
    noSubstances: false,
    hydrated: false,
    consent: false,
  });
  const [equipment, setEquipment] = useState<EquipmentChecks>({
    treadmillOrBike: false,
    ecg: false,
    pulseOx: false,
    bpCuff: false,
    lactateMeter: false,
    vbgSyringes: false,
    cpkTubes: false,
    ammoniaTubes: false,
    ivAccess: false,
    crashCart: false,
  });
  const [preCpk, setPreCpk] = useState<number | null>(null);

  const [modality, setModality] = useState<Modality>("treadmill");
  const [samplingMethod, setSamplingMethod] = useState<SamplingMethod>("capillary");
  const [stages, setStages] = useState<StageData[]>([]);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [terminatedEarly, setTerminatedEarly] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");

  const [postCpk, setPostCpk] = useState<number | null>(null);
  const [recoveryVitals, setRecoveryVitals] = useState<VitalsRecovery>({
    hr: null,
    lactate: null,
    pyruvate: null,
    sao2: null,
    symptoms: "",
  });
  const [recoveryDone, setRecoveryDone] = useState(false);

  const [secondWind, setSecondWind] = useState<SecondWind>({
    tested: false,
    minute: null,
    heartRate: null,
    lactate: null,
    pyruvate: null,
    rpe: null,
    improved: false,
    notes: "",
  });

  const [hr, setHr] = useState("");
  const [rpe, setRpe] = useState("");
  const [lactate, setLactate] = useState("");
  const [pyruvate, setPyruvate] = useState("");
  const [sao2, setSao2] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [ph, setPh] = useState("");
  const [hco3, setHco3] = useState("");
  const [pco2, setPco2] = useState("");
  const [po2, setPo2] = useState("");

  const totalSteps = 5;
  const stageDefs = modality === "treadmill" ? BRUCE_STAGES : BIKE_STAGES;
  const currentStageDef = stageDefs[currentStageIdx];

  const computedVo2 = useMemo(() => {
    if (stages.length === 0) return null;
    const last = stages[stages.length - 1];
    const idx = last.stage - 1;
    if (modality === "treadmill") {
      const T = (idx + 1) * 3; // Each Bruce stage = 3 min → T in decimal minutes
      const vo2 =
        patient.sex === "M" ? vo2BruceMen(T) : vo2BruceWomen(T);
      return { vo2, mets: metsFromVo2(vo2), T, watts: null as number | null };
    } else {
      const watts = BIKE_STAGES[idx]?.watts ?? 0;
      const vo2 = vo2FromBike(watts, patient.weightKg);
      return { vo2, mets: metsFromVo2(vo2), T: null as number | null, watts };
    }
  }, [stages, modality, patient.sex, patient.weightKg]);

  const peakVo2 = computedVo2?.vo2 ?? 0;
  const peakMets = computedVo2?.mets ?? 0;
  const fitness = peakVo2 ? categorizeFitness(peakVo2, patient.age, patient.sex) : "";

  const hrValues = stages.map((s) => s.heartRate).filter((h): h is number => h != null);
  const rpeValues = stages.map((s) => s.rpe).filter((r): r is number => r != null);
  const peakHR = hrValues.length ? Math.max(...hrValues) : 0;
  const peakRpe = rpeValues.length ? Math.max(...rpeValues) : 0;
  const hrMax = predictedHRmax(patient.age);
  const pctHRmax = peakHR && hrMax ? (peakHR / hrMax) * 100 : 0;
  const chronotropicIndex =
    peakHR && patient.restingHr && hrMax > patient.restingHr
      ? (peakHR - patient.restingHr) / (hrMax - patient.restingHr)
      : 0;
  const chronotropicInterp =
    chronotropicIndex >= 0.8
      ? "Normal chronotropic response"
      : chronotropicIndex >= 0.6
        ? "Borderline chronotropic response"
        : chronotropicIndex > 0
          ? "Chronotropic incompetence (CI < 0.8)"
          : "—";
  const hrAlert =
    pctHRmax >= 100
      ? { level: "high", msg: "Peak HR ≥ predicted HRmax — near-maximal effort." }
      : pctHRmax > 0 && pctHRmax < 75
        ? {
            level: "low",
            msg: "Peak HR < 75% of predicted — sub-maximal effort or chronotropic issue.",
          }
        : null;

  /* ---- Handlers ---- */
  function addStage() {
    const stageNum = currentStageIdx + 1;
    const data: StageData = {
      stage: stageNum,
      heartRate: hr ? parseFloat(hr) : null,
      rpe: rpe ? parseInt(rpe) : null,
      lactate: lactate ? parseFloat(lactate) : null,
      pyruvate: pyruvate ? parseFloat(pyruvate) : null,
      sao2: sao2 ? parseFloat(sao2) : null,
      symptoms,
      ph: samplingMethod === "iv_vbg" && ph ? parseFloat(ph) : null,
      hco3: samplingMethod === "iv_vbg" && hco3 ? parseFloat(hco3) : null,
      pco2: samplingMethod === "iv_vbg" && pco2 ? parseFloat(pco2) : null,
      po2: samplingMethod === "iv_vbg" && po2 ? parseFloat(po2) : null,
    };
    setStages((prev) => [...prev, data]);
    setCurrentStageIdx((prev) => prev + 1);
    setHr("");
    setRpe("");
    setLactate("");
    setPyruvate("");
    setSao2("");
    setSymptoms("");
    setPh("");
    setHco3("");
    setPco2("");
    setPo2("");
  }

  function finishProtocol() {
    if (hr || lactate || rpe) addStage();
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
      restingHr: 70,
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
    setEquipment({
      treadmillOrBike: false,
      ecg: false,
      pulseOx: false,
      bpCuff: false,
      lactateMeter: false,
      vbgSyringes: false,
      cpkTubes: false,
      ammoniaTubes: false,
      ivAccess: false,
      crashCart: false,
    });
    setPreCpk(null);
    setModality("treadmill");
    setSamplingMethod("capillary");
    setStages([]);
    setCurrentStageIdx(0);
    setTerminatedEarly(false);
    setTerminationReason("");
    setPostCpk(null);
    setRecoveryVitals({ hr: null, lactate: null, pyruvate: null, sao2: null, symptoms: "" });
    setRecoveryDone(false);
    setSecondWind({
      tested: false,
      minute: null,
      heartRate: null,
      lactate: null,
      pyruvate: null,
      rpe: null,
      improved: false,
      notes: "",
    });
    setHr("");
    setRpe("");
    setLactate("");
    setPyruvate("");
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

  function buildProtocolText(): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    const timeStr = now.toLocaleTimeString();

    const defs = modality === "treadmill" ? BRUCE_STAGES : BIKE_STAGES;
    const stageTable = defs
      .map((s, i) => {
        const recorded = stages.find((st) => st.stage === i + 1);
        const workload =
          modality === "treadmill"
            ? `${(s as (typeof BRUCE_STAGES)[number]).speed} mph @ ${(s as (typeof BRUCE_STAGES)[number]).grade}%`
            : `${(s as (typeof BIKE_STAGES)[number]).watts} W`;
        const hrv = recorded?.heartRate ?? "";
        const sao2v = recorded?.sao2 ?? "";
        const rpev = recorded?.rpe ?? "";
        const lac = recorded?.lactate ?? "";
        const sym = recorded?.symptoms ?? "";
        const done = recorded ? "X" : "";
        const pad = (v: string | number, w: number) => String(v).padEnd(w);
        return `| ${pad(i + 1, 2)} | ${pad(workload, 16)} | ${pad(s.mets, 4)} | ${pad(hrv, 3)} | ${pad(sao2v, 3)} | ${pad(rpev, 2)} | ${pad(lac, 5)} | ${pad(sym, 12)} | ${pad(done, 3)} |`;
      })
      .join("\n");

    const samplingLabel =
      samplingMethod === "capillary"
        ? "Capillary (fingertip / earlobe)"
        : samplingMethod === "iv_lactate"
          ? "IV line — Lactate only"
          : "IV line — Full Venous Blood Gas (VBG)";

    const lines = [
      "=".repeat(60),
      "EXERCISE TOLERANCE TEST — PROTOCOL SHEET",
      "=".repeat(60),
      `Date: ${dateStr} ${timeStr}`,
      "",
      "PATIENT",
      ` Name: ${patient.name || "____________________"}`,
      ` Age: ${patient.age || "____"}  Sex: ${patient.sex === "M" ? "Male" : "Female"}  Weight: ${patient.weightKg || "___"} kg  Height: ${patient.heightCm || "___"} cm`,
      ` Resting HR: ${patient.restingHr} bpm`,
      ` Suspected diagnosis: ${patient.suspected.replace(/_/g, " ")}`,
      ` Orthopaedic limitations: ${patient.orthoLimitations || "None"}`,
      "",
      `MODALITY: ${modality === "treadmill" ? "Treadmill — Modified Bruce" : "Bicycle Ergometer"}`,
      `SAMPLING METHOD: ${samplingLabel}`,
      "",
      "REQUIRED EQUIPMENT & BLOOD TESTS",
      " [ ] Treadmill or bicycle ergometer",
      " [ ] 12-lead ECG monitor (continuous)",
      " [ ] Pulse oximeter (SpO₂)",
      " [ ] Sphygmomanometer / automated BP cuff",
      " [ ] Point-of-care lactate meter + strips",
      " [ ] VBG syringes (if IV / VBG sampling)",
      " [ ] CPK tubes (pre-test + 24 h post)",
      " [ ] Ammonia tubes (on ice — for forearm/exercise tests)",
      " [ ] IV access + saline flush",
      " [ ] Crash cart / defibrillator / oxygen",
      " [ ] Rating of Perceived Exertion (Borg 6–20) chart",
      "",
      "PRE-TEST PREPARATION CHECKLIST",
      ` [${prepChecks.fasted ? "X" : " "}] Fasted 4–6 h`,
      ` [${prepChecks.noExercise ? "X" : " "}] No strenuous exercise in last 24–48 h`,
      ` [${prepChecks.noSubstances ? "X" : " "}] No caffeine / nicotine / alcohol in last 12 h`,
      ` [${prepChecks.hydrated ? "X" : " "}] Adequate hydration until 1 h before test`,
      ` [${prepChecks.consent ? "X" : " "}] Informed consent obtained`,
      "",
      "CPK (Creatine Kinase)",
      ` Pre-test CPK: ${preCpk !== null ? `${preCpk} U/L` : "___ U/L"}`,
      ` Post-test CPK (24 h): ${postCpk !== null ? `${postCpk} U/L` : "___ U/L"}`,
      "",
      "PROTOCOL NOTE",
      " Each stage = 3 minutes. Sample lactate in the last 30 s of the stage.",
      " Continuous ECG + BP monitoring; record HR, SpO₂, RPE, symptoms every stage.",
      "",
      "BLOOD-SAMPLING TIMELINE",
      ...SAMPLING_TIMELINE.flatMap((s) => [
        ` • ${s.when}`,
        `     Samples: ${s.samples.join(", ")}`,
        `     Notes:   ${s.notes}`,
      ]),
      "",
      "STOPPING CRITERIA — ABSOLUTE (stop immediately)",
      ...STOPPING_CRITERIA_ABSOLUTE.map((c) => ` • ${c}`),
      "",
      "STOPPING CRITERIA — RELATIVE (stop if concerning trend)",
      ...STOPPING_CRITERIA_RELATIVE.map((c) => ` • ${c}`),
      "",
      `MODALITY-SPECIFIC — ${modality === "treadmill" ? "TREADMILL (Modified Bruce)" : "BICYCLE ERGOMETER"}`,
      " Equipment:",
      ...(modality === "treadmill" ? TREADMILL_SPEC : BIKE_SPEC).equipment.map(
        (e) => `   • ${e}`,
      ),
      " Setup:",
      ...(modality === "treadmill" ? TREADMILL_SPEC : BIKE_SPEC).setup.map(
        (s, i) => `   ${i + 1}. ${s}`,
      ),
      " Step-by-step execution:",
      ...(modality === "treadmill" ? TREADMILL_SPEC : BIKE_SPEC).execution.map(
        (s, i) => `   ${i + 1}. ${s}`,
      ),
      "",

      "STAGE-BY-STAGE DATA",
      "-".repeat(60),
      "Stg | Workload         | METs | HR  | SpO₂ | RPE | Lact  | Symptoms     | Done |",
      "-".repeat(60),
      stageTable,
      "-".repeat(60),
      "",
      `Early termination: ${terminatedEarly ? `Yes — ${terminationReason || "Not specified"}` : "No"}`,
      `Recovery completed: ${recoveryDone ? "Yes" : "No"}`,
      "",
      "RECOVERY VITALS",
      ` HR (1 min): ${recoveryVitals.hr ?? "—"} bpm`,
      ` Lactate: ${recoveryVitals.lactate != null ? `${recoveryVitals.lactate} mmol/L` : "—"}`,
      ` SpO₂: ${recoveryVitals.sao2 != null ? `${recoveryVitals.sao2}%` : "—"}`,
      ` Symptoms: ${recoveryVitals.symptoms || "—"}`,
      "",
      "RESULTS",
      ` Peak VO₂ (estimated): ${peakVo2.toFixed(1)} mL/kg/min`,
      ` Peak METs: ${peakMets.toFixed(1)}`,
      ` Predicted VO₂max: ${predictedVo2Max(patient.age, patient.sex).toFixed(1)} mL/kg/min`,
      ` Fitness category: ${fitness || "—"}`,
      ` Peak HR: ${peakHR || "—"} bpm  (${pctHRmax ? pctHRmax.toFixed(0) : "—"}% of predicted 220-age = ${hrMax})`,
      ` Chronotropic index: ${chronotropicIndex ? chronotropicIndex.toFixed(2) : "—"} (${chronotropicInterp})`,
      ` Peak RPE: ${peakRpe || "—"}`,
      "",
      "HOW THE ESTIMATED VO₂MAX WAS CALCULATED",
      " Method: submaximal / peak-workload prediction (not gas-exchange measurement).",
      " T = total time to exhaustion on the treadmill in DECIMAL MINUTES.",
      "   Examples: 9 min 15 s → 9.25 min; 7 min 30 s → 7.50 min; 10 min 45 s → 10.75 min.",
      " Formulas:",
      "   Bruce (men)   : VO₂ = 14.76 − 1.379·T + 0.451·T² − 0.012·T³",
      "   Bruce (women) : VO₂ = 4.38·T − 3.9",
      "   Bicycle       : VO₂ = (10.8 × Watts / body-mass kg) + 7",
      " METs conversion: METs = VO₂ / 3.5",
      " Predicted HRmax: 220 − age",
      "",
      "INPUTS USED FOR THIS PATIENT",
      ` Sex: ${patient.sex === "M" ? "Male" : "Female"}`,
      ` Age: ${patient.age} y`,
      ` Body mass: ${patient.weightKg} kg`,
      ` Modality: ${modality === "treadmill" ? "Modified Bruce Treadmill" : "Bicycle Ergometer"}`,
      modality === "treadmill"
        ? ` T (decimal minutes): ${computedVo2?.T ?? "—"}`
        : ` Peak workload: ${computedVo2?.watts ?? "—"} W`,
      ` VO₂: ${peakVo2.toFixed(1)} mL/kg/min`,
      ` METs: ${peakMets.toFixed(1)}`,
      ` Category: ${fitness || "—"}`,
      "",
      " Caveat: this VO₂max is ESTIMATED (not gas-exchange measured).",
      "",
      "LACTATE PATTERN",
      ` ${analyzeLactate(stages)}`,
      "",
      "EXERCISE TOLERANCE — CLINICAL MEANING",
      " Exercise tolerance = how much work the body can handle before stopping.",
      " Assessed by: total exercise time, estimated VO₂/METs, HR response, RPE,",
      " symptoms forcing stop. In metabolic muscle disease tolerance is often",
      " reduced due to early fatigue/pain rather than heart or lung disease.",
      " This test therefore provides BOTH exercise-tolerance data AND a lactate",
      " curve pointing to the type of metabolic problem.",
      "",
      "Signature (clinician): ______________________________",
      "-".repeat(60),
      "For educational reference only. Not a substitute for clinical judgment.",
    ];
    return lines.join("\n");
  }

  function downloadProtocolTxt() {
    const text = buildProtocolText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ett-protocol-${patient.name.replace(/\s+/g, "-") || "unnamed"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadProtocolPdf() {
    const text = buildProtocolText();
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    doc.setFont("courier", "normal");
    doc.setFontSize(9);
    const lineHeight = 11;
    const margin = 36;
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = margin;
    text.split("\n").forEach((line) => {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line || " ", margin, y);
      y += lineHeight;
    });
    doc.save(`ett-protocol-${patient.name.replace(/\s+/g, "-") || "unnamed"}.pdf`);
  }

  const allPrepDone = Object.values(prepChecks).every(Boolean);
  const patientValid =
    patient.name.trim().length > 0 && patient.age > 0 && patient.weightKg > 0;
  const stepIndex = ["patient", "prep", "protocol", "recovery", "report"].indexOf(step);

  return (
    <div className="space-y-6">
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
                onChange={(e) => setPatient((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. John Doe"
                className="rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/30"
              />
            </label>
            <NumberInput
              label="Age"
              value={patient.age ? String(patient.age) : ""}
              onChange={(v) => setPatient((p) => ({ ...p, age: parseFloat(v) || 0 }))}
              unit="years"
              min={0}
              max={120}
            />
            <SelectInput
              label="Sex"
              value={patient.sex}
              onChange={(v) => setPatient((p) => ({ ...p, sex: v as Sex }))}
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
            <NumberInput
              label="Resting HR"
              value={patient.restingHr ? String(patient.restingHr) : ""}
              onChange={(v) =>
                setPatient((p) => ({ ...p, restingHr: parseFloat(v) || 0 }))
              }
              unit="bpm"
              min={30}
              max={140}
            />
            <SelectInput
              label="Suspected Diagnosis"
              value={patient.suspected}
              onChange={(v) =>
                setPatient((p) => ({ ...p, suspected: v as SuspectedDiagnosis }))
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
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setStep("protocol")}
              className="text-xs text-muted-foreground underline hover:text-foreground"
            >
              Skip demographics — run test now
            </button>
            <button
              type="button"
              onClick={() => setStep("prep")}
              className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
            >
              Next: Pre-test Checks
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </SectionCard>
      )}

      {/* ========== PREP ========== */}
      {step === "prep" && (
        <div className="space-y-4">
          <SectionCard title="Required Equipment & Blood Tests" icon={ClipboardList}>
            <div className="grid gap-1 sm:grid-cols-2">
              <CheckItem
                checked={equipment.treadmillOrBike}
                label="Treadmill or bicycle ergometer"
                onToggle={() =>
                  setEquipment((e) => ({ ...e, treadmillOrBike: !e.treadmillOrBike }))
                }
              />
              <CheckItem
                checked={equipment.ecg}
                label="12-lead ECG monitor (continuous)"
                onToggle={() => setEquipment((e) => ({ ...e, ecg: !e.ecg }))}
              />
              <CheckItem
                checked={equipment.pulseOx}
                label="Pulse oximeter (SpO₂)"
                onToggle={() => setEquipment((e) => ({ ...e, pulseOx: !e.pulseOx }))}
              />
              <CheckItem
                checked={equipment.bpCuff}
                label="BP cuff / sphygmomanometer"
                onToggle={() => setEquipment((e) => ({ ...e, bpCuff: !e.bpCuff }))}
              />
              <CheckItem
                checked={equipment.lactateMeter}
                label="Point-of-care lactate meter + strips"
                onToggle={() =>
                  setEquipment((e) => ({ ...e, lactateMeter: !e.lactateMeter }))
                }
              />
              <CheckItem
                checked={equipment.vbgSyringes}
                label="VBG syringes (if IV / VBG sampling)"
                onToggle={() =>
                  setEquipment((e) => ({ ...e, vbgSyringes: !e.vbgSyringes }))
                }
              />
              <CheckItem
                checked={equipment.cpkTubes}
                label="CPK tubes (pre-test + 24 h post)"
                onToggle={() => setEquipment((e) => ({ ...e, cpkTubes: !e.cpkTubes }))}
              />
              <CheckItem
                checked={equipment.ammoniaTubes}
                label="Ammonia tubes (on ice)"
                onToggle={() =>
                  setEquipment((e) => ({ ...e, ammoniaTubes: !e.ammoniaTubes }))
                }
              />
              <CheckItem
                checked={equipment.ivAccess}
                label="IV access + saline flush"
                onToggle={() => setEquipment((e) => ({ ...e, ivAccess: !e.ivAccess }))}
              />
              <CheckItem
                checked={equipment.crashCart}
                label="Crash cart / defibrillator / O₂"
                onToggle={() =>
                  setEquipment((e) => ({ ...e, crashCart: !e.crashCart }))
                }
              />
            </div>
          </SectionCard>

          <SectionCard title="Pre-test Patient Checklist" icon={ClipboardList}>
            <div className="space-y-1">
              <CheckItem
                checked={prepChecks.fasted}
                label="Fasted ≥4 hours (clear fluids allowed)"
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
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
                Remember to draw <strong>post-test CPK at 24 h</strong> — enter in
                Recovery step.
              </div>
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
                className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
              >
                Next: Protocol
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </SectionCard>

          <SectionCard title="Blood-sampling Timeline" icon={Droplets}>
            <div className="space-y-2 text-xs">
              {SAMPLING_TIMELINE.map((row) => (
                <div
                  key={row.when}
                  className="rounded-lg border border-border bg-surface/40 p-3"
                >
                  <div className="font-semibold text-rose-400">{row.when}</div>
                  <div className="mt-0.5">
                    <span className="text-muted-foreground">Samples: </span>
                    {row.samples.join(", ")}
                  </div>
                  <div className="mt-0.5 text-muted-foreground">{row.notes}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Stopping Criteria" icon={AlertTriangle}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
                <div className="mb-2 text-xs font-semibold text-rose-400">
                  Absolute — stop immediately
                </div>
                <ul className="ml-4 list-disc space-y-1 text-xs">
                  {STOPPING_CRITERIA_ABSOLUTE.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <div className="mb-2 text-xs font-semibold text-amber-400">
                  Relative — stop if concerning trend
                </div>
                <ul className="ml-4 list-disc space-y-1 text-xs">
                  {STOPPING_CRITERIA_RELATIVE.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Modality-specific Setup & Execution"
            icon={Activity}
          >
            <div className="mb-3">
              <SelectInput
                label="Choose modality (pre-configures the protocol step)"
                value={modality}
                onChange={(v) => setModality(v as Modality)}
                options={[
                  { value: "treadmill", label: "Treadmill (Modified Bruce)" },
                  { value: "bike", label: "Bicycle Ergometer" },
                ]}
              />
            </div>
            {(["treadmill", "bike"] as const).map((m) => {
              const spec = m === "treadmill" ? TREADMILL_SPEC : BIKE_SPEC;
              const active = modality === m;
              return (
                <div
                  key={m}
                  className={`mt-3 rounded-lg border p-3 text-xs ${
                    active
                      ? "border-rose-500/40 bg-rose-500/5"
                      : "border-border bg-surface/30 opacity-70"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold">
                      {m === "treadmill"
                        ? "Treadmill — Modified Bruce"
                        : "Bicycle Ergometer"}
                    </div>
                    {active && (
                      <span className="rounded bg-rose-500/15 px-2 py-0.5 text-[10px] font-medium text-rose-400">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Required equipment
                      </div>
                      <ul className="ml-4 list-disc space-y-0.5">
                        {spec.equipment.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Setup
                      </div>
                      <ol className="ml-4 list-decimal space-y-0.5">
                        {spec.setup.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Step-by-step execution
                      </div>
                      <ol className="ml-4 list-decimal space-y-0.5">
                        {spec.execution.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              );
            })}
          </SectionCard>
        </div>
      )}


      {/* ========== PROTOCOL ========== */}
      {step === "protocol" && (
        <div className="space-y-4">
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
                  <AlertTriangle className="h-4 w-4" />
                  <span>Each stage = 3 min</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Treadmill MET timing table */}
          {modality === "treadmill" && (
            <SectionCard title="Bruce MET Timing Table" icon={LineChart}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="px-2 py-1.5">Stage</th>
                      <th className="px-2 py-1.5">Speed / Grade</th>
                      <th className="px-2 py-1.5">METs</th>
                      <th className="px-2 py-1.5">Assessed at (min)</th>
                      <th className="px-2 py-1.5">Cumulative T (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BRUCE_STAGES.map((s) => (
                      <tr key={s.stage} className="border-b border-border/50">
                        <td className="px-2 py-1.5 font-medium">{s.stage}</td>
                        <td className="px-2 py-1.5">
                          {s.speed} mph @ {s.grade}%
                        </td>
                        <td className="px-2 py-1.5">{s.mets}</td>
                        <td className="px-2 py-1.5">{s.stage * 3 - 0.5}</td>
                        <td className="px-2 py-1.5 font-mono">
                          {(s.stage * 3).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          )}

          {/* Current stage entry */}
          {currentStageDef && (
            <SectionCard
              title={`Stage ${currentStageIdx + 1} — ${
                modality === "treadmill"
                  ? `${(currentStageDef as (typeof BRUCE_STAGES)[number]).speed} mph @ ${(currentStageDef as (typeof BRUCE_STAGES)[number]).grade}%`
                  : `${(currentStageDef as (typeof BIKE_STAGES)[number]).watts} W`
              }`}
              icon={Heart}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <NumberInput
                  label="Heart Rate"
                  value={hr}
                  onChange={setHr}
                  unit="bpm"
                  min={30}
                  max={250}
                />
                <SelectInput
                  label="Borg RPE (6–20)"
                  value={rpe}
                  onChange={setRpe}
                  options={[{ value: "", label: "—" }, ...BORG_SCALE.map((b) => ({
                    value: String(b.value),
                    label: b.label,
                  }))]}
                />
                <div className="flex flex-col gap-1">
                  <span className="flex items-center text-xs font-medium text-muted-foreground">
                    Lactate
                    <span className="ml-1 font-mono text-[10px] text-muted-foreground/60">
                      (mmol/L)
                    </span>
                    <InfoPopover title="Sampling method comparison" className="ml-1">
                      <span className="block space-y-1">
                        <span className="block">
                          <strong>Capillary</strong> (fingertip/earlobe): fast,
                          minimally invasive; ~10–15% higher than venous at rest.
                        </span>
                        <span className="block">
                          <strong>IV lactate</strong>: venous sample from indwelling
                          line; more stable, no repeated punctures.
                        </span>
                        <span className="block">
                          <strong>IV VBG</strong>: venous blood gas — gives lactate
                          plus pH, HCO₃⁻, pCO₂, pO₂ for full acid–base picture.
                        </span>
                      </span>
                    </InfoPopover>
                  </span>
                  <input
                    type="number"
                    step={0.1}
                    value={lactate}
                    onChange={(e) => setLactate(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/30"
                  />
                </div>
                <NumberInput
                  label="SpO₂"
                  value={sao2}
                  onChange={setSao2}
                  unit="%"
                  min={50}
                  max={100}
                />
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Symptoms
                  </span>
                  <input
                    type="text"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. leg fatigue, mild dyspnoea"
                    className="rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/30"
                  />
                </label>

                {samplingMethod === "iv_vbg" && (
                  <>
                    <NumberInput label="pH" value={ph} onChange={setPh} step={0.01} />
                    <NumberInput
                      label="HCO₃⁻ / BE"
                      value={hco3}
                      onChange={setHco3}
                      unit="mmol/L"
                      step={0.1}
                    />
                    <NumberInput
                      label="pCO₂"
                      value={pco2}
                      onChange={setPco2}
                      unit="mmHg"
                    />
                    <NumberInput
                      label="pO₂"
                      value={po2}
                      onChange={setPo2}
                      unit="mmHg"
                    />
                  </>
                )}
              </div>

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
                    <AlertTriangle className="h-4 w-4" /> Terminate
                  </button>
                  <button
                    type="button"
                    onClick={addStage}
                    disabled={!hr && !lactate && !rpe}
                    className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-40"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Record Stage
                  </button>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Results — shown always; before any stage shows formulas only */}
          <SectionCard title="Results" icon={LineChart}>
            {stages.length === 0 ? (
              <>
                <p className="mb-3 text-xs text-muted-foreground">
                  Formulas and reference ranges will be applied once a stage is
                  recorded.
                </p>
                <MethodExplainer />
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-rose-500/10 p-3">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      Peak VO₂
                      <InfoPopover title="VO₂max reference ranges">
                        <span className="block space-y-1">
                          <span className="block">Men &lt;40 y: 42–55 mL/kg/min</span>
                          <span className="block">Men 40–60 y: 30–42</span>
                          <span className="block">Women &lt;40 y: 33–45</span>
                          <span className="block">Women 40–60 y: 25–35</span>
                          <span className="block text-amber-400">
                            &lt;18 mL/kg/min = severely limited
                          </span>
                        </span>
                      </InfoPopover>
                    </div>
                    <div className="mt-1 text-lg font-bold text-rose-400">
                      {peakVo2.toFixed(1)}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
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
                      {predictedVo2Max(patient.age, patient.sex).toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* How-calculated note directly under result */}
                <div className="rounded-lg border border-border bg-surface/40 p-3 text-xs leading-relaxed">
                  <div className="mb-1 font-semibold text-rose-400">
                    How this Estimated VO₂max was calculated
                  </div>
                  <div>
                    Method:{" "}
                    <strong>
                      {modality === "treadmill"
                        ? patient.sex === "M"
                          ? "Bruce men — VO₂ = 14.76 − 1.379·T + 0.451·T² − 0.012·T³"
                          : "Bruce women — VO₂ = 4.38·T − 3.9"
                        : "Bicycle — VO₂ = (10.8 × Watts / kg) + 7"}
                    </strong>
                    . METs = VO₂ / 3.5.{" "}
                    <span className="text-amber-400">
                      Estimated (not gas-exchange measured).
                    </span>
                  </div>
                  <table className="mt-2 w-full text-left">
                    <tbody>
                      <tr>
                        <td className="pr-3 text-muted-foreground">Sex</td>
                        <td>{patient.sex === "M" ? "Male" : "Female"}</td>
                        <td className="pr-3 text-muted-foreground">Age</td>
                        <td>{patient.age} y</td>
                      </tr>
                      <tr>
                        <td className="pr-3 text-muted-foreground">Body mass</td>
                        <td>{patient.weightKg} kg</td>
                        <td className="pr-3 text-muted-foreground">Modality</td>
                        <td>
                          {modality === "treadmill" ? "Bruce treadmill" : "Bike"}
                        </td>
                      </tr>
                      <tr>
                        <td className="pr-3 text-muted-foreground">
                          {modality === "treadmill" ? "T (dec. min)" : "Watts"}
                        </td>
                        <td>
                          {modality === "treadmill"
                            ? `${computedVo2?.T?.toFixed(2) ?? "—"} (e.g. 9 min 15 s = 9.25)`
                            : `${computedVo2?.watts ?? "—"} W`}
                        </td>
                        <td className="pr-3 text-muted-foreground">VO₂</td>
                        <td>{peakVo2.toFixed(1)} mL/kg/min</td>
                      </tr>
                      <tr>
                        <td className="pr-3 text-muted-foreground">METs</td>
                        <td>{peakMets.toFixed(1)}</td>
                        <td className="pr-3 text-muted-foreground">Category</td>
                        <td>{fitness}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Recorded stages */}
          {stages.length > 0 && (
            <SectionCard title="Recorded Stages" icon={LineChart}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="px-2 py-1.5">Stage</th>
                      <th className="px-2 py-1.5">HR</th>
                      <th className="px-2 py-1.5">Borg</th>
                      <th className="px-2 py-1.5">
                        <span className="inline-flex items-center gap-1">
                          Lactate
                          <InfoPopover title="Sampling method comparison">
                            <span className="block space-y-1">
                              <span className="block">
                                <strong>Capillary</strong>: fast, ~10–15% higher
                                than venous.
                              </span>
                              <span className="block">
                                <strong>IV lactate</strong>: stable, no repeated
                                punctures.
                              </span>
                              <span className="block">
                                <strong>IV VBG</strong>: lactate + full acid-base.
                              </span>
                            </span>
                          </InfoPopover>
                        </span>
                      </th>
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
                        <td className="px-2 py-1.5">{s.heartRate ?? "—"}</td>
                        <td className="px-2 py-1.5">{s.rpe ?? "—"}</td>
                        <td className="px-2 py-1.5">
                          {s.lactate != null ? s.lactate.toFixed(2) : "—"}
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

          {terminatedEarly && (
            <SectionCard title="Termination Reason" icon={AlertTriangle}>
              <SelectInput
                label="Reason for early termination"
                value={terminationReason}
                onChange={setTerminationReason}
                options={TERMINATION_REASONS.map((r) => ({ value: r, label: r }))}
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
            />
            <NumberInput
              label="Recovery Lactate"
              value={
                recoveryVitals.lactate !== null ? String(recoveryVitals.lactate) : ""
              }
              onChange={(v) =>
                setRecoveryVitals((r) => ({
                  ...r,
                  lactate: v ? parseFloat(v) : null,
                }))
              }
              unit="mmol/L"
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
                className="rounded-lg border border-border bg-surface/40 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/30"
              />
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <NumberInput
              label="Post-test CPK (24 h)"
              value={postCpk !== null ? String(postCpk) : ""}
              onChange={(v) => setPostCpk(v ? parseFloat(v) : null)}
              unit="U/L"
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
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm print:border-0 print:shadow-none">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Exercise Tolerance Test Report
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  VO₂ max / Lactate stress test
                </p>
              </div>
              <div className="flex flex-wrap gap-2 print:hidden">
                <button
                  type="button"
                  onClick={downloadProtocolTxt}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface"
                >
                  <Download className="h-4 w-4" /> Download protocol (.txt)
                </button>
                <button
                  type="button"
                  onClick={downloadProtocolPdf}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface"
                >
                  <Download className="h-4 w-4" /> Download protocol (PDF)
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface"
                >
                  <Printer className="h-4 w-4" /> Print
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface"
                >
                  <RefreshCw className="h-4 w-4" /> New Test
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="text-xs text-muted-foreground">Patient</span>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Age / Sex</span>
                <p className="font-medium">
                  {patient.age} y / {patient.sex === "M" ? "Male" : "Female"}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Weight</span>
                <p className="font-medium">{patient.weightKg} kg</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Resting HR</span>
                <p className="font-medium">{patient.restingHr} bpm</p>
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
                <span className="text-muted-foreground">Sampling method</span>
                <p className="font-medium">
                  {samplingMethod === "capillary"
                    ? "Capillary (fingertip / earlobe)"
                    : samplingMethod === "iv_lactate"
                      ? "IV line — Lactate only"
                      : "IV line — Lactate + VBG"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Stages completed</span>
                <p className="font-medium">{stages.length}</p>
              </div>
              {terminatedEarly && (
                <div className="sm:col-span-3">
                  <span className="text-muted-foreground">Early termination</span>
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
                <div className="flex items-center gap-1 text-muted-foreground">
                  Peak VO₂
                  <InfoPopover title="VO₂max reference ranges">
                    <span className="block space-y-1">
                      <span className="block">Men &lt;40 y: 42–55 mL/kg/min</span>
                      <span className="block">Men 40–60 y: 30–42</span>
                      <span className="block">Women &lt;40 y: 33–45</span>
                      <span className="block">Women 40–60 y: 25–35</span>
                      <span className="block text-amber-400">
                        &lt;18 mL/kg/min = severely limited
                      </span>
                    </span>
                  </InfoPopover>
                </div>
                <div className="mt-1 text-lg font-bold text-rose-400">
                  {peakVo2.toFixed(1)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
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
                  {predictedVo2Max(patient.age, patient.sex).toFixed(1)}
                </div>
              </div>
            </div>

            {/* Method + patient-specific inputs table */}
            <div className="mt-4 rounded-lg border border-border bg-surface/40 p-3 text-xs leading-relaxed">
              <div className="mb-1 font-semibold text-rose-400">
                How this Estimated VO₂max was calculated
              </div>
              <p>
                Method:{" "}
                <strong>
                  {modality === "treadmill"
                    ? patient.sex === "M"
                      ? "Bruce men — VO₂ = 14.76 − 1.379·T + 0.451·T² − 0.012·T³"
                      : "Bruce women — VO₂ = 4.38·T − 3.9"
                    : "Bicycle — VO₂ = (10.8 × Watts / kg) + 7"}
                </strong>
                . METs = VO₂ / 3.5. T = total treadmill time in decimal minutes
                (9 min 15 s → 9.25).{" "}
                <span className="text-amber-400">
                  Estimated only — not gas-exchange measured.
                </span>
              </p>
              <table className="mt-2 w-full text-left">
                <tbody>
                  <tr>
                    <td className="pr-3 text-muted-foreground">Sex</td>
                    <td>{patient.sex === "M" ? "Male" : "Female"}</td>
                    <td className="pr-3 text-muted-foreground">Age</td>
                    <td>{patient.age} y</td>
                  </tr>
                  <tr>
                    <td className="pr-3 text-muted-foreground">Body mass</td>
                    <td>{patient.weightKg} kg</td>
                    <td className="pr-3 text-muted-foreground">Modality</td>
                    <td>{modality === "treadmill" ? "Bruce treadmill" : "Bike"}</td>
                  </tr>
                  <tr>
                    <td className="pr-3 text-muted-foreground">
                      {modality === "treadmill" ? "T (dec. min)" : "Watts"}
                    </td>
                    <td>
                      {modality === "treadmill"
                        ? computedVo2?.T?.toFixed(2) ?? "—"
                        : `${computedVo2?.watts ?? "—"} W`}
                    </td>
                    <td className="pr-3 text-muted-foreground">VO₂</td>
                    <td>{peakVo2.toFixed(1)} mL/kg/min</td>
                  </tr>
                  <tr>
                    <td className="pr-3 text-muted-foreground">METs</td>
                    <td>{peakMets.toFixed(1)}</td>
                    <td className="pr-3 text-muted-foreground">Category</td>
                    <td>{fitness}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* HR peak / chronotropic */}
            <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-surface/40 p-3">
                <div className="text-muted-foreground">Peak HR</div>
                <div className="mt-1 text-base font-semibold">
                  {peakHR || "—"} bpm
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {pctHRmax ? `${pctHRmax.toFixed(0)}% of predicted` : ""}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface/40 p-3">
                <div className="text-muted-foreground">
                  Predicted HRmax (220 − age)
                </div>
                <div className="mt-1 text-base font-semibold">{hrMax} bpm</div>
              </div>
              <div className="rounded-lg border border-border bg-surface/40 p-3">
                <div className="text-muted-foreground">Chronotropic index</div>
                <div className="mt-1 text-base font-semibold">
                  {chronotropicIndex ? chronotropicIndex.toFixed(2) : "—"}
                </div>
                <div
                  className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    chronotropicIndex >= 0.8
                      ? "bg-emerald-500/15 text-emerald-400"
                      : chronotropicIndex >= 0.6
                        ? "bg-amber-500/15 text-amber-400"
                        : chronotropicIndex > 0
                          ? "bg-rose-500/15 text-rose-400"
                          : "bg-surface text-muted-foreground"
                  }`}
                >
                  {chronotropicInterp}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface/40 p-3">
                <div className="text-muted-foreground">Peak RPE (Borg)</div>
                <div className="mt-1 text-base font-semibold">{peakRpe || "—"}</div>
              </div>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              <strong>HRmax explanation:</strong> Predicted HRmax = 220 − age. The
              chronotropic index = (peak HR − resting HR) / (predicted HRmax −
              resting HR). CI ≥ 0.8 is normal; &lt; 0.8 suggests chronotropic
              incompetence.
            </p>

            {hrAlert && (
              <div
                className={`mt-2 rounded-lg border px-3 py-2 text-xs ${
                  hrAlert.level === "high"
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                }`}
              >
                {hrAlert.msg}
              </div>
            )}
          </div>

          {/* HR chart */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm print:border-0 print:shadow-none">
            <h3 className="mb-3 text-sm font-semibold">
              Heart Rate — with predicted HRmax overlay
            </h3>
            <HRChart stages={stages} modality={modality} age={patient.age} />
          </div>

          {/* RPE chart */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm print:border-0 print:shadow-none">
            <h3 className="mb-3 text-sm font-semibold">RPE across stages</h3>
            <RPEChart stages={stages} />
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
                    <span className="text-muted-foreground">Post-test (24 h)</span>
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
                <p className="font-medium">{recoveryVitals.hr ?? "—"} bpm</p>
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
                  {recoveryVitals.sao2 != null ? `${recoveryVitals.sao2}%` : "—"}
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

          {/* Exercise tolerance clinical meaning */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm print:border-0 print:shadow-none">
            <h3 className="mb-3 text-sm font-semibold">
              Exercise Tolerance — what this test tells us
            </h3>
            <div className="space-y-2 text-xs leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground">Yes</strong> — this test
                already measures exercise tolerance. Even though the core focus
                is the lactate pattern (mitochondrial disease vs McArdle / GSD),
                the same run yields how much work the body handled before
                stopping.
              </p>
              <p>
                Exercise tolerance is assessed here by:{" "}
                <strong className="text-foreground">
                  total exercise time
                </strong>
                , <strong className="text-foreground">estimated VO₂max / METs</strong>,{" "}
                <strong className="text-foreground">HR response</strong>,{" "}
                <strong className="text-foreground">RPE</strong>, and the{" "}
                <strong className="text-foreground">
                  symptoms that force the patient to stop
                </strong>{" "}
                (muscle pain, cramps, breathlessness, fatigue).
              </p>
              <p>
                In metabolic muscle disease, tolerance is often reduced by early
                muscle fatigue or pain rather than heart/lung limitation. The
                test therefore delivers two things at once: exercise capacity
                (VO₂, METs, time) and a lactate curve pointing toward the
                metabolic problem.
              </p>
            </div>
          </div>

          <MethodExplainer />

          <div className="rounded-xl border border-warn/25 bg-warn/5 p-3 text-xs text-warn print:border-0">
            For educational reference only. Not a substitute for clinical
            judgment, institutional protocols, or current guidelines.
          </div>
        </div>
      )}
    </div>
  );
}
