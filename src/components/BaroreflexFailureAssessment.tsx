import { useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Download,
  FileText,
  HeartPulse,
  Plus,
  Printer,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type YesNoUnknown = "yes" | "no" | "unknown";
type Onset = "acute" | "chronic" | "uncertain";
type Position = "supine" | "seated" | "standing" | "unknown";
type Quality = "accepted" | "questionable" | "excluded";

interface Assessment {
  caseId: string;
  assessmentDate: string;
  onset: Onset;
  history: string;
  medications: string;
  hypertensiveCrisisDocumented: YesNoUnknown;
  alternatingHighLowBp: YesNoUnknown;
  orthostaticTachycardia: YesNoUnknown;
  orthostaticIntolerance: YesNoUnknown;
  restingBradyHypotension: YesNoUnknown;
  sinusArrest: YesNoUnknown;
  stressAssociation: YesNoUnknown;
  drowsinessAssociation: YesNoUnknown;
  urgentConcern: YesNoUnknown;
  testFindings: string;
  differentials: string;
  plan: string;
}

interface DiaryEntry {
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

interface MatchedPattern {
  id: string;
  label: string;
  output: string;
  supporting: { field: string; value: string }[];
}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

const EMPTY_ASSESSMENT: Assessment = {
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
  urgentConcern: "unknown",
  testFindings: "",
  differentials: "",
  plan: "",
};

const EMPTY_READING: Omit<DiaryEntry, "id"> = {
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

function formatDateTime(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

function parseNum(v: string): number | null {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function isValidReading(e: DiaryEntry): boolean {
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

function isAccepted(e: DiaryEntry): boolean {
  return e.quality === "accepted" && isValidReading(e);
}

function fieldLabel(id: keyof Assessment): string {
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
    urgentConcern: "Clinician identifies an acute emergency or unstable patient",
    testFindings: "Available investigations and specialist interpretation",
    differentials: "Alternative explanations considered",
    plan: "Clinician assessment and plan",
  };
  return labels[id] ?? id;
}

function onsetLabel(o: Onset) {
  return o === "acute" ? "Acute" : o === "chronic" ? "Chronic" : "Uncertain";
}

// ---------------------------------------------------------------------------
// Rule engine
// ---------------------------------------------------------------------------

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
    all: [{ field: "alternatingHighLowBp", eq: "yes" }],
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
    output: "Bradycardic / hypotensive presentation recorded; specialist assessment needed before attributing to malignant vagotonia",
  },
];

function evaluateRules(a: Assessment): MatchedPattern[] {
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
        value: (a as any)[cond.field] === "yes" ? "Yes" : onsetLabel((a as any)[cond.field]),
      })),
    });
  }
  return matches;
}

function unresolvedFields(a: Assessment): string[] {
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
    "urgentConcern",
  ];
  return fieldIds
    .filter((id) => (a as any)[id] === "unknown")
    .map((id) => fieldLabel(id));
}

// ---------------------------------------------------------------------------
// Diary calculations
// ---------------------------------------------------------------------------

function diaryCalculations(entries: DiaryEntry[]) {
  const accepted = entries.filter(isAccepted);
  const sbps = accepted.map((e) => parseNum(e.sbp)!).filter((n) => n > 0);
  const dbps = accepted.map((e) => parseNum(e.dbp)!).filter((n) => n > 0);
  const hrs = accepted.map((e) => parseNum(e.hr)!).filter((n) => n > 0);

  return {
    bpRange: sbps.length >= 2 ? Math.max(...sbps) - Math.min(...sbps) : null,
    hrRange: hrs.length >= 2 ? Math.max(...hrs) - Math.min(...hrs) : null,
    acceptedCount: accepted.length,
    totalCount: entries.length,
    invalidCount: entries.filter((e) => !isValidReading(e)).length,
  };
}

function pairedPosturalChange(entries: DiaryEntry[]) {
  const accepted = entries.filter(isAccepted);
  const episodes = Array.from(new Set(accepted.map((e) => e.episodeId).filter(Boolean)));
  const pairs: {
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
  }[] = [];

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
      hrChange: standingHr - supineHr,
      elapsedMin: elapsedMin !== null && elapsedMin >= 0 ? elapsedMin : null,
    });
  }

  return pairs;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BaroreflexFailureAssessment() {
  const [assessment, setAssessment] = useState<Assessment>(EMPTY_ASSESSMENT);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [activeTab, setActiveTab] = useState("assessment");
  const printRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => evaluateRules(assessment), [assessment]);
  const unresolved = useMemo(() => unresolvedFields(assessment), [assessment]);
  const calcs = useMemo(() => diaryCalculations(entries), [entries]);
  const pairs = useMemo(() => pairedPosturalChange(entries), [entries]);

  const isUrgent = assessment.urgentConcern === "yes";
  const isIncomplete = assessment.urgentConcern === "unknown";

  function updateAssessment<K extends keyof Assessment>(field: K, value: Assessment[K]) {
    setAssessment((prev) => ({ ...prev, [field]: value }));
  }

  function addEntry() {
    const id = crypto.randomUUID();
    setEntries((prev) => [
      ...prev,
      {
        ...EMPTY_READING,
        id,
        timestamp: new Date().toISOString().slice(0, 16),
      },
    ]);
  }

  function updateEntry(id: string, patch: Partial<DiaryEntry>) {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function removeEntry(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function resetAll() {
    if (typeof window !== "undefined" && window.confirm("Clear the entire assessment and diary?")) {
      setAssessment(EMPTY_ASSESSMENT);
      setEntries([]);
    }
  }

  function exportJson() {
    const payload = {
      meta: {
        title: "Baroreflex Failure: Four Presentations",
        version: "0.1.0",
        specificationVersion: "0.1.0",
        sourceDoi: "10.1161/01.CIR.0000017186.52382.F4",
        exportedAt: new Date().toISOString(),
      },
      assessment,
      diary: entries,
      computed: {
        matchedPatterns: matches.map((m) => m.id),
        bpRangeMmHg: calcs.bpRange,
        hrRangeBpm: calcs.hrRange,
        pairedPosturalChanges: pairs,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `baroreflex-failure-${assessment.caseId || "case"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    window.print();
  }

  const assessmentComplete =
    assessment.history.trim() !== "" || assessment.assessmentDate !== "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Autonomic · Baroreflex</span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Baroreflex Failure: Four Presentations
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Document bedside phenotype patterns and a BP/HR diary based on Ketch et al., Circulation
          2002. Pattern matches are educational, not diagnostic.
        </p>
      </div>

      {/* Safety banner */}
      {(isUrgent || isIncomplete) && (
        <div
          className={`rounded-xl border p-4 ${
            isUrgent
              ? "border-warn/30 bg-warn/10 text-warn"
              : "border-amber-300/30 bg-amber-100/50 text-amber-900"
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">
                {isUrgent
                  ? "Urgent clinical assessment takes priority."
                  : "Please confirm whether the patient is acutely unstable."}
              </p>
              <p className="text-sm opacity-90">
                {isUrgent
                  ? "Routine interpretation is suppressed until the acute issue is reviewed."
                  : "Unknown urgency status may delay appropriate triage."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 sm:w-auto sm:inline-flex">
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="diary">BP / HR diary</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
        </TabsList>

        {/* Assessment tab */}
        <TabsContent value="assessment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                Clinical information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="caseId">Case identifier</Label>
                <Input
                  id="caseId"
                  value={assessment.caseId}
                  onChange={(e) => updateAssessment("caseId", e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assessmentDate">Assessment date</Label>
                <Input
                  id="assessmentDate"
                  type="date"
                  value={assessment.assessmentDate}
                  onChange={(e) => updateAssessment("assessmentDate", e.target.value)}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="onset">Onset</Label>
                <select
                  id="onset"
                  value={assessment.onset}
                  onChange={(e) => updateAssessment("onset", e.target.value as Onset)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="acute">Acute</option>
                  <option value="chronic">Chronic</option>
                  <option value="uncertain">Uncertain</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="history">Relevant clinical history, procedures and chronology</Label>
                <Textarea
                  id="history"
                  value={assessment.history}
                  onChange={(e) => updateAssessment("history", e.target.value)}
                  rows={3}
                  placeholder="Include onset, triggers, prior treatments, relevant anatomy/procedures..."
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="medications">Current medicines, recent changes and timing</Label>
                <Textarea
                  id="medications"
                  value={assessment.medications}
                  onChange={(e) => updateAssessment("medications", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Phenotype features
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ["hypertensiveCrisisDocumented", "Clinician-documented hypertensive crisis"],
                  ["alternatingHighLowBp", "Documented alternating high and low BP episodes"],
                  ["orthostaticTachycardia", "Documented orthostatic tachycardia"],
                  ["orthostaticIntolerance", "Orthostatic symptoms"],
                  ["restingBradyHypotension", "Documented resting bradycardia with hypotension"],
                  ["sinusArrest", "Documented sinus arrest"],
                  ["stressAssociation", "Episodes associated with stress"],
                  ["drowsinessAssociation", "Low BP episodes associated with drowsiness"],
                  ["urgentConcern", "Clinician identifies an acute emergency or unstable patient"],
                ] as [keyof Assessment, string][]
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm leading-snug">{label}</Label>
                  <div className="flex gap-2">
                    {(["yes", "no", "unknown"] as YesNoUnknown[]).map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => updateAssessment(key, val)}
                        className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition ${
                          (assessment as any)[key] === val
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background hover:bg-muted/50"
                        }`}
                      >
                        {val === "unknown" ? "Unknown" : val === "yes" ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Assessment, differentials and plan
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="testFindings">Available investigations and specialist interpretation</Label>
                <Textarea
                  id="testFindings"
                  value={assessment.testFindings}
                  onChange={(e) => updateAssessment("testFindings", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="differentials">Alternative explanations considered</Label>
                <Textarea
                  id="differentials"
                  value={assessment.differentials}
                  onChange={(e) => updateAssessment("differentials", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan">Clinician assessment and plan</Label>
                <Textarea
                  id="plan"
                  value={assessment.plan}
                  onChange={(e) => updateAssessment("plan", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diary tab */}
        <TabsContent value="diary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HeartPulse className="h-5 w-5 text-primary" />
                BP / HR diary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add readings with posture, symptoms and episode links. Questionable or invalid readings are kept visible but excluded from summaries.
              </p>

              {entries.map((entry) => {
                const invalid = !isValidReading(entry);
                return (
                  <div
                    key={entry.id}
                    className={`rounded-xl border p-3 ${
                      invalid ? "border-warn/40 bg-warn/5" : "border-border bg-card"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-sm font-medium">Reading {entry.id.slice(0, 8)}</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEntry(entry.id)}
                        aria-label="Remove reading"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1">
                        <Label className="text-xs">Timestamp</Label>
                        <Input
                          type="datetime-local"
                          value={entry.timestamp}
                          onChange={(e) => updateEntry(entry.id, { timestamp: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">SBP (mmHg)</Label>
                        <Input
                          type="number"
                          value={entry.sbp}
                          onChange={(e) => updateEntry(entry.id, { sbp: e.target.value })}
                          placeholder="120"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">DBP (mmHg)</Label>
                        <Input
                          type="number"
                          value={entry.dbp}
                          onChange={(e) => updateEntry(entry.id, { dbp: e.target.value })}
                          placeholder="80"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">HR (bpm)</Label>
                        <Input
                          type="number"
                          value={entry.hr}
                          onChange={(e) => updateEntry(entry.id, { hr: e.target.value })}
                          placeholder="70"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Position</Label>
                        <select
                          value={entry.position}
                          onChange={(e) => updateEntry(entry.id, { position: e.target.value as Position })}
                          className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                        >
                          <option value="supine">Supine</option>
                          <option value="seated">Seated</option>
                          <option value="standing">Standing</option>
                          <option value="unknown">Unknown</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Standing time (min)</Label>
                        <Input
                          type="number"
                          value={entry.minutesAfterStanding}
                          onChange={(e) =>
                            updateEntry(entry.id, { minutesAfterStanding: e.target.value })
                          }
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Episode ID</Label>
                        <Input
                          value={entry.episodeId}
                          onChange={(e) => updateEntry(entry.id, { episodeId: e.target.value })}
                          placeholder="e.g. episode-1"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Quality</Label>
                        <select
                          value={entry.quality}
                          onChange={(e) => updateEntry(entry.id, { quality: e.target.value as Quality })}
                          className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                        >
                          <option value="accepted">Accepted</option>
                          <option value="questionable">Questionable</option>
                          <option value="excluded">Excluded</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <Input
                        value={entry.symptoms}
                        onChange={(e) => updateEntry(entry.id, { symptoms: e.target.value })}
                        placeholder="Symptoms"
                      />
                      <Input
                        value={entry.context}
                        onChange={(e) => updateEntry(entry.id, { context: e.target.value })}
                        placeholder="Context"
                      />
                      <Input
                        value={entry.medicationTiming}
                        onChange={(e) => updateEntry(entry.id, { medicationTiming: e.target.value })}
                        placeholder="Medication timing"
                      />
                    </div>
                    {invalid && (
                      <p className="mt-2 text-xs text-warn">
                        Invalid: BP/HR must be positive and SBP must be greater than DBP.
                      </p>
                    )}
                  </div>
                );
              })}

              <Button variant="outline" onClick={addEntry} className="gap-2">
                <Plus className="h-4 w-4" /> Add reading
              </Button>

              <Card className="bg-muted/30">
                <CardContent className="space-y-2 pt-4 text-sm">
                  <p>
                    <span className="font-medium">Accepted readings:</span> {calcs.acceptedCount} /{" "}
                    {calcs.totalCount}
                  </p>
                  <p>
                    <span className="font-medium">BP range:</span>{" "}
                    {calcs.bpRange !== null ? `${calcs.bpRange} mmHg` : "Insufficient data"}
                  </p>
                  <p>
                    <span className="font-medium">HR range:</span>{" "}
                    {calcs.hrRange !== null ? `${calcs.hrRange} bpm` : "Insufficient data"}
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Results tab */}
        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Matched phenotype patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isUrgent ? (
                <div className="rounded-lg border border-warn/30 bg-warn/10 p-4 text-warn">
                  Urgent clinical assessment takes priority. Routine interpretation is suppressed.
                </div>
              ) : matches.length === 0 ? (
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-muted-foreground">
                  No presentation matched the entered information. This neither excludes nor confirms
                  baroreflex failure.
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map((m) => (
                    <div key={m.id} className="rounded-xl border border-border bg-card p-4">
                      <p className="font-semibold text-foreground">{m.output}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Supporting:{" "}
                        {m.supporting.map((s) => `${s.field} = ${s.value}`).join("; ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {unresolved.length > 0 && !isUrgent && (
                <div className="rounded-lg border border-amber-300/30 bg-amber-100/50 p-3 text-sm text-amber-900">
                  <span className="font-medium">Unresolved items:</span> {unresolved.join("; ")}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <HeartPulse className="h-5 w-5 text-primary" />
                Diary summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Accepted readings:</span> {calcs.acceptedCount} /{" "}
                {calcs.totalCount}
              </p>
              <p>
                <span className="font-medium">BP range:</span>{" "}
                {calcs.bpRange !== null ? `${calcs.bpRange} mmHg` : "Insufficient data"}
              </p>
              <p>
                <span className="font-medium">HR range:</span>{" "}
                {calcs.hrRange !== null ? `${calcs.hrRange} bpm` : "Insufficient data"}
              </p>
              {pairs.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="font-medium">Paired postural changes (supine → standing)</p>
                  {pairs.map((p) => (
                    <div key={p.episodeId} className="rounded-md border border-border bg-muted/30 p-2">
                      <p className="text-xs text-muted-foreground">Episode {p.episodeId}</p>
                      <p>
                        SBP {p.sbpChange > 0 ? "+" : ""}
                        {p.sbpChange} mmHg · DBP {p.dbpChange > 0 ? "+" : ""}
                        {p.dbpChange} mmHg · HR {p.hrChange > 0 ? "+" : ""}
                        {p.hrChange} bpm
                      </p>
                      {p.elapsedMin !== null && (
                        <p className="text-xs text-muted-foreground">
                          Elapsed standing time: {Math.round(p.elapsedMin)} min
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Report tab */}
        <TabsContent value="report" className="space-y-4">
          <div className="flex flex-wrap gap-2 print:hidden">
            <Button variant="outline" onClick={exportJson} className="gap-2">
              <Download className="h-4 w-4" /> Export JSON
            </Button>
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" /> Print report
            </Button>
            <Button variant="ghost" onClick={resetAll} className="gap-2 text-destructive">
              <RotateCcw className="h-4 w-4" /> Clear assessment
            </Button>
          </div>

          <div
            ref={printRef}
            className="space-y-6 rounded-xl border border-border bg-white p-6 text-black print:border-0 print:p-0"
          >
            <div className="border-b border-black pb-4">
              <h2 className="text-2xl font-semibold">Baroreflex Presentation Assessment</h2>
              <p className="text-sm text-gray-700">
                Abstract-based educational adaptation; not a validated diagnostic instrument.
              </p>
              {assessment.caseId && (
                <p className="mt-2 text-sm font-medium">Case ID: {assessment.caseId}</p>
              )}
              <p className="text-sm">Date: {formatDate(assessment.assessmentDate)}</p>
            </div>

            <section>
              <h3 className="text-lg font-semibold">Clinical history</h3>
              <p className="whitespace-pre-wrap text-sm">
                {assessment.history || "Not provided."}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Medications</h3>
              <p className="whitespace-pre-wrap text-sm">
                {assessment.medications || "Not provided."}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Recorded phenotype matches</h3>
              {isUrgent ? (
                <p className="text-sm font-semibold text-red-700">
                  Urgent clinical assessment takes priority — routine interpretation suppressed.
                </p>
              ) : matches.length === 0 ? (
                <p className="text-sm text-gray-700">
                  No presentation matched. This neither excludes nor confirms baroreflex failure.
                </p>
              ) : (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {matches.map((m) => (
                    <li key={m.id}>
                      {m.output}
                      <br />
                      <span className="text-xs text-gray-600">
                        Supporting: {m.supporting.map((s) => `${s.field} = ${s.value}`).join("; ")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="text-lg font-semibold">Unanswered phenotype items</h3>
              <p className="text-sm">
                {unresolved.length > 0 ? unresolved.join("; ") : "None — all items answered."}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">BP and HR descriptive summary</h3>
              <p className="text-sm">
                Accepted readings: {calcs.acceptedCount} / {calcs.totalCount}
                <br />
                BP range: {calcs.bpRange !== null ? `${calcs.bpRange} mmHg` : "Insufficient data"}
                <br />
                HR range: {calcs.hrRange !== null ? `${calcs.hrRange} bpm` : "Insufficient data"}
              </p>
              {pairs.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Paired supine → standing changes</p>
                  <ul className="list-disc pl-5 text-sm">
                    {pairs.map((p) => (
                      <li key={p.episodeId}>
                        Episode {p.episodeId}: SBP {p.sbpChange > 0 ? "+" : ""}
                        {p.sbpChange} mmHg, DBP {p.dbpChange > 0 ? "+" : ""}
                        {p.dbpChange} mmHg, HR {p.hrChange > 0 ? "+" : ""}
                        {p.hrChange} bpm
                        {p.elapsedMin !== null && ` (${Math.round(p.elapsedMin)} min standing)`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section>
              <h3 className="text-lg font-semibold">Investigation findings</h3>
              <p className="whitespace-pre-wrap text-sm">
                {assessment.testFindings || "Not provided."}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Differential considerations</h3>
              <p className="whitespace-pre-wrap text-sm">
                {assessment.differentials || "Not provided."}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Clinician impression and plan</h3>
              <p className="whitespace-pre-wrap text-sm">{assessment.plan || "Not provided."}</p>
            </section>

            <section className="border-t border-black pt-4 text-xs text-gray-700">
              <p>
                Source: Ketch T, Biaggioni I, Robertson R, Robertson D. Four faces of baroreflex
                failure: hypertensive crisis, volatile hypertension, orthostatic tachycardia, and
                malignant vagotonia. Circulation. 2002;105:2518–2523. doi:10.1161/01.CIR.0000017186.52382.F4
              </p>
              <p className="mt-1">
                Form design, matching rules, diary and report are implementation additions not
                validated by the source article.
              </p>
            </section>
          </div>
        </TabsContent>

        {/* Source tab */}
        <TabsContent value="source" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Source and limitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                <span className="font-medium">Article:</span> Four faces of baroreflex failure:
                hypertensive crisis, volatile hypertension, orthostatic tachycardia, and malignant
                vagotonia.
              </p>
              <p>
                <span className="font-medium">Authors:</span> Terry Ketch, Italo Biaggioni,
                RoseMarie Robertson, David Robertson.
              </p>
              <p>
                <span className="font-medium">Journal:</span> Circulation, 2002;105:2518–2523.
              </p>
              <p>
                <span className="font-medium">DOI:</span>{" "}
                <a
                  href="https://doi.org/10.1161/01.CIR.0000017186.52382.F4"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  10.1161/01.CIR.0000017186.52382.F4
                </a>
              </p>
              <div className="rounded-lg border border-warn/20 bg-warn/5 p-3 text-warn">
                <p className="font-medium">Important limitations</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  <li>This mini-app is built from the article title and abstract only.</li>
                  <li>Pattern matches are descriptive, not diagnostic.</li>
                  <li>No validated score, probability, or automated treatment recommendation is provided.</li>
                  <li>Full-text review and clinician validation are required before release.</li>
                  <li>Always prioritise urgent clinical assessment over interpretation output.</li>
                </ul>
              </div>

              <div>
                <p className="font-medium">Educational mechanism</p>
                <p className="text-muted-foreground">
                  Damage to baroreceptor afferents or central connections reduces buffering of blood
                  pressure and heart rate. The four described phenotypes are:
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">Hypertensive crisis</span> — acute
                    major hypertensive episode.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Volatile hypertension</span> —
                    hypertensive surges alternating with hypotension.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Orthostatic tachycardia / intolerance</span>{" "}
                    — partial afferent impairment presenting with orthostatic symptoms.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Malignant vagotonia</span> —
                    preserved vagal efferents permitting marked bradycardia, hypotension or sinus
                    arrest.
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom action bar */}
      <div className="flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" onClick={() => setActiveTab("diary")} className="gap-2">
          <Plus className="h-4 w-4" /> Add diary reading
        </Button>
        <Button variant="outline" onClick={() => setActiveTab("results")} className="gap-2">
          <Activity className="h-4 w-4" /> Review patterns
        </Button>
        <Button variant="outline" onClick={() => setActiveTab("report")} className="gap-2">
          <FileText className="h-4 w-4" /> Print report
        </Button>
        <Button variant="outline" onClick={exportJson} className="gap-2">
          <Download className="h-4 w-4" /> Export JSON
        </Button>
        <Button variant="ghost" onClick={resetAll} className="gap-2 text-destructive">
          <RotateCcw className="h-4 w-4" /> Clear assessment
        </Button>
      </div>
    </div>
  );
}
