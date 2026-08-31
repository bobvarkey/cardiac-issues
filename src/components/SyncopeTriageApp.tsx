import React, { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  HeartPulse,
  Printer,
  ThermometerSun,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ECGRuleEngine } from "@/components/ECGRuleEngine";
import {
  QUESTIONNAIRE_SECTIONS,
  getFollowUpBranch,
  getSectionLabel,
  type QuestionnaireSection,
} from "@/lib/syncope-triage-logic";
import ecgSyncopeSyndromes from "@/assets/ecg-syncope-syndromes.jpeg.asset.json";
import longQtMorphology from "@/assets/long-qt-morphology.png.asset.json";
import wellensSyndromeEcg from "@/assets/wellens-syndrome-ecg.png.asset.json";
import wobblerEcgSyncope from "@/assets/wobbler-ecg-syncope.png.asset.json";

type Input = {
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

const patternGallery = [
  {
    id: "long-qt",
    label: "Long QT / torsades",
    caption: "QT prolongation with polymorphic VT risk and torsades potential.",
    src: longQtMorphology.url,
  },
  {
    id: "wellens",
    label: "Wellens syndrome",
    caption: "Biphasic or deeply inverted T waves in V2-V3 suggesting critical LAD stenosis.",
    src: wellensSyndromeEcg.url,
  },
  {
    id: "brugada",
    label: "Brugada pattern",
    caption: "Coved ST elevation in V1-V3 with high risk of ventricular arrhythmias.",
    src: ecgSyncopeSyndromes.url,
  },
  {
    id: "wobbler",
    label: "WOBBLER mnemonic",
    caption: "Systematic syncope ECG review covering WPW, AV block, Brugada, and repolarisation abnormalities.",
    src: wobblerEcgSyncope.url,
  },
] as const;

const initial: Input = {
  trueSyncope: true,
  ecg: {
    abnormal: false,
    ischemia: false,
    bradycardia: false,
    tachycardia: false,
    qtProlonged: false,
    preexcitation: false,
    brugadaPattern: false,
    afib: false,
    avBlock: false,
  },
  redFlags: {
    exertional: false,
    familyHistorySuddenDeath: false,
    structuralHeartDisease: false,
    palpitationsBeforeSyncope: false,
    syncopeSupine: false,
    chestPain: false,
    dyspnea: false,
  },
  orthostatic: {
    supineSBP: 120,
    standingSBP: 118,
    supineDBP: 80,
    standingDBP: 78,
  },
  trigger: {
    pain: false,
    emotion: false,
    prolongedStanding: false,
    heatExposure: false,
    nauseaSweating: false,
    postMicturition: false,
  },
};

function get(obj: Record<string, any>, path: string): boolean {
  const [g, k] = path.split(".");
  return obj[g]?.[k] ?? false;
}

export function SyncopeTriageApp() {
  const [i, setI] = useState<Input>(initial);
  const [activeSection, setActiveSection] = useState<QuestionnaireSection>("presentation");
  const [selectedPattern, setSelectedPattern] = useState<number>(0);

  const triage = useMemo(() => getFollowUpBranch(i), [i]);
  const visibleSections = triage.visibleSections;

  const tone =
    triage.branch === "cardiac"
      ? "border-rose-200 bg-rose-50/80 text-rose-700"
      : triage.branch === "orthostatic"
        ? "border-amber-200 bg-amber-50/80 text-amber-700"
        : triage.branch === "vasovagal"
          ? "border-emerald-200 bg-emerald-50/80 text-emerald-700"
          : triage.branch === "not_syncope"
            ? "border-slate-200 bg-slate-100/80 text-slate-700"
            : "border-slate-200 bg-slate-50/80 text-slate-700";

  const set = (path: string, v: boolean) =>
    setI((p) => {
      const n = structuredClone(p) as Input;
      const [g, k] = path.split(".");
      (n as any)[g][k] = v;
      return n;
    });

  const setNum = (k: keyof Input["orthostatic"], v: number) =>
    setI((p) => ({ ...p, orthostatic: { ...p.orthostatic, [k]: v } }));

  const scrollToSection = (section: QuestionnaireSection) => {
    setActiveSection(section);
    const node = document.getElementById(section);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const copy = async () => {
    const txt = `Syncope: ${triage.branch}\nReason: ${triage.reason}\nAdvice:\n- ${triage.advice.join("\n- ")}`;
    await navigator.clipboard.writeText(txt);
  };

  const selectedPatternMeta = patternGallery[selectedPattern] ?? patternGallery[0];

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-lg md:p-8">
        <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-slate-200">
          SYNCOPE TRIAGE
        </div>
        <h1 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
          Fast triage for true syncope
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-300">
          Use this at the bedside to screen for cardiac risk, orthostatic hypotension, and vasovagal
          features in a few taps.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Questionnaire flow
            </div>
            <div className="space-y-2">
              {QUESTIONNAIRE_SECTIONS.map((section) => {
                const visible = visibleSections.includes(section);
                const isActive = activeSection === section;
                if (!visible) return null;
                return (
                  <button
                    key={section}
                    type="button"
                    onClick={() => scrollToSection(section)}
                    className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition ${
                      isActive
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border/50 bg-background/60 text-foreground hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <span>{getSectionLabel(section)}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <div className="space-y-5">
          {visibleSections.includes("presentation") && (
            <section id="presentation" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Step 1
                    </p>
                    <h2 className="text-xl font-bold">Presentation</h2>
                  </div>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${tone}`}>
                  {triage.branch}
                </span>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
                  <label className="flex items-start gap-3 rounded-lg border border-border/50 bg-background/60 p-3 text-left text-base">
                    <input
                      type="checkbox"
                      checked={i.trueSyncope}
                      onChange={(e) => setI((p) => ({ ...p, trueSyncope: e.target.checked }))}
                      className="mt-1 h-4 w-4 rounded border-slate-300"
                    />
                    <span>
                      <span className="block font-semibold">True syncope with spontaneous recovery</span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        Complete loss of consciousness followed by rapid, full recovery.
                      </span>
                    </span>
                  </label>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Cardiac red flags
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {[
                        ["redFlags.exertional", "Exertional syncope"],
                        ["redFlags.familyHistorySuddenDeath", "Family history sudden death"],
                        ["redFlags.structuralHeartDisease", "Known structural heart disease"],
                        ["redFlags.palpitationsBeforeSyncope", "Palpitations before syncope"],
                        ["redFlags.syncopeSupine", "Syncope while supine"],
                        ["redFlags.chestPain", "Chest pain"],
                        ["redFlags.dyspnea", "Dyspnea"],
                      ].map(([k, l]) => (
                        <label key={k} className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/40 p-2 text-sm">
                          <input
                            type="checkbox"
                            checked={get(i, k)}
                            onChange={(e) => set(k, e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300"
                          />
                          <span>{l}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    Clinical prompt
                  </div>
                  <p className="text-sm leading-6 text-foreground/80">
                    {triage.reason}
                  </p>
                  <div className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Next branch: {getSectionLabel(visibleSections[visibleSections.length - 1] ?? "summary")}
                  </div>
                </div>
              </div>
            </section>
          )}

          {visibleSections.includes("cardiac-risk") && (
            <section id="cardiac-risk" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Step 2
                  </p>
                  <h2 className="text-xl font-bold">Cardiac risk</h2>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ["ecg.abnormal", "Abnormal ECG"],
                  ["ecg.ischemia", "Ischemic changes"],
                  ["ecg.bradycardia", "Bradycardia"],
                  ["ecg.tachycardia", "Tachycardia"],
                  ["ecg.qtProlonged", "QT prolongation"],
                  ["ecg.preexcitation", "Pre-excitation / delta wave"],
                  ["ecg.brugadaPattern", "Brugada pattern"],
                  ["ecg.afib", "Atrial fibrillation"],
                  ["ecg.avBlock", "AV block"],
                ].map(([k, l]) => (
                  <label key={k} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-3 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={get(i, k)}
                      onChange={(e) => set(k, e.target.checked)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span>{l}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {visibleSections.includes("ecg-patterns") && (
            <section id="ecg-patterns" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Step 3
                  </p>
                  <h2 className="text-xl font-bold">ECG patterns</h2>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
                <div className="grid gap-2">
                  {patternGallery.map((pattern, index) => (
                    <button
                      key={pattern.id}
                      type="button"
                      onClick={() => setSelectedPattern(index)}
                      className={`flex items-center gap-3 rounded-xl border p-2 text-left transition ${
                        selectedPattern === index
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background/50 hover:border-border/80"
                      }`}
                    >
                      <img
                        src={pattern.src}
                        alt={pattern.label}
                        className="h-16 w-20 rounded-lg object-cover"
                      />
                      <span className="text-sm font-medium">{pattern.label}</span>
                    </button>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-background/50 p-3">
                  <img
                    src={selectedPatternMeta.src}
                    alt={selectedPatternMeta.label}
                    className="h-[280px] w-full rounded-xl object-cover md:h-[340px]"
                  />
                  <div className="mt-3">
                    <div className="text-lg font-semibold">{selectedPatternMeta.label}</div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {selectedPatternMeta.caption}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {visibleSections.includes("orthostatic") && (
            <section id="orthostatic" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Step 4
                  </p>
                  <h2 className="text-xl font-bold">Orthostatic BP</h2>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["supineSBP", "Supine SBP"],
                  ["standingSBP", "Standing SBP"],
                  ["supineDBP", "Supine DBP"],
                  ["standingDBP", "Standing DBP"],
                ].map(([k, l]) => (
                  <div key={k} className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">{l}</label>
                    <input
                      type="number"
                      value={i.orthostatic[k as keyof Input["orthostatic"]]}
                      onChange={(e) =>
                        setNum(k as keyof Input["orthostatic"], Number.parseInt(e.target.value) || 0)
                      }
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-base"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {visibleSections.includes("triggers") && (
            <section id="triggers" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                  <ThermometerSun className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Step 5
                  </p>
                  <h2 className="text-xl font-bold">Triggers / prodrome</h2>
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {[
                  ["trigger.pain", "Pain"],
                  ["trigger.emotion", "Emotion / fear"],
                  ["trigger.prolongedStanding", "Prolonged standing"],
                  ["trigger.heatExposure", "Heat exposure"],
                  ["trigger.nauseaSweating", "Nausea / sweating"],
                  ["trigger.postMicturition", "Post-micturition"],
                ].map(([k, l]) => (
                  <label key={k} className="flex items-center gap-3 rounded-xl border border-border/60 bg-background/50 p-3 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={get(i, k)}
                      onChange={(e) => set(k, e.target.checked)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span>{l}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {visibleSections.includes("summary") && (
            <section id="summary" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-foreground">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Summary
                  </p>
                  <h2 className="text-xl font-bold">Disposition</h2>
                </div>
              </div>

              <div className={`rounded-3xl border p-5 shadow-md ${tone}`}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em]">Recommendation</div>
                <div className="mt-2 text-3xl font-black capitalize">{triage.branch.replace("_", " ")}</div>
                <div className="mt-3 text-base leading-7">{triage.reason}</div>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-7">
                  {triage.advice.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    onClick={copy}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <Download className="h-4 w-4" />
                    Copy summary
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      <ECGRuleEngine />
    </div>
  );
}
