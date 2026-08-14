// Reference ECG test cases for the WOBBLER scoring engine.
// Used both by the unit tests and by the in-app "test cases" reference view.

import { getDefaultECGInput, type ECGInput } from "./ecg-rule-engine";
import type { WobblerRiskLevel } from "./wobbler-scoring";

export type ECGTestCase = {
  id: string;
  name: string;
  band: "low" | "borderline" | "intermediate" | "high";
  vignette: string;
  input: ECGInput;
  expected: {
    total: number;
    riskLevel: WobblerRiskLevel;
    triggeredKeys: string[];
    recommendationGist: string;
  };
};

function ecg(overrides: Partial<ECGInput>): ECGInput {
  return { ...getDefaultECGInput(), heart_rate: 72, qtc_ms: 420, pr_interval_ms: 160, qrs_duration_ms_v1: 90, qrs_duration_ms_global: 90, ...overrides };
}

export const ecgTestCases: ECGTestCase[] = [
  {
    id: "normal",
    name: "Normal ECG after vasovagal faint",
    band: "low",
    vignette: "22-year-old, prolonged standing, prodrome of nausea and warmth. ECG entirely normal.",
    input: ecg({}),
    expected: {
      total: 0,
      riskLevel: "low",
      triggeredKeys: [],
      recommendationGist: "Routine outpatient pathway",
    },
  },
  {
    id: "early_repol_only",
    name: "Isolated early repolarization",
    band: "borderline",
    vignette: "28-year-old athlete, inferolateral J-point elevation, otherwise normal ECG.",
    input: ecg({ early_repol_inferolateral: true, heart_rate: 54 }),
    expected: {
      total: 1,
      riskLevel: "intermediate",
      triggeredKeys: ["early_repol"],
      recommendationGist: "Expedited outpatient cardiology",
    },
  },
  {
    id: "saddleback_only",
    name: "Saddleback ST V1–V3 (Brugada type 2)",
    band: "borderline",
    vignette: "35-year-old, nocturnal syncope, saddleback ST elevation without coved morphology.",
    input: ecg({ st_pattern_v1_v3: "saddleback", qrs_duration_ms_v1: 105 }),
    expected: {
      total: 1,
      riskLevel: "intermediate",
      triggeredKeys: ["brugada_saddleback"],
      recommendationGist: "Expedited outpatient cardiology",
    },
  },
  {
    id: "borderline_qtc",
    name: "Borderline QTc 485 ms",
    band: "borderline",
    vignette: "60-year-old on citalopram and an antiemetic; QTc 485 ms, otherwise unremarkable.",
    input: ecg({ qtc_ms: 485 }),
    expected: {
      total: 2,
      riskLevel: "intermediate",
      triggeredKeys: ["repolarization_borderline"],
      recommendationGist: "Expedited outpatient cardiology",
    },
  },
  {
    id: "lvh_voltage",
    name: "LVH voltage with Q waves (possible HCM)",
    band: "intermediate",
    vignette: "19-year-old with exertional syncope; deep septal Q waves and LVH voltage criteria.",
    input: ecg({ lvh_voltage: true, q_waves_infarct_pattern: true }),
    expected: {
      total: 2,
      riskLevel: "intermediate",
      triggeredKeys: ["lvh"],
      recommendationGist: "Expedited outpatient cardiology",
    },
  },
  {
    id: "wpw",
    name: "Pre-excitation (WPW)",
    band: "intermediate",
    vignette: "24-year-old with palpitations preceding syncope; PR 100 ms with a delta wave.",
    input: ecg({ pr_interval_ms: 100, delta_wave: true }),
    expected: {
      total: 2,
      riskLevel: "intermediate",
      triggeredKeys: ["preexcitation"],
      recommendationGist: "Expedited outpatient cardiology",
    },
  },
  {
    id: "borderline_qtc_plus_early_repol",
    name: "Borderline QTc plus early repolarization",
    band: "intermediate",
    vignette: "45-year-old, QTc 490 ms and inferolateral J waves; two minor/moderate flags stack.",
    input: ecg({ qtc_ms: 490, early_repol_inferolateral: true }),
    expected: {
      total: 3,
      riskLevel: "intermediate",
      triggeredKeys: ["repolarization_borderline", "early_repol"],
      recommendationGist: "Expedited outpatient cardiology",
    },
  },
  {
    id: "rbbb_wide",
    name: "RBBB with wide QRS",
    band: "high",
    vignette: "72-year-old, unheralded syncope, RBBB with QRS 140 ms — conduction disease stacks to high risk.",
    input: ecg({ rbbb: true, qrs_duration_ms_global: 140, qrs_duration_ms_v1: 140 }),
    expected: {
      total: 4,
      riskLevel: "high",
      triggeredKeys: ["wide_qrs", "bifascicular"],
      recommendationGist: "Admit / urgent cardiology",
    },
  },
  {
    id: "brugada_type1",
    name: "Brugada type 1 (coved)",
    band: "high",
    vignette: "38-year-old, family history of sudden death; coved ST elevation V1–V3 with QRS V1 125 ms.",
    input: ecg({ st_pattern_v1_v3: "coved", qrs_duration_ms_v1: 125 }),
    expected: {
      total: 3,
      riskLevel: "high",
      triggeredKeys: ["brugada"],
      recommendationGist: "Admit / urgent cardiology",
    },
  },
  {
    id: "arvc",
    name: "ARVC pattern",
    band: "high",
    vignette: "30-year-old with exertional syncope; epsilon waves and T-wave inversion V1–V3.",
    input: ecg({ epsilon_wave_v1_v3: true, t_wave_v1_v3: "inverted" }),
    expected: {
      total: 3,
      riskLevel: "high",
      triggeredKeys: ["epsilon"],
      recommendationGist: "Admit / urgent cardiology",
    },
  },
  {
    id: "lqts_severe",
    name: "QTc 520 ms",
    band: "high",
    vignette: "55-year-old with recurrent syncope on sotalol; QTc 520 ms.",
    input: ecg({ qtc_ms: 520 }),
    expected: {
      total: 3,
      riskLevel: "high",
      triggeredKeys: ["repolarization"],
      recommendationGist: "Admit / urgent cardiology",
    },
  },
  {
    id: "chb",
    name: "Complete heart block with bradycardia",
    band: "high",
    vignette: "80-year-old, Stokes-Adams attacks; complete AV block at 34 bpm with a wide escape.",
    input: ecg({
      high_grade_av_block: true,
      heart_rate: 34,
      qrs_duration_ms_global: 130,
      qrs_duration_ms_v1: 130,
    }),
    expected: {
      total: 8,
      riskLevel: "high",
      triggeredKeys: ["wide_qrs", "obstructed_av", "bradycardia"],
      recommendationGist: "Admit / urgent cardiology",
    },
  },
  {
    id: "wellens",
    name: "Wellens' pattern",
    band: "high",
    vignette: "63-year-old, pain-free after a syncopal episode; biphasic T waves V2–V3.",
    input: ecg({ wellens_pattern: true, t_wave_v1_v3: "biphasic" }),
    expected: {
      total: 3,
      riskLevel: "high",
      triggeredKeys: ["wellens"],
      recommendationGist: "Admit / urgent cardiology",
    },
  },
];
