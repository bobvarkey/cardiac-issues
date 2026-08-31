export type McassSex = "male" | "female";
export type McassSeverity = "normal" | "mild" | "moderate" | "severe";
export type McassStage = "none" | "possible" | "definite" | "severe";
export type McassPotsScreen = "not-screened" | "negative" | "positive" | "borderline";
export type McassQualityFlag =
  | "non-sinus-rhythm"
  | "artifact"
  | "medication-confounder"
  | "low-bp-signal-quality"
  | "sudoscan-limited"
  | "manual-approval-required";

export type McassInputs = {
  age: number;
  sex: McassSex;
  hrvSdnn?: number;
  hrvSdsd?: number;
  hrvRmssd?: number;
  hrvNn50?: number;
  hrvPnn50?: number;
  deepBreathingDeltaHr?: number;
  deepBreathingEiRatio?: number;
  valsalvaRatio?: number;
  thirtyFifteenRatio?: number;
  supineSbp?: number;
  standingSbp?: number;
  supineDbp?: number;
  standingDbp?: number;
  maxSbpFall?: number;
  maxDbpFall?: number;
  hrRiseStanding?: number;
  deltaHrDeltaSbp?: number;
  sixMinuteStandingHr?: number;
  potsScreen?: McassPotsScreen;
  handgripDbpDelta?: number;
  sudoscanComposite?: number;
  clinicianApproved?: boolean;
  qualityFlags?: McassQualityFlag[];
  manualOverride?: boolean;
};

export type McassResult = {
  cardiovagal: number;
  adrenergic: number;
  sudomotor: number;
  total: number;
  severity: McassSeverity;
  canStage: McassStage;
  pattern: string;
  qualityWarnings: string[];
  isValid: boolean;
  requiresManualApproval: boolean;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export function getMcassSeverity(total: number): McassSeverity {
  if (total <= 0) return "normal";
  if (total <= 3) return "mild";
  if (total <= 6) return "moderate";
  return "severe";
}

export function calculateMcass(inputs: McassInputs): McassResult {
  const qualityFlags = [...(inputs.qualityFlags ?? [])];
  const requiresManualApproval = !inputs.clinicianApproved && !inputs.manualOverride;
  const isValid = !requiresManualApproval && qualityFlags.length === 0;

  let cardiovagal = 0;
  let adrenergic = 0;
  let sudomotor = 0;

  const deepBreathingDeltaHr = inputs.deepBreathingDeltaHr ?? 0;
  const deepBreathingEiRatio = inputs.deepBreathingEiRatio ?? 0;
  const valsalvaRatio = inputs.valsalvaRatio ?? 0;
  const thirtyFifteenRatio = inputs.thirtyFifteenRatio ?? 0;
  const maxSbpFall = inputs.maxSbpFall ?? 0;
  const maxDbpFall = inputs.maxDbpFall ?? 0;
  const hrRiseStanding = inputs.hrRiseStanding ?? 0;
  const deltaHrDeltaSbp = inputs.deltaHrDeltaSbp ?? 0;
  const handgripDbpDelta = inputs.handgripDbpDelta ?? 0;

  if (deepBreathingDeltaHr < 10 || deepBreathingEiRatio < 1.1) cardiovagal += 1;
  if (deepBreathingDeltaHr < 7 || deepBreathingEiRatio < 1.05) cardiovagal += 1;
  if (valsalvaRatio < 1.5 || thirtyFifteenRatio < 1.2) cardiovagal += 1;
  if (deepBreathingDeltaHr < 5 || deepBreathingEiRatio < 1.0 || valsalvaRatio < 1.2) cardiovagal += 1;

  cardiovagal = clamp(cardiovagal, 0, 3);

  if (maxSbpFall >= 20 || maxDbpFall >= 10) adrenergic += 1;
  if (maxSbpFall >= 30 || maxDbpFall >= 15 || hrRiseStanding >= 30) adrenergic += 1;
  if (hrRiseStanding >= 40 || deltaHrDeltaSbp >= 0.8) adrenergic += 1;
  if (inputs.potsScreen === "positive" || inputs.sixMinuteStandingHr >= 30) adrenergic += 1;

  adrenergic = clamp(adrenergic, 0, 4);

  const sudoscanPoints = clamp(inputs.sudoscanComposite ?? 0, 0, 3);
  sudomotor = sudoscanPoints;

  const total = cardiovagal + adrenergic + sudomotor;
  const severity = getMcassSeverity(total);

  let canStage: McassStage = "none";
  if (total >= 1) {
    if (severity === "mild") canStage = "possible";
    if (severity === "moderate") canStage = "definite";
    if (severity === "severe") canStage = "severe";
  }

  let pattern = "No dominant autonomic pattern detected";
  if (cardiovagal >= 2 && adrenergic === 0 && sudomotor === 0) pattern = "Cardiovagal-predominant pattern";
  if (adrenergic >= 2 && cardiovagal === 0 && sudomotor === 0) pattern = "Adrenergic-predominant pattern";
  if (sudomotor >= 2 && cardiovagal === 0 && adrenergic === 0) pattern = "Sudomotor-predominant pattern";
  if (cardiovagal >= 2 && adrenergic >= 2) pattern = "Generalized autonomic dysfunction";
  if (cardiovagal === 0 && adrenergic >= 2 && handgripDbpDelta < 10) pattern = "Peripheral sympathetic support pattern";
  if (cardiovagal >= 2 && adrenergic === 0 && handgripDbpDelta < 10) pattern = "Central autonomic support pattern";

  const warnings = [] as string[];
  if (qualityFlags.includes("non-sinus-rhythm")) warnings.push("Non-sinus rhythm may confound HRV and HR-based autonomic indices.");
  if (qualityFlags.includes("artifact")) warnings.push("Artifact or poor signal quality may distort autonomic metrics.");
  if (qualityFlags.includes("medication-confounder")) warnings.push("Medication confounders may alter HRV, BP, and orthostatic responses.");
  if (qualityFlags.includes("low-bp-signal-quality")) warnings.push("Orthostatic BP signal quality is low; interpret OH criteria cautiously.");
  if (qualityFlags.includes("sudoscan-limited")) warnings.push("Sudoscan is limited by skin conditions, medications, or device constraints.");
  if (requiresManualApproval) warnings.push("Manual clinician approval required before finalizing the mCASS score.");

  return {
    cardiovagal,
    adrenergic,
    sudomotor,
    total,
    severity,
    canStage,
    pattern,
    qualityWarnings: warnings,
    isValid,
    requiresManualApproval,
  };
}
