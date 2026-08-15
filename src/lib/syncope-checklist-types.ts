export interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  criteria: string[];
  score: number;
  urgentOverride?: boolean;
  urgentOverrideCondition?: string;
  urgentOverrideConditions?: string[];
  clinicalCorrelates?: string[];
  modifierCriteria?: string[];
  action: string;
}

export interface ChecklistResult {
  score: number;
  isUrgent: boolean;
  label: string;
  action: string;
  triggeredOverrides: string[];
}

export interface ECGMeasurements {
  qtc: number | null;
  pr: number | null;
  qrs: number | null;
  leadAbnormalities: string[];
}

