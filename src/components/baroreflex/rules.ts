import type {
  Assessment,
  Causes,
  DiaryEntry,
  DiaryCalculations,
  Investigations,
  MatchedPattern,
  PosturalPair,
} from "./types";

export function parseNum(v: string): number | null {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

export function formatDate(d: string): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

export function formatDateTime(d: string): string {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

export function isValidReading(e: DiaryEntry): boolean {
  const sbp = parseNum(e.sbp);
  const dbp = parseNum(e.dbp);
  const hr = parseNum(e.hr);
  if (sbp === null || dbp === null || hr === null) return false;
  if (sbp <= 0 || dbp <= 0 || hr <= 0) return false;
  if (sbp <= dbp) return false;
  const minStanding = parseNum(e.minutesAfterStanding);
  if (e.minutesAfterStanding !== "" && minStanding !== null && minStanding < 0) return false;
  return true;
}

export function isAccepted(e: DiaryEntry): boolean {
  return e.quality === "accepted" && isValidReading(e);
}

export function fieldLabel(id: keyof Assessment): string {
  const labels: Record<string, string> = {
    caseId: "Case identifier",
    assessmentDate: "Assessment date",
    onset: "Onset",
    history: "Relevant clinical history, procedures and chronology",
    medications: "Current medicines, recent changes and timing",
    hypertensiveCrisisDocumented: "Clinician-documented hypertensive crisis",
    alternatingHighLowBp: "Documented alternating high and low BP episodes",
    orthostaticTachycardia: "Documented orthostatic tachycardia",
    orthostaticIntolerance: "Orthostatic symptoms",
    restingBradyHypotension: "Documented resting bradycardia with hypotension",
    sinusArrest: "Documented sinus arrest",
    stressAssociation: "Episodes associated with stress",
    drowsinessAssociation: "Low BP episodes associated with drowsiness",
    stressBpHrSurges: "Documented stress-related BP surges with tachycardia",
    supineHypertension: "Supine hypertension documented",
    orthostaticHypotension: "Orthostatic hypotension documented",
    postprandialHypotension: "Postprandial hypotension documented",
    episodicTachycardia: "Episodic tachycardia documented",
    postoperativeApnoea: "Postoperative apnoea recorded",
    syncope: "Syncope recorded",
    currentUnstableBradycardia: "Current symptomatic bradycardia or significant conduction disturbance",
    currentAsystole: "Current or newly documented asystole",
    newNeurologicDeficit: "New focal neurological deficit",
    currentChestPain: "Current chest pain",
    currentSevereDyspnoea: "Current severe breathlessness",
    clonidineInterruption: "Missed clonidine, patch loss or recent abrupt interruption",
    urgentConcern: "Clinician identifies an acute emergency or unstable patient",
    testFindings: "Available investigations and specialist interpretation",
    differentials: "Alternative explanations considered",
    plan: "Clinician assessment and plan",
  };
  return labels[id] ?? id;
}

export function onsetLabel(o: Assessment["onset"]): string {
  return o === "acute" ? "Acute" : o === "chronic" ? "Chronic" : "Uncertain";
}

export function responseLabel(r: "appropriate_bradycardia" | "absent_or_blunted" | "uninterpretable" | "not_done"): string {
  return {
    appropriate_bradycardia: "Appropriate bradycardia",
    absent_or_blunted: "Absent or blunted",
    uninterpretable: "Uninterpretable",
    not_done: "Not done",
  }[r];
}

const RULES = [
  {
    id: "acute_pattern",
    all: [
      { field: "onset", eq: "acute" },
      { field: "hypertensiveCrisisDocumented", eq: "yes" },
    ],
    output: "Acute hypertensive presentation recorded",
  },
  {
    id: "volatile_pattern",
    any: [
      { field: "alternatingHighLowBp", eq: "yes" },
      { field: "stressBpHrSurges", eq: "yes" },
    ],
    output: "Volatile BP presentation recorded",
  },
  {
    id: "orthostatic_pattern",
    any: [
      { field: "orthostaticTachycardia", eq: "yes" },
      { field: "orthostaticIntolerance", eq: "yes" },
    ],
    output: "Orthostatic presentation recorded",
  },
  {
    id: "vagotonic_pattern",
    any: [
      { field: "restingBradyHypotension", eq: "yes" },
      { field: "sinusArrest", eq: "yes" },
    ],
    output:
      "Bradycardic / hypotensive presentation recorded; specialist assessment needed before attributing to malignant vagotonia",
  },
];

export function evaluateRules(a: Assessment): MatchedPattern[] {
  const matches: MatchedPattern[] = [];
  for (const rule of RULES) {
    let ok = false;
    if (rule.all) {
      ok = rule.all.every((cond) => (a as any)[cond.field] === cond.eq);
    } else if (rule.any) {
      ok = rule.any.some((cond) => (a as any)[cond.field] === cond.eq);
    }
    if (!ok) continue;

    const conditions = rule.all ?? rule.any ?? [];
    matches.push({
      id: rule.id,
      label: rule.id,
      output: rule.output,
      supporting: conditions.map((cond) => ({
        field: fieldLabel(cond.field as keyof Assessment),
        value:
          (a as any)[cond.field] === "yes"
            ? "Yes"
            : (a as any)[cond.field] === "no"
              ? "No"
              : onsetLabel((a as any)[cond.field]),
      })),
    });
  }
  return matches;
}

export function unresolvedFields(a: Assessment): string[] {
  const fieldIds: (keyof Assessment)[] = [
    "onset",
    "hypertensiveCrisisDocumented",
    "alternatingHighLowBp",
    "orthostaticTachycardia",
    "orthostaticIntolerance",
    "restingBradyHypotension",
    "sinusArrest",
    "stressAssociation",
    "drowsinessAssociation",
    "stressBpHrSurges",
    "supineHypertension",
    "orthostaticHypotension",
    "postprandialHypotension",
    "episodicTachycardia",
    "postoperativeApnoea",
    "syncope",
    "currentUnstableBradycardia",
    "currentAsystole",
    "newNeurologicDeficit",
    "currentChestPain",
    "currentSevereDyspnoea",
    "clonidineInterruption",
    "urgentConcern",
  ];
  return fieldIds.filter((id) => (a as any)[id] === "unknown").map((id) => fieldLabel(id));
}

export function diaryCalculations(entries: DiaryEntry[]): DiaryCalculations {
  const accepted = entries.filter(isAccepted);
  const sbps = accepted.map((e) => parseNum(e.sbp)!).filter((n) => n > 0);
  const hrs = accepted.map((e) => parseNum(e.hr)!).filter((n) => n > 0);

  return {
    bpRange: sbps.length >= 2 ? Math.max(...sbps) - Math.min(...sbps) : null,
    hrRange: hrs.length >= 2 ? Math.max(...hrs) - Math.min(...hrs) : null,
    acceptedCount: accepted.length,
    totalCount: entries.length,
    invalidCount: entries.filter((e) => !isValidReading(e)).length,
  };
}

export function pairedPosturalChange(entries: DiaryEntry[]): PosturalPair[] {
  const accepted = entries.filter(isAccepted);
  const episodes = Array.from(new Set(accepted.map((e) => e.episodeId).filter(Boolean)));
  const pairs: PosturalPair[] = [];

  for (const ep of episodes) {
    const epEntries = accepted.filter((e) => e.episodeId === ep);
    const supine = epEntries.find((e) => e.position === "supine");
    const standing = epEntries.find((e) => e.position === "standing");
    if (!supine || !standing) continue;

    const supineSbp = parseNum(supine.sbp)!;
    const supineDbp = parseNum(supine.dbp)!;
    const supineHr = parseNum(supine.hr)!;
    const standingSbp = parseNum(standing.sbp)!;
    const standingDbp = parseNum(standing.dbp)!;
    const standingHr = parseNum(standing.hr)!;

    const elapsedMin =
      supine.timestamp && standing.timestamp
        ? (new Date(standing.timestamp).getTime() - new Date(supine.timestamp).getTime()) / 60000
        : null;

    const hrRise = standingHr - supineHr;
    const hrRiseDescriptor = hrRise > 30;

    pairs.push({
      episodeId: ep,
      supineSbp,
      supineDbp,
      supineHr,
      standingSbp,
      standingDbp,
      standingHr,
      sbpChange: standingSbp - supineSbp,
      dbpChange: standingDbp - supineDbp,
      hrChange: hrRise,
      elapsedMin: elapsedMin !== null && elapsedMin >= 0 ? elapsedMin : null,
      hrRiseDescriptor,
    });
  }

  return pairs;
}

export function isUrgent(a: Assessment): boolean {
  return (
    a.urgentConcern === "yes" ||
    a.currentUnstableBradycardia === "yes" ||
    a.currentAsystole === "yes" ||
    a.newNeurologicDeficit === "yes" ||
    a.currentChestPain === "yes" ||
    a.currentSevereDyspnoea === "yes"
  );
}

export function isUrgencyUnknown(a: Assessment): boolean {
  const fields: (keyof Assessment)[] = [
    "urgentConcern",
    "currentUnstableBradycardia",
    "currentAsystole",
    "newNeurologicDeficit",
    "currentChestPain",
    "currentSevereDyspnoea",
  ];
  return fields.some((f) => (a as any)[f] === "unknown");
}

export function investigationsSummary(inv: Investigations): string[] {
  const lines: string[] = [];
  if (inv.pressorHrResponse !== "not_done") {
    lines.push(`Pressor-induced HR response: ${responseLabel(inv.pressorHrResponse)}`);
  }
  if (inv.depressorHrResponse !== "not_done") {
    lines.push(`Depressor-induced HR response: ${responseLabel(inv.depressorHrResponse)}`);
  }
  if (inv.dailyHrVariation !== "unknown") {
    lines.push(`Daily HR variation with activity: ${inv.dailyHrVariation === "yes" ? "Yes" : "No"}`);
  }
  if (inv.specialistEfferentPreserved !== "unknown") {
    lines.push(`Specialist-documented preserved efferent responses: ${inv.specialistEfferentPreserved === "yes" ? "Yes" : "No"}`);
  }
  if (inv.confounders.length > 0) {
    lines.push(`Confounders: ${inv.confounders.join(", ")}`);
  }
  return lines;
}

export function buildExportPayload(
  assessment: Assessment,
  causes: Causes,
  entries: DiaryEntry[],
  investigations: Investigations,
  differentialReview: Record<string, string>,
  matches: MatchedPattern[],
  calcs: DiaryCalculations,
  pairs: PosturalPair[]
) {
  return {
    meta: {
      title: "Baroreflex Failure: Four Presentations",
      version: "0.2.0",
      specificationVersion: "0.2.0",
      sourceDoi: "10.1161/01.CIR.0000017186.52382.F4",
      exportedAt: new Date().toISOString(),
    },
    assessment,
    causes,
    diary: entries,
    investigations,
    differentialReview,
    computed: {
      matchedPatterns: matches.map((m) => m.id),
      bpRangeMmHg: calcs.bpRange,
      hrRangeBpm: calcs.hrRange,
      pairedPosturalChanges: pairs,
    },
  };
}
