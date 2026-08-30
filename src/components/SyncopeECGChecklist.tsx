import { useState, useMemo } from "react";
import {
  ClipboardCheck,
  AlertTriangle,
  ShieldAlert,
  Activity,
  ChevronDown,
  ChevronUp,
  Info,
  Printer,
  CheckCircle2,
  Zap,
  Trash2,
  GitBranch,
  Images,
  ListChecks,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SyncopeEcgGallery } from "@/components/SyncopeEcgGallery";

import {
  SYNCOPE_ECG_CHECKLIST_DATA,
  calculateChecklistResult
} from "@/lib/syncope-checklist";
import { ECGMeasurements } from "@/lib/syncope-checklist-types";
import { buildChecklistReportHtml } from "@/lib/syncope-checklist-report";

type FollowUp = { id: string; question: string; hint: string };
type FollowUpGroup = { id: string; title: string; reason: string; questions: FollowUp[] };

const SECTIONS = [
  { id: "sec-measurements", label: "ECG measurements", icon: Zap },
  { id: "sec-gallery", label: "Pattern gallery", icon: Images },
  { id: "sec-overrides", label: "Urgent overrides", icon: ShieldAlert },
  { id: "sec-findings", label: "High-risk findings", icon: Activity },
  { id: "sec-followups", label: "Follow-up questions", icon: GitBranch },
  { id: "sec-result", label: "Assessment result", icon: ListChecks },
];

export function SyncopeECGChecklist() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [globalTriggers, setGlobalTriggers] = useState<string[]>([]);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [showChecklist, setShowChecklist] = useState(true);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [measurements, setMeasurements] = useState<ECGMeasurements>({
    qtc: null,
    pr: null,
    qrs: null,
    leadAbnormalities: []
  });
  const [newAbnormality, setNewAbnormality] = useState("");

  const result = useMemo(() =>
    calculateChecklistResult(selectedIds, globalTriggers, measurements),
    [selectedIds, globalTriggers, measurements]
  );

  // Conditional branching: follow-up questions revealed by prior answers
  const followUpGroups = useMemo<FollowUpGroup[]>(() => {
    const groups: FollowUpGroup[] = [];
    const selectedCategories = new Set(
      SYNCOPE_ECG_CHECKLIST_DATA.items
        .filter((i) => selectedIds.includes(i.id))
        .map((i) => i.category)
    );

    if ((measurements.qtc ?? 0) >= 480 || selectedCategories.has("repolarization")) {
      groups.push({
        id: "qt",
        title: "Prolonged repolarisation pathway",
        reason: "Triggered by QTc ≥ 480 ms or a selected repolarisation finding",
        questions: [
          { id: "qt_drugs", question: "Any QT-prolonging drug on the current medication list?", hint: "Antiarrhythmics, macrolides, antipsychotics, antiemetics" },
          { id: "qt_lytes", question: "Potassium, magnesium and calcium checked and corrected?", hint: "Target K⁺ > 4.0 mmol/L, Mg²⁺ > 0.9 mmol/L" },
          { id: "qt_family", question: "Family history of sudden death under 40 years?", hint: "Suggests congenital long QT — refer for genetic evaluation" },
        ],
      });
    }

    if (
      (measurements.pr ?? 0) > 200 ||
      (measurements.qrs ?? 0) > 120 ||
      selectedCategories.has("conduction") ||
      selectedCategories.has("bradyarrhythmia")
    ) {
      groups.push({
        id: "conduction",
        title: "Conduction disease pathway",
        reason: "Triggered by PR > 200 ms, QRS > 120 ms, or a selected conduction finding",
        questions: [
          { id: "cond_exertional", question: "Was the syncope exertional or without prodrome?", hint: "Raises suspicion of intermittent high-grade AV block" },
          { id: "cond_nodal", question: "Any AV-nodal blocking drugs that can be stopped?", hint: "Beta-blockers, verapamil/diltiazem, digoxin" },
          { id: "cond_monitor", question: "Continuous telemetry or ambulatory monitoring arranged?", hint: "Consider implantable loop recorder if intermittent" },
        ],
      });
    }

    if (selectedCategories.has("ischemia")) {
      groups.push({
        id: "ischemia",
        title: "Ischaemia pathway",
        reason: "Triggered by a selected ischaemic ECG pattern",
        questions: [
          { id: "isch_pain", question: "Ongoing or recent chest pain?", hint: "Pain-free interval is typical of Wellens pattern" },
          { id: "isch_trop", question: "Serial troponin sent?", hint: "Normal troponin does not exclude critical LAD stenosis" },
          { id: "isch_stress", question: "Exercise stress testing withheld until specialist review?", hint: "Stress testing is hazardous in Wellens pattern" },
        ],
      });
    }

    if (globalTriggers.length > 0 || result.isUrgent) {
      groups.push({
        id: "escalation",
        title: "Escalation pathway",
        reason: "Triggered by an urgent override",
        questions: [
          { id: "esc_bed", question: "Monitored bed arranged?", hint: "Do not discharge before life-threatening causes are excluded" },
          { id: "esc_cardio", question: "Cardiology or electrophysiology contacted?", hint: "Document name and time of referral" },
          { id: "esc_driving", question: "Driving and occupational advice documented?", hint: "Follow local licensing rules after arrhythmic syncope" },
        ],
      });
    }

    return groups;
  }, [selectedIds, globalTriggers, measurements, result.isUrgent]);

  const toggleItem = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleGlobalTrigger = (trigger: string) => {
    setGlobalTriggers(prev =>
      prev.includes(trigger) ? prev.filter(t => t !== trigger) : [...prev, trigger]
    );
  };

  const toggleItemDetails = (id: string) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFollowUp = (id: string) => {
    setFollowUpAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const reset = () => {
    setSelectedIds([]);
    setGlobalTriggers([]);
    setFollowUpAnswers({});
    setMeasurements({
      qtc: null,
      pr: null,
      qrs: null,
      leadAbnormalities: []
    });
  };

  const addAbnormality = () => {
    if (!newAbnormality.trim()) return;
    setMeasurements(prev => ({
      ...prev,
      leadAbnormalities: [...prev.leadAbnormalities, newAbnormality.trim()]
    }));
    setNewAbnormality("");
  };

  const removeAbnormality = (index: number) => {
    setMeasurements(prev => ({
      ...prev,
      leadAbnormalities: prev.leadAbnormalities.filter((_, i) => i !== index)
    }));
  };

  const exportReport = () => {
    const html = buildChecklistReportHtml(selectedIds, globalTriggers, result);
    const win = window.open("", "_blank", "width=900,height=1000");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 350);
  };

  const jumpTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const fieldLabel =
    "text-[11px] lg:text-xs font-bold uppercase tracking-wide text-muted-foreground";

  return (
    <Card className="border-border/40 shadow-lg">
      <Collapsible open={showChecklist} onOpenChange={setShowChecklist}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg lg:text-xl flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <ClipboardCheck className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-bold">{SYNCOPE_ECG_CHECKLIST_DATA.toolName}</div>
                    <div className="text-xs lg:text-sm font-normal text-muted-foreground mt-0.5">
                      v{SYNCOPE_ECG_CHECKLIST_DATA.version} • Clinical Decision Support
                    </div>
                  </div>
                </span>
                {showChecklist ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="lg:px-8 lg:pb-8">
            <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
              {/* Desktop stepper navigation */}
              <nav
                aria-label="Checklist sections"
                className="hidden lg:block lg:sticky lg:top-20 lg:self-start"
              >
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                  Sections
                </div>
                <ol className="space-y-1">
                  {SECTIONS.map((section, idx) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <li key={section.id}>
                        <button
                          type="button"
                          onClick={() => jumpTo(section.id)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                              isActive ? "border-primary text-primary" : "border-border"
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate text-left">{section.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </nav>

              <div className="min-w-0 space-y-8 lg:space-y-10">
                <div className="text-sm lg:text-base leading-relaxed text-muted-foreground bg-muted/30 p-3 lg:p-4 rounded-lg border border-border/50">
                  <div className="flex gap-2 items-start">
                    <Info className="w-4 h-4 mt-1 shrink-0" />
                    <p>{SYNCOPE_ECG_CHECKLIST_DATA.purpose}</p>
                  </div>
                </div>

                {/* ECG Measurements Input Form */}
                <section
                  id="sec-measurements"
                  className="scroll-mt-24 space-y-5 p-4 lg:p-6 rounded-xl bg-primary/5 border border-primary/20"
                >
                  <h3 className="text-sm lg:text-base font-bold flex items-center gap-2 text-primary">
                    <Zap className="w-4 h-4" />
                    ECG MEASUREMENTS &amp; AUTOMATION
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                    <div className="space-y-2">
                      <label htmlFor="qtc-input" className={fieldLabel}>QTc interval (ms)</label>
                      <Input
                        id="qtc-input"
                        type="number"
                        placeholder="e.g. 450"
                        className="h-10 lg:h-11 w-full text-sm lg:text-base"
                        value={measurements.qtc || ""}
                        onChange={(e) => setMeasurements(prev => ({ ...prev, qtc: e.target.value ? parseInt(e.target.value) : null }))}
                      />
                      <div className="text-[11px] leading-relaxed text-muted-foreground">≥480 abnormal · ≥500 high risk</div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="pr-input" className={fieldLabel}>PR interval (ms)</label>
                      <Input
                        id="pr-input"
                        type="number"
                        placeholder="e.g. 160"
                        className="h-10 lg:h-11 w-full text-sm lg:text-base"
                        value={measurements.pr || ""}
                        onChange={(e) => setMeasurements(prev => ({ ...prev, pr: e.target.value ? parseInt(e.target.value) : null }))}
                      />
                      <div className="text-[11px] leading-relaxed text-muted-foreground">{"> "}200 first-degree AV block</div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="qrs-input" className={fieldLabel}>QRS duration (ms)</label>
                      <Input
                        id="qrs-input"
                        type="number"
                        placeholder="e.g. 90"
                        className="h-10 lg:h-11 w-full text-sm lg:text-base"
                        value={measurements.qrs || ""}
                        onChange={(e) => setMeasurements(prev => ({ ...prev, qrs: e.target.value ? parseInt(e.target.value) : null }))}
                      />
                      <div className="text-[11px] leading-relaxed text-muted-foreground">{"> "}120 high conduction risk</div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label htmlFor="abnormality-input" className={fieldLabel}>
                      Lead-specific abnormalities / patterns
                    </label>
                    <div className="flex gap-3">
                      <Input
                        id="abnormality-input"
                        placeholder="e.g. Brugada, Wellens, Delta wave, Epsilon, S1Q3T3…"
                        className="h-10 lg:h-11 w-full text-sm lg:text-base"
                        value={newAbnormality}
                        onChange={(e) => setNewAbnormality(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addAbnormality()}
                      />
                      <button
                        onClick={addAbnormality}
                        className="h-10 lg:h-11 shrink-0 px-5 bg-primary text-primary-foreground rounded-md text-xs lg:text-sm font-bold hover:bg-primary/90 transition-colors"
                      >
                        ADD
                      </button>
                    </div>

                    {measurements.leadAbnormalities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {measurements.leadAbnormalities.map((item, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="pl-2.5 pr-1.5 py-1 flex items-center gap-1 border-primary/30 bg-primary/10 text-primary"
                          >
                            <span className="text-[11px] font-bold">{item}</span>
                            <button
                              onClick={() => removeAbnormality(idx)}
                              className="p-0.5 hover:text-destructive transition-colors"
                              aria-label={`Remove ${item}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Keywords like “Wellens”, “Brugada”, “Delta” or “ARVC” trigger specific checklist items.
                    </p>
                  </div>
                </section>

                {/* Pattern gallery */}
                <section id="sec-gallery" className="scroll-mt-24">
                  <SyncopeEcgGallery />
                </section>

                {/* Global Urgent Triggers */}
                <section id="sec-overrides" className="scroll-mt-24 space-y-4">
                  <h3 className="text-sm lg:text-base font-bold flex items-center gap-2 text-destructive">
                    <ShieldAlert className="w-4 h-4" />
                    GLOBAL URGENT OVERRIDES
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {SYNCOPE_ECG_CHECKLIST_DATA.globalUrgentOverride.triggers.map((trigger, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                          globalTriggers.includes(trigger)
                            ? 'bg-destructive/10 border-destructive/40'
                            : 'bg-muted/20 border-border/50 hover:bg-muted/40'
                        }`}
                        onClick={() => toggleGlobalTrigger(trigger)}
                      >
                        <Checkbox
                          checked={globalTriggers.includes(trigger)}
                          className="mt-0.5"
                        />
                        <span className="text-xs lg:text-sm font-medium leading-relaxed">{trigger}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Checklist Items */}
                <section id="sec-findings" className="scroll-mt-24 space-y-4">
                  <h3 className="text-sm lg:text-base font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    ECG HIGH-RISK FINDINGS
                  </h3>

                  <div className="space-y-3">
                    {SYNCOPE_ECG_CHECKLIST_DATA.items.map((item) => (
                      <div
                        key={item.id}
                        className={`border rounded-lg overflow-hidden transition-all ${
                          selectedIds.includes(item.id)
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-border/50 bg-background hover:border-border'
                        }`}
                      >
                        <div className="p-3 lg:p-4 flex items-start gap-3">
                          <Checkbox
                            id={item.id}
                            checked={selectedIds.includes(item.id)}
                            onCheckedChange={() => toggleItem(item.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center justify-between gap-3">
                              <label
                                htmlFor={item.id}
                                className="text-sm lg:text-base font-bold cursor-pointer hover:text-primary transition-colors"
                              >
                                {item.label}
                              </label>
                              <div className="flex shrink-0 items-center gap-2">
                                {item.urgentOverride && (
                                  <Badge variant="destructive" className="text-[10px] h-5">URGENT</Badge>
                                )}
                                <Badge variant="secondary" className="text-[10px] h-5">+{item.score} pts</Badge>
                                <button
                                  onClick={() => toggleItemDetails(item.id)}
                                  className="text-muted-foreground hover:text-foreground"
                                  aria-label={openItems[item.id] ? "Hide details" : "Show details"}
                                >
                                  {openItems[item.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                            <div className="text-[10px] lg:text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                              {item.category.replace('_', ' ')}
                            </div>
                          </div>
                        </div>

                        {openItems[item.id] && (
                          <div className="px-3 lg:px-4 pb-4 pt-2 border-t border-border/30 bg-muted/10 space-y-3">
                            <div>
                              <div className="text-[10px] lg:text-[11px] font-bold text-muted-foreground mb-1.5">CRITERIA:</div>
                              <ul className="text-xs lg:text-sm leading-relaxed space-y-1.5 text-foreground/80">
                                {item.criteria.map((c, i) => (
                                  <li key={i} className="flex gap-2">
                                    <span className="text-primary">•</span>
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {(item.urgentOverrideConditions || item.urgentOverrideCondition) && (
                              <div className="bg-destructive/5 p-3 rounded-lg border border-destructive/20">
                                <div className="text-[10px] lg:text-[11px] font-bold text-destructive mb-1 uppercase tracking-tight">Urgent conditions:</div>
                                <div className="text-xs lg:text-sm leading-relaxed text-destructive/90">
                                  {item.urgentOverrideCondition || item.urgentOverrideConditions?.join(', ')}
                                </div>
                              </div>
                            )}

                            <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                              <div className="text-[10px] lg:text-[11px] font-bold text-primary mb-1 uppercase tracking-tight">Clinical action:</div>
                              <div className="text-xs lg:text-sm leading-relaxed text-foreground/90">{item.action}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Conditional follow-up questions */}
                <section id="sec-followups" className="scroll-mt-24 space-y-4">
                  <h3 className="text-sm lg:text-base font-bold flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-primary" />
                    CONDITIONAL FOLLOW-UP QUESTIONS
                  </h3>

                  {followUpGroups.length === 0 ? (
                    <p className="text-xs lg:text-sm leading-relaxed text-muted-foreground rounded-lg border border-dashed border-border/60 p-4">
                      Follow-up questions appear automatically once measurements or findings are entered above.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {followUpGroups.map((group) => (
                        <div key={group.id} className="rounded-xl border border-border/60 bg-muted/20 p-4 lg:p-5 space-y-3">
                          <div>
                            <div className="text-sm lg:text-base font-bold">{group.title}</div>
                            <div className="text-[11px] lg:text-xs text-muted-foreground mt-0.5">{group.reason}</div>
                          </div>
                          <div className="space-y-2.5">
                            {group.questions.map((q) => (
                              <div
                                key={q.id}
                                onClick={() => toggleFollowUp(q.id)}
                                className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                                  followUpAnswers[q.id]
                                    ? "border-primary/40 bg-primary/5"
                                    : "border-border/50 bg-background hover:border-border"
                                }`}
                              >
                                <Checkbox checked={!!followUpAnswers[q.id]} className="mt-0.5" />
                                <div className="min-w-0">
                                  <div className="text-xs lg:text-sm font-semibold leading-relaxed">{q.question}</div>
                                  <div className="text-[11px] lg:text-xs text-muted-foreground leading-relaxed mt-0.5">{q.hint}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Results Section */}
                <section id="sec-result" className="scroll-mt-24 pt-6 border-t border-border/40">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h3 className="text-sm lg:text-base font-bold">ASSESSMENT RESULT</h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={exportReport}
                        className="flex items-center gap-2 text-xs lg:text-sm font-semibold px-3.5 py-2 rounded-md border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Printer className="w-4 h-4" />
                        Export / Print
                      </button>
                      <button
                        onClick={reset}
                        className="text-[11px] lg:text-xs font-medium text-muted-foreground hover:text-destructive underline decoration-dotted"
                      >
                        Clear checklist
                      </button>
                    </div>
                  </div>

                  <div className={`p-5 lg:p-6 rounded-xl border-2 transition-all ${
                    result.isUrgent
                      ? 'bg-destructive/10 border-destructive/50 shadow-destructive/5'
                      : result.score >= 3
                        ? 'bg-orange-500/10 border-orange-500/50 shadow-orange-500/5'
                        : result.score > 0
                          ? 'bg-yellow-500/10 border-yellow-500/50 shadow-yellow-500/5'
                          : 'bg-muted/30 border-border/50'
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex flex-col items-center justify-center p-4 bg-background rounded-full border-4 border-current aspect-square min-w-[100px] h-[100px]">
                        <span className="text-3xl font-black">{result.score}</span>
                        <span className="text-[10px] font-bold text-muted-foreground">POINTS</span>
                      </div>

                      <div className="flex-1 space-y-2.5">
                        <div className="flex items-center gap-2">
                          {result.isUrgent ? (
                            <ShieldAlert className="w-5 h-5 text-destructive" />
                          ) : result.score >= 3 ? (
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                          ) : (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          )}
                          <h4 className="text-lg lg:text-xl font-black tracking-tight uppercase">
                            {result.isUrgent ? "URGENT CLINICAL ACTION REQUIRED" : result.label}
                          </h4>
                        </div>

                        {result.isUrgent && (
                          <div className="flex flex-wrap gap-1.5 my-2">
                            {result.triggeredOverrides.map((t, idx) => (
                              <Badge key={idx} variant="destructive" className="text-[9px] uppercase font-bold py-0 h-4">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <Alert className={`border-none p-0 bg-transparent ${result.isUrgent ? 'text-destructive-foreground' : ''}`}>
                          <AlertDescription className="text-sm lg:text-base font-medium leading-relaxed">
                            {result.isUrgent
                              ? "IMMEDIATE monitored cardiac assessment and cardiology review required. Do not discharge until acute life-threatening causes are excluded."
                              : result.action}
                          </AlertDescription>
                        </Alert>
                      </div>
                    </div>
                  </section>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
