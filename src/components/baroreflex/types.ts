export type YesNoUnknown = "yes" | "no" | "unknown";
export type Onset = "acute" | "chronic" | "uncertain";
export type Position = "supine" | "seated" | "standing" | "unknown";
export type Quality = "accepted" | "questionable" | "excluded";
export type ResponseOption = "appropriate_bradycardia" | "absent_or_blunted" | "uninterpretable" | "not_done";
export type DifferentialStatus = "not_assessed" | "under_evaluation" | "supported" | "less_likely";

export interface Assessment {
  caseId: string;
  assessmentDate: string;
  onset: Onset;
  history: string;
  medications: string;
  // phenotype features
  hypertensiveCrisisDocumented: YesNoUnknown;
  alternatingHighLowBp: YesNoUnknown;
  orthostaticTachycardia: YesNoUnknown;
  orthostaticIntolerance: YesNoUnknown;
  restingBradyHypotension: YesNoUnknown;
  sinusArrest: YesNoUnknown;
  stressAssociation: YesNoUnknown;
  drowsinessAssociation: YesNoUnknown;
  // v0.2.0 additions
  stressBpHrSurges: YesNoUnknown;
  supineHypertension: YesNoUnknown;
  orthostaticHypotension: YesNoUnknown;
  postprandialHypotension: YesNoUnknown;
  episodicTachycardia: YesNoUnknown;
  postoperativeApnoea: YesNoUnknown;
  syncope: YesNoUnknown;
  currentUnstableBradycardia: YesNoUnknown;
  currentAsystole: YesNoUnknown;
  newNeurologicDeficit: YesNoUnknown;
  currentChestPain: YesNoUnknown;
  currentSevereDyspnoea: YesNoUnknown;
  clonidineInterruption: YesNoUnknown;
  // urgent / assessment
  urgentConcern: YesNoUnknown;
  testFindings: string;
  differentials: string;
  plan: string;
}

export interface Causes {
  neckTrauma: YesNoUnknown;
  carotidEndarterectomy: YesNoUnknown;
  carotidBodySurgery: YesNoUnknown;
  otherNeckSurgery: YesNoUnknown;
  headNeckRadiation: YesNoUnknown;
  localTumour: YesNoUnknown;
  brainstemStroke: YesNoUnknown;
  afferentNeuropathy: YesNoUnknown;
  leighSyndrome: YesNoUnknown;
  grollHirschowitz: YesNoUnknown;
  hypertensionBrachydactyly: YesNoUnknown;
  familyParaganglioma: YesNoUnknown;
  events: CauseEvent[];
}

export interface CauseEvent {
  id: string;
  causeId: string;
  eventDate: string;
  side: "right" | "left" | "bilateral" | "unknown";
  symptomOnsetDate: string;
  anatomicalDetails: string;
  supportingRecord: string;
}

export interface DiaryEntry {
  id: string;
  timestamp: string;
  sbp: string;
  dbp: string;
  hr: string;
  position: Position;
  minutesAfterStanding: string;
  episodeId: string;
  symptoms: string;
  context: string;
  medicationTiming: string;
  quality: Quality;
}

export interface Investigations {
  pressorHrResponse: ResponseOption;
  depressorHrResponse: ResponseOption;
  dailyHrVariation: YesNoUnknown;
  specialistEfferentPreserved: YesNoUnknown;
  confounders: string[];
  testReport: string;
  rhythmReport: string;
  specialistConclusion: string;
}

export type DifferentialReview = Record<string, DifferentialStatus>;

export interface MatchedPattern {
  id: string;
  label: string;
  output: string;
  supporting: { field: string; value: string }[];
}

export interface DiaryCalculations {
  bpRange: number | null;
  hrRange: number | null;
  acceptedCount: number;
  totalCount: number;
  invalidCount: number;
}

export interface PosturalPair {
  episodeId: string;
  supineSbp: number;
  supineDbp: number;
  supineHr: number;
  standingSbp: number;
  standingDbp: number;
  standingHr: number;
  sbpChange: number;
  dbpChange: number;
  hrChange: number;
  elapsedMin: number | null;
  hrRiseDescriptor: boolean;
}

export const EMPTY_ASSESSMENT: Assessment = {
  caseId: "",
  assessmentDate: new Date().toISOString().split("T")[0],
  onset: "uncertain",
  history: "",
  medications: "",
  hypertensiveCrisisDocumented: "unknown",
  alternatingHighLowBp: "unknown",
  orthostaticTachycardia: "unknown",
  orthostaticIntolerance: "unknown",
  restingBradyHypotension: "unknown",
  sinusArrest: "unknown",
  stressAssociation: "unknown",
  drowsinessAssociation: "unknown",
  stressBpHrSurges: "unknown",
  supineHypertension: "unknown",
  orthostaticHypotension: "unknown",
  postprandialHypotension: "unknown",
  episodicTachycardia: "unknown",
  postoperativeApnoea: "unknown",
  syncope: "unknown",
  currentUnstableBradycardia: "unknown",
  currentAsystole: "unknown",
  newNeurologicDeficit: "unknown",
  currentChestPain: "unknown",
  currentSevereDyspnoea: "unknown",
  clonidineInterruption: "unknown",
  urgentConcern: "unknown",
  testFindings: "",
  differentials: "",
  plan: "",
};

export const EMPTY_CAUSES: Causes = {
  neckTrauma: "unknown",
  carotidEndarterectomy: "unknown",
  carotidBodySurgery: "unknown",
  otherNeckSurgery: "unknown",
  headNeckRadiation: "unknown",
  localTumour: "unknown",
  brainstemStroke: "unknown",
  afferentNeuropathy: "unknown",
  leighSyndrome: "unknown",
  grollHirschowitz: "unknown",
  hypertensionBrachydactyly: "unknown",
  familyParaganglioma: "unknown",
  events: [],
};

export const EMPTY_READING: Omit<DiaryEntry, "id"> = {
  timestamp: "",
  sbp: "",
  dbp: "",
  hr: "",
  position: "seated",
  minutesAfterStanding: "",
  episodeId: "",
  symptoms: "",
  context: "",
  medicationTiming: "",
  quality: "accepted",
};

export const EMPTY_INVESTIGATIONS: Investigations = {
  pressorHrResponse: "not_done",
  depressorHrResponse: "not_done",
  dailyHrVariation: "unknown",
  specialistEfferentPreserved: "unknown",
  confounders: [],
  testReport: "",
  rhythmReport: "",
  specialistConclusion: "",
};

export const DIFFERENTIAL_ITEMS = [
  "Pheochromocytoma or secretory paraganglioma",
  "Generalized or pure autonomic failure",
  "Other causes of orthostatic intolerance / POTS",
  "Arrhythmia or conduction disease",
  "Other causes of syncope",
  "Hyperthyroidism",
  "Renovascular hypertension",
  "Panic attacks / anxiety",
  "Migraine",
  "Alcohol withdrawal",
  "Stimulant or cocaine exposure",
  "Medication effects or clonidine withdrawal",
];

export const CONFOUNDER_OPTIONS = [
  "HR-limiting medication",
  "Pacemaker",
  "Arrhythmia",
  "Sedation",
  "Inadequate stimulus",
  "Measurement artefact",
  "Other",
  "None identified",
];

export const CAUSE_LABELS: Record<string, string> = {
  neckTrauma: "Neck trauma",
  carotidEndarterectomy: "Carotid endarterectomy",
  carotidBodySurgery: "Carotid body tumour / paraganglioma resection",
  otherNeckSurgery: "Other relevant neck surgery",
  headNeckRadiation: "Head or neck irradiation",
  localTumour: "Local tumour affecting relevant structures",
  brainstemStroke: "Brainstem stroke",
  afferentNeuropathy: "Afferent sensory neuropathy",
  leighSyndrome: "Leigh syndrome",
  grollHirschowitz: "Groll-Hirschowitz syndrome",
  hypertensionBrachydactyly: "Hypertension-brachydactyly syndrome",
  familyParaganglioma: "Family history of paraganglioma / chromaffin tumours",
};

export const CAUSE_EVENT_CAUSE_IDS = [
  "neck_trauma",
  "carotid_endarterectomy",
  "carotid_body_surgery",
  "other_neck_surgery",
  "head_neck_radiation",
  "local_tumour",
  "brainstem_stroke",
  "afferent_neuropathy",
  "leigh_syndrome",
  "groll_hirschowitz",
  "hypertension_brachydactyly",
  "family_paraganglioma",
];
