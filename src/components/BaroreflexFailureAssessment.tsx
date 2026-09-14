import { useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Download,
  FileText,
  HeartPulse,
  Pill,
  Plus,
  Printer,
  RotateCcw,
  Stethoscope,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import {
  type Assessment,
  type Causes,
  type CauseEvent,
  type DiaryEntry,
  type Investigations,
  EMPTY_ASSESSMENT,
  EMPTY_CAUSES,
  EMPTY_READING,
  EMPTY_INVESTIGATIONS,
  DIFFERENTIAL_ITEMS,
  CONFOUNDER_OPTIONS,
  CAUSE_LABELS,
  CAUSE_EVENT_CAUSE_IDS,
  type YesNoUnknown,
} from "./baroreflex/types";

import {
  diaryCalculations,
  evaluateRules,
  formatDate,
  formatDateTime,
  isAccepted,
  isUrgent,
  isUrgencyUnknown,
  isValidReading,
  investigationsSummary,
  onsetLabel,
  pairedPosturalChange,
  parseNum,
  unresolvedFields,
  buildExportPayload,
} from "./baroreflex/rules";

const PHENOTYPES = [
  {
    id: "acute",
    title: "Hypertensive crisis",
    description:
      "Acute afferent injury may cause sustained severe hypertension, tachycardia, headache and sweating, often after neck surgery or trauma.",
  },
  {
    id: "volatile",
    title: "Volatile hypertension",
    description:
      "Abrupt BP surges with tachycardia may follow mental or physical stress and alternate with hypotension during quiet, sedation or sleep.",
  },
  {
    id: "orthostatic",
    title: "Orthostatic tachycardia / intolerance",
    description: "Partial baroreflex impairment can present with upright tachycardia or orthostatic symptoms.",
  },
  {
    id: "vagotonia",
    title: "Malignant vagotonia / selective baroreflex failure",
    description:
      "Afferent loss with preserved vagal efferents can produce profound resting hypotension, bradycardia or asystole, including during early-morning sleep.",
  },
];

const COMPARISON_ROWS = [
  ["Supine hypertension", "++", "+/−"],
  ["Labile hypertension", "−", "+++"],
  ["Orthostatic hypotension", "+++", "+/−"],
  ["Postprandial hypotension", "+++", "−"],
  ["Episodic tachycardia", "−", "+++"],
];

const MANAGEMENT_FLAGS = [
  {
    agents: ["Tricyclic antidepressants", "MAO-A inhibitors", "Amphetamines", "Cocaine", "Yohimbine"],
    action: "Flag potential potentiation of sympathetic surges for clinician review; never advise abrupt discontinuation.",
  },
  {
    agents: ["Prednisone", "Tyramine-containing food/beverage"],
    action: "Listed in the 2002 table. Do not encode as universal absolute contraindications; assess indication, BP effect and relevant drug interactions.",
  },
  {
    agents: ["Clonidine"],
    action: "Flag interruptions and patch loss for prompt medication review; do not recommend abrupt withdrawal or a catch-up dose.",
  },
];

const TRI_STATE_OPTIONS: YesNoUnknown[] = ["yes", "no", "unknown"];

function TriStateButtons({
  value,
  onChange,
}: {
  value: YesNoUnknown;
  onChange: (v: YesNoUnknown) => void;
}) {
  return (
    <div className="flex gap-2">
      {TRI_STATE_OPTIONS.map((val) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition ${
            value === val
              ? "border-primary bg-primary text-primary-foreground"
              : "border-input bg-background hover:bg-muted/50"
          }`}
        >
          {val === "unknown" ? "Unknown" : val === "yes" ? "Yes" : "No"}
        </button>
      ))}
    </div>
  );
}

export function BaroreflexFailureAssessment() {
  const [assessment, setAssessment] = useState<Assessment>(EMPTY_ASSESSMENT);
  const [causes, setCauses] = useState<Causes>(EMPTY_CAUSES);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [investigations, setInvestigations] = useState<Investigations>(EMPTY_INVESTIGATIONS);
  const [differentialReview, setDifferentialReview] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("assessment");
  const printRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => evaluateRules(assessment), [assessment]);
  const unresolved = useMemo(() => unresolvedFields(assessment), [assessment]);
  const calcs = useMemo(() => diaryCalculations(entries), [entries]);
  const pairs = useMemo(() => pairedPosturalChange(entries), [entries]);

  const urgent = isUrgent(assessment);
  const urgentUnknown = isUrgencyUnknown(assessment);

  function updateAssessment<K extends keyof Assessment>(field: K, value: Assessment[K]) {
    setAssessment((prev) => ({ ...prev, [field]: value }));
  }

  function updateCause<K extends keyof Causes>(field: K, value: Causes[K]) {
    setCauses((prev) => ({ ...prev, [field]: value }));
  }

  function addEvent() {
    const id = crypto.randomUUID();
    setCauses((prev) => ({
      ...prev,
      events: [
        ...prev.events,
        {
          id,
          causeId: "",
          eventDate: "",
          side: "unknown",
          symptomOnsetDate: "",
          anatomicalDetails: "",
          supportingRecord: "",
        },
      ],
    }));
  }

  function updateEvent(id: string, patch: Partial<CauseEvent>) {
    setCauses((prev) => ({
      ...prev,
      events: prev.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }

  function removeEvent(id: string) {
    setCauses((prev) => ({ ...prev, events: prev.events.filter((e) => e.id !== id) }));
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

  function updateInvestigation<K extends keyof Investigations>(field: K, value: Investigations[K]) {
    setInvestigations((prev) => ({ ...prev, [field]: value }));
  }

  function toggleConfounder(option: string) {
    setInvestigations((prev) => {
      const next = prev.confounders.includes(option)
        ? prev.confounders.filter((c) => c !== option)
        : [...prev.confounders, option];
      return { ...prev, confounders: next };
    });
  }

  function setDifferential(item: string, status: string) {
    setDifferentialReview((prev) => ({ ...prev, [item]: status }));
  }

  function resetAll() {
    if (typeof window !== "undefined" && window.confirm("Clear the entire assessment, causes, diary, investigations and differentials?")) {
      setAssessment(EMPTY_ASSESSMENT);
      setCauses(EMPTY_CAUSES);
      setEntries([]);
      setInvestigations(EMPTY_INVESTIGATIONS);
      setDifferentialReview({});
    }
  }

  function exportJson() {
    const payload = buildExportPayload(
      assessment,
      causes,
      entries,
      investigations,
      differentialReview,
      matches,
      calcs,
      pairs
    );
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

  const assessmentFields: [keyof Assessment, string][] = [
    ["hypertensiveCrisisDocumented", "Clinician-documented hypertensive crisis"],
    ["alternatingHighLowBp", "Documented alternating high and low BP episodes"],
    ["stressBpHrSurges", "Documented stress-related BP surges with tachycardia"],
    ["supineHypertension", "Supine hypertension documented"],
    ["orthostaticTachycardia", "Documented orthostatic tachycardia"],
    ["orthostaticIntolerance", "Orthostatic symptoms"],
    ["orthostaticHypotension", "Orthostatic hypotension documented"],
    ["postprandialHypotension", "Postprandial hypotension documented"],
    ["episodicTachycardia", "Episodic tachycardia documented"],
    ["restingBradyHypotension", "Documented resting bradycardia with hypotension"],
    ["sinusArrest", "Documented sinus arrest"],
    ["currentUnstableBradycardia", "Current symptomatic bradycardia or significant conduction disturbance"],
    ["currentAsystole", "Current or newly documented asystole"],
    ["postoperativeApnoea", "Postoperative apnoea recorded"],
    ["syncope", "Syncope recorded"],
    ["stressAssociation", "Episodes associated with stress"],
    ["drowsinessAssociation", "Low BP episodes associated with drowsiness"],
    ["newNeurologicDeficit", "New focal neurological deficit"],
    ["currentChestPain", "Current chest pain"],
    ["currentSevereDyspnoea", "Current severe breathlessness"],
    ["clonidineInterruption", "Missed clonidine, patch loss or recent abrupt interruption"],
    ["urgentConcern", "Clinician identifies an acute emergency or unstable patient"],
  ];

  const causeFields: (keyof Causes)[] = [
    "neckTrauma",
    "carotidEndarterectomy",
    "carotidBodySurgery",
    "otherNeckSurgery",
    "headNeckRadiation",
    "localTumour",
    "brainstemStroke",
    "afferentNeuropathy",
    "leighSyndrome",
    "grollHirschowitz",
    "hypertensionBrachydactyly",
    "familyParaganglioma",
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Autonomic · Baroreflex</span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Baroreflex Failure: Four Presentations</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Document bedside phenotype patterns, causes, investigations and differentials based on Ketch et al., Circulation
          2002. Pattern matches are educational, not diagnostic.
        </p>
      </div>

      {(urgent || urgentUnknown) && (
        <div
          className={`rounded-xl border p-4 ${
            urgent
              ? "border-warn/30 bg-warn/10 text-warn"
              : "border-amber-300/30 bg-amber-100/50 text-amber-900"
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">
                {urgent
                  ? "Urgent clinical assessment takes priority."
                  : "Please confirm whether the patient is acutely unstable."}
              </p>
              <p className="text-sm opacity-90">
                {urgent
                  ? "Routine interpretation is suppressed until the acute issue is reviewed."
                  : "Unknown urgency status may delay appropriate triage."}
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-9">
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="causes">Causes</TabsTrigger>
          <TabsTrigger value="diary">Diary</TabsTrigger>
          <TabsTrigger value="investigations">Tests</TabsTrigger>
          <TabsTrigger value="differentials">Ddx</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="management">Rx</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
        </TabsList>

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
                  onChange={(e) => updateAssessment("onset", e.target.value as Assessment["onset"])}
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
                Phenotype features and red flags
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assessmentFields.map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm leading-snug">{label}</Label>
                  <TriStateButtons value={assessment[key]} onChange={(v) => updateAssessment(key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="h-5 w-5 text-primary" />
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

        <TabsContent value="causes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                Suspected causes and associations
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {causeFields.map((key) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm leading-snug">{CAUSE_LABELS[key]}</Label>
                  <TriStateButtons value={causes[key]} onChange={(v) => updateCause(key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">Cause events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Record dated events such as surgery, trauma or radiation with side and anatomical details.
              </p>
              {causes.events.map((event) => (
                <div key={event.id} className="rounded-xl border border-border bg-card p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-sm font-medium">Event {event.id.slice(0, 8)}</div>
                    <Button variant="ghost" size="icon" onClick={() => removeEvent(event.id)} aria-label="Remove event">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Cause</Label>
                      <select
                        value={event.causeId}
                        onChange={(e) => updateEvent(event.id, { causeId: e.target.value })}
                        className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                      >
                        <option value="">Select cause</option>
                        {CAUSE_EVENT_CAUSE_IDS.map((id) => (
                          <option key={id} value={id}>
                            {id.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Event date</Label>
                      <Input
                        type="date"
                        value={event.eventDate}
                        onChange={(e) => updateEvent(event.id, { eventDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Symptom onset</Label>
                      <Input
                        type="date"
                        value={event.symptomOnsetDate}
                        onChange={(e) => updateEvent(event.id, { symptomOnsetDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Side</Label>
                      <select
                        value={event.side}
                        onChange={(e) =>
                          updateEvent(event.id, { side: e.target.value as CauseEvent["side"] })
                        }
                        className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm"
                      >
                        <option value="right">Right</option>
                        <option value="left">Left</option>
                        <option value="bilateral">Bilateral</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Input
                      value={event.anatomicalDetails}
                      onChange={(e) => updateEvent(event.id, { anatomicalDetails: e.target.value })}
                      placeholder="Anatomical details"
                    />
                    <Input
                      value={event.supportingRecord}
                      onChange={(e) => updateEvent(event.id, { supportingRecord: e.target.value })}
                      placeholder="Supporting record / reference"
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addEvent} className="gap-2">
                <Plus className="h-4 w-4" /> Add cause event
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

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
                    className={`rounded-xl border p-3 ${invalid ? "border-warn/40 bg-warn/5" : "border-border bg-card"}`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-sm font-medium">Reading {entry.id.slice(0, 8)}</div>
                      <Button variant="ghost" size="icon" onClick={() => removeEntry(entry.id)} aria-label="Remove reading">
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
                          onChange={(e) => updateEntry(entry.id, { position: e.target.value as DiaryEntry["position"] })}
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
                          onChange={(e) => updateEntry(entry.id, { minutesAfterStanding: e.target.value })}
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
                          onChange={(e) => updateEntry(entry.id, { quality: e.target.value as DiaryEntry["quality"] })}
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
                    <span className="font-medium">Accepted readings:</span> {calcs.acceptedCount} / {calcs.totalCount}
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

        <TabsContent value="investigations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Specialist investigations
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>HR response to documented pressor-induced BP rise</Label>
                <select
                  value={investigations.pressorHrResponse}
                  onChange={(e) =>
                    updateInvestigation("pressorHrResponse", e.target.value as Investigations["pressorHrResponse"])
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="not_done">Not done</option>
                  <option value="appropriate_bradycardia">Appropriate bradycardia</option>
                  <option value="absent_or_blunted">Absent or blunted</option>
                  <option value="uninterpretable">Uninterpretable</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>HR response to documented depressor-induced BP fall</Label>
                <select
                  value={investigations.depressorHrResponse}
                  onChange={(e) =>
                    updateInvestigation("depressorHrResponse", e.target.value as Investigations["depressorHrResponse"])
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="not_done">Not done</option>
                  <option value="appropriate_tachycardia">Appropriate tachycardia</option>
                  <option value="absent_or_blunted">Absent or blunted</option>
                  <option value="uninterpretable">Uninterpretable</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>HR variation with ordinary activities documented</Label>
                <TriStateButtons
                  value={investigations.dailyHrVariation}
                  onChange={(v) => updateInvestigation("dailyHrVariation", v)}
                />
              </div>
              <div className="space-y-2">
                <Label>Specialist documented preserved efferent autonomic responses</Label>
                <TriStateButtons
                  value={investigations.specialistEfferentPreserved}
                  onChange={(v) => updateInvestigation("specialistEfferentPreserved", v)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Confounders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {CONFOUNDER_OPTIONS.map((option) => {
                  const active = investigations.confounders.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleConfounder(option)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background hover:bg-muted/50"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reports</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="space-y-2">
                <Label>Test report / interpretation</Label>
                <Textarea
                  value={investigations.testReport}
                  onChange={(e) => updateInvestigation("testReport", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Rhythm findings</Label>
                <Textarea
                  value={investigations.rhythmReport}
                  onChange={(e) => updateInvestigation("rhythmReport", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Specialist conclusion</Label>
                <Textarea
                  value={investigations.specialistConclusion}
                  onChange={(e) => updateInvestigation("specialistConclusion", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="differentials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="h-5 w-5 text-primary" />
                Differential review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                For each item select not assessed / under evaluation / supported / less likely and add evidence. A not-done result is not proof of absence.
              </p>
              {DIFFERENTIAL_ITEMS.map((item) => (
                <div key={item} className="rounded-xl border border-border bg-card p-3">
                  <div className="mb-2 text-sm font-medium">{item}</div>
                  <div className="flex flex-wrap gap-2">
                    {["not_assessed", "under_evaluation", "supported", "less_likely"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setDifferential(item, status)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                          (differentialReview[item] ?? "not_assessed") === status
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background hover:bg-muted/50"
                        }`}
                      >
                        {status.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Matched phenotype patterns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {urgent ? (
                <div className="rounded-lg border border-warn/30 bg-warn/10 p-4 text-warn">
                  Urgent clinical assessment takes priority. Routine interpretation is suppressed.
                </div>
              ) : matches.length === 0 ? (
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-muted-foreground">
                  No presentation matched the entered information. This neither excludes nor confirms baroreflex failure.
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map((m) => (
                    <div key={m.id} className="rounded-xl border border-border bg-card p-4">
                      <p className="font-semibold text-foreground">{m.output}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Supporting: {m.supporting.map((s) => `${s.field} = ${s.value}`).join("; ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {unresolved.length > 0 && !urgent && (
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
                <span className="font-medium">Accepted readings:</span> {calcs.acceptedCount} / {calcs.totalCount}
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
                      {p.hrRiseDescriptor && (
                        <p className="text-xs text-muted-foreground">
                          HR rise &gt;30 bpm: meets the 2002 article’s historical descriptor (not a modern POTS rule).
                        </p>
                      )}
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

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Autonomic failure vs baroreflex failure comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-2 text-left font-medium">Feature</th>
                      <th className="py-2 text-center font-medium">Autonomic failure</th>
                      <th className="py-2 text-center font-medium">Baroreflex failure</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_ROWS.map(([feature, af, bf]) => (
                      <tr key={feature} className="border-b border-border/50">
                        <td className="py-2">{feature}</td>
                        <td className="py-2 text-center font-semibold">{af}</td>
                        <td className="py-2 text-center font-semibold">{bf}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Qualitative descriptions from the 2002 article; not a diagnostic score. Do not interpret a minus sign as impossible.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pill className="h-5 w-5 text-primary" />
                Management reference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-lg border border-warn/20 bg-warn/5 p-3 text-warn">
                <p className="font-medium">Educational reference only</p>
                <p className="opacity-90">No generated prescriptions or automatic dose adjustments. Verify contemporary sources before treatment decisions.</p>
              </div>

              <div>
                <p className="font-medium">Goals</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>Reduce hazardous BP/HR surges</li>
                  <li>Reduce symptomatic hypotension</li>
                  <li>Address clinically significant bradyarrhythmia</li>
                  <li>Review both high and low BP burden at follow-up</li>
                </ul>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="font-medium">Historical 2002 agents for BP surges</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                    <li>Clonidine</li>
                    <li>Guanadrel</li>
                    <li>Guanethidine</li>
                    <li>Diazepam in selected cases</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Historical 2002 agents for hypotension</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                    <li>Fludrocortisone</li>
                    <li>Exceptional yohimbine use described for excessive alpha-2 agonist effect</li>
                  </ul>
                </div>
              </div>

              <div>
                <p className="font-medium">2019 JACC review context</p>
                <p className="text-muted-foreground">
                  Long-acting central sympatholytics are a mainstay. Fludrocortisone is reserved for otherwise resistant hypotension because it can aggravate cardiovascular problems.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Limited verified update, not a complete current prescribing review.</p>
              </div>

              <div>
                <p className="font-medium">Review flags</p>
                <div className="mt-1 space-y-2">
                  {MANAGEMENT_FLAGS.map((flag, idx) => (
                    <div key={idx} className="rounded-md border border-border bg-muted/30 p-2">
                      <p className="font-medium">{flag.agents.join(" · ")}</p>
                      <p className="text-xs text-muted-foreground">{flag.action}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-medium">Pacing / rhythm</p>
                <p className="text-muted-foreground">
                  Rhythm findings prompt cardiology/electrophysiology assessment. Neither HR &lt;40 nor a reported pause duration is used alone as an automatic pacemaker indication.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                Adapted from user-supplied 2002 article text with labelled later context. Not a validated diagnostic instrument or prescribing tool.
              </p>
              {assessment.caseId && <p className="mt-2 text-sm font-medium">Case ID: {assessment.caseId}</p>}
              <p className="text-sm">Date: {formatDate(assessment.assessmentDate)}</p>
            </div>

            <section>
              <h3 className="text-lg font-semibold">Clinical history and medications</h3>
              <p className="whitespace-pre-wrap text-sm">{assessment.history || "Not provided."}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{assessment.medications || "Medications not provided."}</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Recorded phenotype matches</h3>
              {urgent ? (
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
              <p className="text-sm">{unresolved.length > 0 ? unresolved.join("; ") : "None — all items answered."}</p>
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
                        {p.hrRiseDescriptor && " (HR rise >30 bpm — historical descriptor only)"}
                        {p.elapsedMin !== null && ` (${Math.round(p.elapsedMin)} min standing)`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section>
              <h3 className="text-lg font-semibold">Investigations</h3>
              {investigationsSummary(investigations).length === 0 ? (
                <p className="text-sm text-gray-700">No investigations recorded.</p>
              ) : (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {investigationsSummary(investigations).map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              )}
              <p className="mt-2 whitespace-pre-wrap text-sm">{investigations.testReport || "Test report not provided."}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{investigations.rhythmReport || "Rhythm report not provided."}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">
                {investigations.specialistConclusion || "Specialist conclusion not provided."}
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Differential review</h3>
              {DIFFERENTIAL_ITEMS.length === 0 ? null : (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {DIFFERENTIAL_ITEMS.map((item) => (
                    <li key={item}>
                      {item}: {(differentialReview[item] ?? "not_assessed").replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-2 whitespace-pre-wrap text-sm">{assessment.differentials || "Differentials not provided."}</p>
            </section>

            <section>
              <h3 className="text-lg font-semibold">Clinician impression and plan</h3>
              <p className="whitespace-pre-wrap text-sm">{assessment.plan || "Not provided."}</p>
            </section>

            <section className="border-t border-black pt-4 text-xs text-gray-700">
              <p>
                Source: Ketch T, Biaggioni I, Robertson R, Robertson D. Four faces of baroreflex failure: hypertensive
                crisis, volatile hypertension, orthostatic tachycardia, and malignant vagotonia. Circulation.
                2002;105:2518–2523. doi:10.1161/01.CIR.0000017186.52382.F4
              </p>
              <p className="mt-1">
                Form design, matching rules, diary, differentials and report are implementation additions not validated by
                the source article.
              </p>
            </section>
          </div>
        </TabsContent>

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
                <span className="font-medium">Article:</span> Four faces of baroreflex failure: hypertensive crisis,
                volatile hypertension, orthostatic tachycardia, and malignant vagotonia.
              </p>
              <p>
                <span className="font-medium">Authors:</span> Terry Ketch, Italo Biaggioni, RoseMarie Robertson, David
                Robertson.
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
                  <li>This mini-app is built from supplied 2002 article text with later labelled context.</li>
                  <li>Pattern matches are descriptive, not diagnostic.</li>
                  <li>No validated score, probability, or automated treatment recommendation is provided.</li>
                  <li>Full-text review and clinician validation are required before release.</li>
                  <li>Always prioritise urgent clinical assessment over interpretation output.</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Educational mechanism</p>
                <p className="text-muted-foreground">
                  Damage to baroreceptor afferents or central connections reduces buffering of blood pressure and heart rate.
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                  <li>Carotid sinus stretch → CN IX → nucleus tractus solitarii.</li>
                  <li>Aortic and cardiopulmonary afferents → CN X.</li>
                  <li>Medullary circuits integrate baroreceptor and cortical inputs.</li>
                  <li>Loss of afferent buffering differs from generalized autonomic failure.</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">The four phenotypes</p>
                {PHENOTYPES.map((p) => (
                  <div key={p.id} className="mt-1">
                    <p className="font-medium text-foreground">{p.title}</p>
                    <p className="text-muted-foreground">{p.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
