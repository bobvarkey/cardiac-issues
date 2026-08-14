// WOBBLER red-flag scoring for ECG in syncope.
// W - Wide QRS, O - Obstructed AV, B - Bifascicular block, B - Brugada,
// L - Left ventricular hypertrophy, E - Epsilon waves, R - Repolarization abnormality.
// Plus non-mnemonic high-risk findings (VT/SVT, bradycardia/pauses, Wellens, WPW).

import type { ECGInput } from "./ecg-rule-engine";

export type WobblerSeverity = "major" | "moderate" | "minor";

export type WobblerCheck = {
  key: string;
  letter: string; // W, O, B1, B2, L, E, R or "+" for adjuncts
  label: string;
  severity: WobblerSeverity;
  points: number;
  triggered: boolean;
  detail: string;
  rationale: string;
};

export type WobblerRiskLevel = "high" | "intermediate" | "low";

export type WobblerScore = {
  checks: WobblerCheck[];
  triggered: WobblerCheck[];
  total: number;
  maxPossible: number;
  hasMajor: boolean;
  riskLevel: WobblerRiskLevel;
  recommendation: string;
  disposition: string;
};

const POINTS: Record<WobblerSeverity, number> = { major: 3, moderate: 2, minor: 1 };

type CheckDef = {
  key: string;
  letter: string;
  label: string;
  severity: WobblerSeverity;
  rationale: string;
  test: (i: ECGInput) => { hit: boolean; detail: string };
};

const CHECK_DEFS: CheckDef[] = [
  {
    key: "wide_qrs",
    letter: "W",
    label: "Wide QRS (≥120 ms)",
    severity: "moderate",
    rationale: "Conduction disease predicts progression to complete heart block and arrhythmic syncope.",
    test: (i) => ({
      hit: i.qrs_duration_ms_global >= 120,
      detail: i.qrs_duration_ms_global ? `QRS ${i.qrs_duration_ms_global} ms` : "QRS not entered",
    }),
  },
  {
    key: "obstructed_av",
    letter: "O",
    label: "Obstructed AV conduction (high-grade block)",
    severity: "major",
    rationale: "Mobitz II / complete block causes Stokes-Adams syncope; pacing indication.",
    test: (i) => ({
      hit: i.high_grade_av_block,
      detail: i.high_grade_av_block ? "High-grade AV block present" : "No high-grade block",
    }),
  },
  {
    key: "bifascicular",
    letter: "B",
    label: "Bundle branch / bifascicular block",
    severity: "moderate",
    rationale: "Bifascicular block plus syncope implies intermittent complete heart block until proven otherwise.",
    test: (i) => ({
      hit: i.lbbb || i.rbbb,
      detail: i.lbbb ? "LBBB present" : i.rbbb ? "RBBB present" : "No bundle branch block",
    }),
  },
  {
    key: "brugada",
    letter: "B",
    label: "Brugada pattern",
    severity: "major",
    rationale: "Type 1 coved ST elevation with syncope carries high risk of ventricular fibrillation.",
    test: (i) => {
      const type1 = i.st_pattern_v1_v3 === "coved";
      const type2 = i.st_pattern_v1_v3 === "saddleback";
      return {
        hit: type1,
        detail: type1
          ? `Coved ST V1–V3 (QRS V1 ${i.qrs_duration_ms_v1} ms)`
          : type2
            ? "Saddleback only — see borderline pattern below"
            : "Normal ST V1–V3",
      };
    },
  },
  {
    key: "brugada_saddleback",
    letter: "B",
    label: "Saddleback ST V1–V3 (possible Brugada type 2)",
    severity: "minor",
    rationale: "Non-diagnostic pattern; consider high lead placement or drug provocation testing.",
    test: (i) => ({
      hit: i.st_pattern_v1_v3 === "saddleback",
      detail: i.st_pattern_v1_v3 === "saddleback" ? "Saddleback ST elevation" : "Absent",
    }),
  },
  {
    key: "lvh",
    letter: "L",
    label: "Left ventricular hypertrophy voltage",
    severity: "moderate",
    rationale: "Suggests HCM or severe AS as a cause of exertional syncope.",
    test: (i) => ({
      hit: i.lvh_voltage,
      detail: i.lvh_voltage
        ? i.q_waves_infarct_pattern
          ? "LVH voltage with pathological Q waves (HCM pattern)"
          : "LVH voltage criteria met"
        : "No LVH voltage",
    }),
  },
  {
    key: "epsilon",
    letter: "E",
    label: "Epsilon waves / ARVC features",
    severity: "major",
    rationale: "Epsilon waves with anterior T-wave inversion indicate ARVC and ventricular arrhythmia risk.",
    test: (i) => ({
      hit: i.epsilon_wave_v1_v3,
      detail: i.epsilon_wave_v1_v3
        ? i.t_wave_v1_v3 === "inverted"
          ? "Epsilon waves with T-wave inversion V1–V3"
          : "Epsilon waves V1–V3"
        : "No epsilon waves",
    }),
  },
  {
    key: "repolarization",
    letter: "R",
    label: "Repolarization abnormality (QTc)",
    severity: "major",
    rationale: "QTc ≥500 ms is strongly associated with torsades de pointes.",
    test: (i) => ({
      hit: i.qtc_ms >= 500,
      detail: i.qtc_ms ? `QTc ${i.qtc_ms} ms` : "QTc not entered",
    }),
  },
  {
    key: "repolarization_borderline",
    letter: "R",
    label: "Borderline QTc (480–499 ms)",
    severity: "moderate",
    rationale: "Prolonged but sub-threshold QTc; review drugs and electrolytes, consider LQTS.",
    test: (i) => ({
      hit: i.qtc_ms >= 480 && i.qtc_ms < 500,
      detail: i.qtc_ms >= 480 && i.qtc_ms < 500 ? `QTc ${i.qtc_ms} ms` : "Absent",
    }),
  },
  {
    key: "vt_svt",
    letter: "+",
    label: "Documented VT or SVT",
    severity: "major",
    rationale: "Arrhythmic syncope confirmed on the tracing — immediate management.",
    test: (i) => ({
      hit: i.svt_or_vt_present,
      detail: i.svt_or_vt_present ? "Tachyarrhythmia captured" : "Absent",
    }),
  },
  {
    key: "bradycardia",
    letter: "+",
    label: "Severe bradycardia / pauses",
    severity: "major",
    rationale: "HR <40 or sinus pauses point to sick sinus syndrome requiring pacing assessment.",
    test: (i) => ({
      hit: (i.heart_rate > 0 && i.heart_rate < 40) || i.bradycardia_pauses,
      detail: i.bradycardia_pauses
        ? "Pauses documented"
        : i.heart_rate > 0 && i.heart_rate < 40
          ? `HR ${i.heart_rate} bpm`
          : "Absent",
    }),
  },
  {
    key: "wellens",
    letter: "+",
    label: "Wellens' pattern",
    severity: "major",
    rationale: "Critical proximal LAD stenosis — do not stress test; urgent angiography.",
    test: (i) => ({
      hit: i.wellens_pattern,
      detail: i.wellens_pattern ? "Biphasic/deep inverted T in V2–V3" : "Absent",
    }),
  },
  {
    key: "preexcitation",
    letter: "+",
    label: "Pre-excitation (WPW)",
    severity: "moderate",
    rationale: "Short PR with delta wave risks rapid conduction if AF develops.",
    test: (i) => ({
      hit: i.pr_interval_ms > 0 && i.pr_interval_ms < 120 && i.delta_wave,
      detail:
        i.delta_wave && i.pr_interval_ms > 0 && i.pr_interval_ms < 120
          ? `PR ${i.pr_interval_ms} ms with delta wave`
          : "Absent",
    }),
  },
  {
    key: "early_repol",
    letter: "+",
    label: "Early repolarization (inferolateral)",
    severity: "minor",
    rationale: "Usually benign, but inferolateral J waves are over-represented in idiopathic VF.",
    test: (i) => ({
      hit: i.early_repol_inferolateral,
      detail: i.early_repol_inferolateral ? "Inferolateral J-point elevation" : "Absent",
    }),
  },
];

export function scoreWobbler(input: ECGInput): WobblerScore {
  const checks: WobblerCheck[] = CHECK_DEFS.map((def) => {
    const { hit, detail } = def.test(input);
    return {
      key: def.key,
      letter: def.letter,
      label: def.label,
      severity: def.severity,
      points: hit ? POINTS[def.severity] : 0,
      triggered: hit,
      detail,
      rationale: def.rationale,
    };
  });

  const triggered = checks.filter((c) => c.triggered);
  const total = triggered.reduce((sum, c) => sum + c.points, 0);
  const maxPossible = CHECK_DEFS.reduce((sum, d) => sum + POINTS[d.severity], 0);
  const hasMajor = triggered.some((c) => c.severity === "major");

  let riskLevel: WobblerRiskLevel;
  if (hasMajor || total >= 4) riskLevel = "high";
  else if (total >= 1) riskLevel = "intermediate";
  else riskLevel = "low";

  const recommendation =
    riskLevel === "high"
      ? "High risk: admit or observe with continuous telemetry, urgent cardiology/EP review, echocardiography and targeted work-up before discharge."
      : riskLevel === "intermediate"
        ? "Intermediate risk: no immediately life-threatening pattern, but arrange expedited (≤2 weeks) cardiology review with ambulatory monitoring and echocardiography; safety-net advice on driving and unsupervised activity."
        : "Low risk: no ECG red flags. Manage along the reflex/orthostatic pathway with routine follow-up and repeat ECG if symptoms recur.";

  const disposition =
    riskLevel === "high"
      ? "Admit / urgent cardiology"
      : riskLevel === "intermediate"
        ? "Expedited outpatient cardiology"
        : "Routine outpatient pathway";

  return { checks, triggered, total, maxPossible, hasMajor, riskLevel, recommendation, disposition };
}
