export type TriageAnswers = {
  trueSyncope: boolean;
  ecg: {
    abnormal: boolean;
    ischemia: boolean;
    bradycardia: boolean;
    tachycardia: boolean;
    qtProlonged: boolean;
    preexcitation: boolean;
    brugadaPattern: boolean;
    afib: boolean;
    avBlock: boolean;
  };
  redFlags: {
    exertional: boolean;
    familyHistorySuddenDeath: boolean;
    structuralHeartDisease: boolean;
    palpitationsBeforeSyncope: boolean;
    syncopeSupine: boolean;
    chestPain: boolean;
    dyspnea: boolean;
  };
  orthostatic: {
    supineSBP: number;
    standingSBP: number;
    supineDBP: number;
    standingDBP: number;
  };
  trigger: {
    pain: boolean;
    emotion: boolean;
    prolongedStanding: boolean;
    heatExposure: boolean;
    nauseaSweating: boolean;
    postMicturition: boolean;
  };
};

export type BranchKey =
  | "not_syncope"
  | "cardiac"
  | "orthostatic"
  | "vasovagal"
  | "unexplained"
  | "evaluation";

export type QuestionnaireSection =
  | "presentation"
  | "cardiac-risk"
  | "ecg-patterns"
  | "orthostatic"
  | "triggers"
  | "summary";

export const QUESTIONNAIRE_SECTIONS: QuestionnaireSection[] = [
  "presentation",
  "cardiac-risk",
  "ecg-patterns",
  "orthostatic",
  "triggers",
  "summary",
];

const sectionLabels: Record<QuestionnaireSection, string> = {
  presentation: "Presentation",
  "cardiac-risk": "Cardiac risk",
  "ecg-patterns": "ECG patterns",
  orthostatic: "Orthostatic BP",
  triggers: "Triggers",
  summary: "Summary",
};

export function getVisibleQuestionSections(answers: TriageAnswers): QuestionnaireSection[] {
  if (!answers.trueSyncope) {
    return ["presentation"];
  }

  const ecgRed =
    answers.ecg.abnormal ||
    answers.ecg.ischemia ||
    answers.ecg.bradycardia ||
    answers.ecg.tachycardia ||
    answers.ecg.qtProlonged ||
    answers.ecg.preexcitation ||
    answers.ecg.brugadaPattern ||
    answers.ecg.afib ||
    answers.ecg.avBlock;

  const redFlag =
    answers.redFlags.exertional ||
    answers.redFlags.familyHistorySuddenDeath ||
    answers.redFlags.structuralHeartDisease ||
    answers.redFlags.palpitationsBeforeSyncope ||
    answers.redFlags.syncopeSupine ||
    answers.redFlags.chestPain ||
    answers.redFlags.dyspnea;

  if (ecgRed || redFlag) {
    return ["presentation", "cardiac-risk", "ecg-patterns"];
  }

  const sbp = answers.orthostatic.supineSBP - answers.orthostatic.standingSBP;
  const dbp = answers.orthostatic.supineDBP - answers.orthostatic.standingDBP;
  const orthostaticDrop = sbp >= 20 || dbp >= 10;
  const triggerPresent =
    answers.trigger.pain ||
    answers.trigger.emotion ||
    answers.trigger.prolongedStanding ||
    answers.trigger.heatExposure ||
    answers.trigger.nauseaSweating ||
    answers.trigger.postMicturition;

  const visible: QuestionnaireSection[] = ["presentation"];
  if (orthostaticDrop) visible.push("orthostatic");
  if (triggerPresent || !orthostaticDrop) visible.push("triggers");
  visible.push("summary");
  return visible;
}

export function getFollowUpBranch(answers: TriageAnswers) {
  const visibleSections = getVisibleQuestionSections(answers);

  if (!answers.trueSyncope) {
    return {
      branch: "not_syncope" as const,
      visibleSections,
      sectionLabels,
      reason: "Event does not fit true syncope.",
      advice: ["Consider seizure, hypoglycemia, TIA, psychogenic TLOC, or intoxication."],
    };
  }

  const ecgRed =
    answers.ecg.abnormal ||
    answers.ecg.ischemia ||
    answers.ecg.bradycardia ||
    answers.ecg.tachycardia ||
    answers.ecg.qtProlonged ||
    answers.ecg.preexcitation ||
    answers.ecg.brugadaPattern ||
    answers.ecg.afib ||
    answers.ecg.avBlock;

  const redFlag =
    answers.redFlags.exertional ||
    answers.redFlags.familyHistorySuddenDeath ||
    answers.redFlags.structuralHeartDisease ||
    answers.redFlags.palpitationsBeforeSyncope ||
    answers.redFlags.syncopeSupine ||
    answers.redFlags.chestPain ||
    answers.redFlags.dyspnea;

  if (ecgRed || redFlag) {
    return {
      branch: "cardiac" as const,
      visibleSections,
      sectionLabels,
      reason: "Cardiac red flag or abnormal ECG present.",
      advice: [
        "Urgent cardiology/ED evaluation.",
        "12-lead ECG review and monitoring.",
        "Echo / telemetry / troponin as indicated.",
      ],
    };
  }

  const sbp = answers.orthostatic.supineSBP - answers.orthostatic.standingSBP;
  const dbp = answers.orthostatic.supineDBP - answers.orthostatic.standingDBP;

  if (sbp >= 20 || dbp >= 10) {
    return {
      branch: "orthostatic" as const,
      visibleSections,
      sectionLabels,
      reason: `BP drop meets criteria (${sbp}/${dbp} mmHg).`,
      advice: [
        "Check hydration, bleeding, and medications.",
        "Repeat standing BP within 3 minutes.",
        "Consider autonomic dysfunction if recurrent.",
      ],
    };
  }

  const triggerPresent =
    answers.trigger.pain ||
    answers.trigger.emotion ||
    answers.trigger.prolongedStanding ||
    answers.trigger.heatExposure ||
    answers.trigger.nauseaSweating ||
    answers.trigger.postMicturition;

  if (triggerPresent) {
    return {
      branch: "vasovagal" as const,
      visibleSections,
      sectionLabels,
      reason: "Trigger/prodrome pattern suggests vasovagal syncope.",
      advice: [
        "Education and trigger avoidance.",
        "Counterpressure maneuvers.",
        "Hydration and salt if appropriate.",
      ],
    };
  }

  return {
    branch: "evaluation" as const,
    visibleSections,
    sectionLabels,
    reason: "No red flags, orthostasis, or clear reflex trigger.",
    advice: ["Targeted follow-up with history, ECG, and selective tests."],
  };
}

export function getSectionLabel(section: QuestionnaireSection) {
  return sectionLabels[section];
}
