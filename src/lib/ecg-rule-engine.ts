// ECG Rule Engine for Syncope Risk Stratification
// Based on clinical guidelines for high-risk ECG findings

export type ECGInput = {
  heart_rate: number;
  rhythm: "sinus" | "afib" | "flutter" | "junctional" | "paced" | "other";
  qtc_ms: number;
  qrs_duration_ms_v1: number;
  qrs_duration_ms_global: number;
  st_pattern_v1_v3: "normal" | "coved" | "saddleback";
  t_wave_v1_v3: "upright" | "inverted" | "biphasic";
  epsilon_wave_v1_v3: boolean;
  pr_interval_ms: number;
  delta_wave: boolean;
  lvh_voltage: boolean;
  lbbb: boolean;
  rbbb: boolean;
  q_waves_infarct_pattern: boolean;
  early_repol_inferolateral: boolean;
  svt_or_vt_present: boolean;
  high_grade_av_block: boolean;
  bradycardia_pauses: boolean;
  wellens_pattern: boolean;
};


export type ECGOutputTag =
  | "life_threatening_arrhythmia"
  | "ecg_high_risk_syncope"
  | "high_grade_av_block"
  | "severe_bradycardia"
  | "hcm_pattern"
  | "structural_heart_disease"
  | "suspected_lqts"
  | "brugada_type1"
  | "suspected_brugada"
  | "brugada_saddleback"
  | "suspected_arvc_high"
  | "wpw_pattern"
  | "pre_excitation"
  | "early_repolarization_pattern";

export type ECGResult = {
  output_tags: ECGOutputTag[];
  is_high_risk: boolean;
  triggered_rules: string[];
  interpretation: string[];
};

export type ECGRule = {
  id: string;
  condition: string;
  output_tags: ECGOutputTag[];
};

export const ecgRules: ECGRule[] = [
  {
    id: "life_threatening_arrhythmia",
    condition: "svt_or_vt_present == true",
    output_tags: ["life_threatening_arrhythmia", "ecg_high_risk_syncope"],
  },
  {
    id: "high_grade_av_block",
    condition: "high_grade_av_block == true",
    output_tags: ["high_grade_av_block", "ecg_high_risk_syncope"],
  },
  {
    id: "severe_bradycardia",
    condition: "heart_rate < 40 || bradycardia_pauses == true",
    output_tags: ["severe_bradycardia", "ecg_high_risk_syncope"],
  },
  {
    id: "structural_hcm",
    condition: "lvh_voltage == true && q_waves_infarct_pattern == true",
    output_tags: ["hcm_pattern", "structural_heart_disease"],
  },
  {
    id: "lqts_severe",
    condition: "qtc_ms >= 500",
    output_tags: ["suspected_lqts", "ecg_high_risk_syncope"],
  },
  {
    id: "lqts_prolonged",
    condition: "qtc_ms >= 480 && qtc_ms < 500",
    output_tags: ["suspected_lqts"],
  },
  {
    id: "brugada_type1",
    condition: "st_pattern_v1_v3 == 'coved' && qrs_duration_ms_v1 >= 120",
    output_tags: ["brugada_type1", "suspected_brugada", "ecg_high_risk_syncope"],
  },
  {
    id: "brugada_saddleback",
    condition: "st_pattern_v1_v3 == 'saddleback'",
    output_tags: ["brugada_saddleback", "suspected_brugada"],
  },
  {
    id: "arvc_high",
    condition: "t_wave_v1_v3 == 'inverted' && epsilon_wave_v1_v3 == true",
    output_tags: ["suspected_arvc_high", "ecg_high_risk_syncope"],
  },
  {
    id: "wpw",
    condition: "pr_interval_ms < 120 && delta_wave == true",
    output_tags: ["wpw_pattern", "pre_excitation"],
  },
  {
    id: "early_repolarization",
    condition: "early_repol_inferolateral == true",
    output_tags: ["early_repolarization_pattern"],
  },
];

// Condition evaluator
function evaluateCondition(condition: string, input: ECGInput): boolean {
  // Replace variable names with values
  let evaluable = condition
    .replace(/heart_rate/g, String(input.heart_rate))
    .replace(/qtc_ms/g, String(input.qtc_ms))
    .replace(/qrs_duration_ms_v1/g, String(input.qrs_duration_ms_v1))
    .replace(/pr_interval_ms/g, String(input.pr_interval_ms))
    .replace(/svt_or_vt_present/g, String(input.svt_or_vt_present))
    .replace(/high_grade_av_block/g, String(input.high_grade_av_block))
    .replace(/bradycardia_pauses/g, String(input.bradycardia_pauses))
    .replace(/lvh_voltage/g, String(input.lvh_voltage))
    .replace(/q_waves_infarct_pattern/g, String(input.q_waves_infarct_pattern))
    .replace(/epsilon_wave_v1_v3/g, String(input.epsilon_wave_v1_v3))
    .replace(/delta_wave/g, String(input.delta_wave))
    .replace(/early_repol_inferolateral/g, String(input.early_repol_inferolateral))
    .replace(/st_pattern_v1_v3 == 'coved'/g, String(input.st_pattern_v1_v3 === "coved"))
    .replace(/st_pattern_v1_v3 == 'saddleback'/g, String(input.st_pattern_v1_v3 === "saddleback"))
    .replace(/t_wave_v1_v3 == 'inverted'/g, String(input.t_wave_v1_v3 === "inverted"));

  // Safely evaluate the condition
  try {
    // Handle comparisons
    if (evaluable.includes("&&")) {
      const parts = evaluable.split("&&").map((p) => p.trim());
      return parts.every((part) => evaluateSingleCondition(part));
    }
    if (evaluable.includes("||")) {
      const parts = evaluable.split("||").map((p) => p.trim());
      return parts.some((part) => evaluateSingleCondition(part));
    }
    return evaluateSingleCondition(evaluable);
  } catch {
    return false;
  }
}

function evaluateSingleCondition(condition: string): boolean {
  // Handle boolean values
  if (condition === "true") return true;
  if (condition === "false") return false;

  // Handle comparisons
  if (condition.includes(">=")) {
    const [left, right] = condition.split(">=").map((s) => s.trim());
    return parseFloat(left) >= parseFloat(right);
  }
  if (condition.includes("<=")) {
    const [left, right] = condition.split("<=").map((s) => s.trim());
    return parseFloat(left) <= parseFloat(right);
  }
  if (condition.includes(">")) {
    const [left, right] = condition.split(">").map((s) => s.trim());
    return parseFloat(left) > parseFloat(right);
  }
  if (condition.includes("<")) {
    const [left, right] = condition.split("<").map((s) => s.trim());
    return parseFloat(left) < parseFloat(right);
  }
  if (condition.includes("==")) {
    const [left, right] = condition.split("==").map((s) => s.trim());
    return left === right;
  }

  return false;
}

// Main evaluation function
export function evaluateECG(input: ECGInput): ECGResult {
  const output_tags: ECGOutputTag[] = [];
  const triggered_rules: string[] = [];
  const interpretation: string[] = [];

  // Evaluate each rule
  for (const rule of ecgRules) {
    if (evaluateCondition(rule.condition, input)) {
      triggered_rules.push(rule.id);
      for (const tag of rule.output_tags) {
        if (!output_tags.includes(tag)) {
          output_tags.push(tag);
        }
      }
    }
  }

  // Determine high risk
  const is_high_risk = output_tags.includes("ecg_high_risk_syncope");

  // Generate interpretation
  if (triggered_rules.includes("life_threatening_arrhythmia")) {
    interpretation.push(
      "⚠️ Life-threatening arrhythmia detected - immediate cardiac evaluation required",
    );
  }
  if (triggered_rules.includes("high_grade_av_block")) {
    interpretation.push("⚠️ High-grade AV block - pacing may be required");
  }
  if (triggered_rules.includes("severe_bradycardia")) {
    interpretation.push("⚠️ Severe bradycardia or pauses - evaluate for pacing indication");
  }
  if (triggered_rules.includes("lqts_severe")) {
    interpretation.push(
      "⚠️ Severely prolonged QTc (≥500ms) - high risk for torsades, consider LQTS",
    );
  }
  if (triggered_rules.includes("lqts_prolonged")) {
    interpretation.push("QTc prolonged (480-499ms) - evaluate for LQTS, review medications");
  }
  if (triggered_rules.includes("brugada_type1")) {
    interpretation.push("⚠️ Brugada Type 1 pattern - high risk for SCD, refer for EP evaluation");
  }
  if (triggered_rules.includes("brugada_saddleback")) {
    interpretation.push("Brugada saddleback pattern - consider drug provocation test");
  }
  if (triggered_rules.includes("arvc_high")) {
    interpretation.push(
      "⚠️ ARVC suspected (T-wave inversions + epsilon waves) - cardiac MRI recommended",
    );
  }
  if (triggered_rules.includes("wpw")) {
    interpretation.push("WPW pattern detected - risk of rapid conduction if AF develops");
  }
  if (triggered_rules.includes("structural_hcm")) {
    interpretation.push("LVH with Q waves - consider HCM, cardiac MRI recommended");
  }
  if (triggered_rules.includes("early_repolarization")) {
    interpretation.push(
      "Early repolarization pattern - benign in most cases, but associated with VF risk in some studies",
    );
  }

  // Add general interpretation if high risk
  if (is_high_risk && interpretation.length === 0) {
    interpretation.push(
      "⚠️ High-risk ECG findings present - urgent cardiac evaluation recommended",
    );
  }

  // Add normal interpretation if no findings
  if (output_tags.length === 0) {
    interpretation.push("No concerning ECG features identified");
    interpretation.push("Continue with clinical evaluation and orthostatic assessment");
  }

  return {
    output_tags,
    is_high_risk,
    triggered_rules,
    interpretation,
  };
}

// Helper function to get default/empty ECG input
export function getDefaultECGInput(): ECGInput {
  return {
    heart_rate: 0,
    rhythm: "sinus",
    qtc_ms: 0,
    qrs_duration_ms_v1: 0,
    qrs_duration_ms_global: 0,
    st_pattern_v1_v3: "normal",
    t_wave_v1_v3: "upright",
    epsilon_wave_v1_v3: false,
    pr_interval_ms: 0,
    delta_wave: false,
    lvh_voltage: false,
    lbbb: false,
    rbbb: false,
    q_waves_infarct_pattern: false,
    early_repol_inferolateral: false,
    svt_or_vt_present: false,
    high_grade_av_block: false,
    bradycardia_pauses: false,
  };
}
