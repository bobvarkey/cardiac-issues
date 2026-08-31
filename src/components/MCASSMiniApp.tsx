import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  HeartPulse,
  Info,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Waves,
} from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  calculateMcass,
  type McassInputs,
  type McassPotsScreen,
  type McassQualityFlag,
} from "@/lib/mcass-autonomic";

const qualityOptions: { value: McassQualityFlag; label: string; description: string }[] = [
  { value: "non-sinus-rhythm", label: "Non-sinus rhythm", description: "HRV and HR-derived indices may be confounded." },
  { value: "artifact", label: "Artifact / poor tracing", description: "Signal quality concerns on ECG or BP time series." },
  { value: "medication-confounder", label: "Medication confounder", description: "Beta-blockers, adrenergic agents, antidepressants, etc." },
  { value: "low-bp-signal-quality", label: "Low BP signal quality", description: "Orthostatic BP criteria may be unreliable." },
  { value: "sudoscan-limited", label: "Sudoscan limited", description: "Skin issues, recent sweating changes, or device limitation." },
  { value: "manual-approval-required", label: "Manual approval required", description: "Requires clinician sign-off before final score is locked." },
];

const defaultInputs: McassInputs = {
  age: 52,
  sex: "female",
  hrvSdnn: 62,
  hrvSdsd: 28,
  hrvRmssd: 24,
  hrvNn50: 9,
  hrvPnn50: 12,
  deepBreathingDeltaHr: 12,
  deepBreathingEiRatio: 1.12,
  valsalvaRatio: 1.3,
  thirtyFifteenRatio: 1.05,
  supineSbp: 122,
  standingSbp: 92,
  supineDbp: 76,
  standingDbp: 64,
  maxSbpFall: 30,
  maxDbpFall: 14,
  hrRiseStanding: 22,
  deltaHrDeltaSbp: 0.8,
  sixMinuteStandingHr: 36,
  potsScreen: "not-screened",
  handgripDbpDelta: 10,
  sudoscanComposite: 2,
  clinicianApproved: true,
  qualityFlags: [],
  manualOverride: false,
};

function formatValue(value: number | undefined, suffix = "") {
  if (value === undefined || Number.isNaN(value)) return "—";
  return `${value}${suffix}`;
}

function numberField(
  label: string,
  value: number | undefined,
  onChange: (value: number | undefined) => void,
  props?: { min?: number; max?: number; step?: number; placeholder?: string; suffix?: string },
) {
  return (
    <label className="space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value.trim();
          onChange(raw === "" ? undefined : Number(raw));
        }}
        min={props?.min}
        max={props?.max}
        step={props?.step ?? 0.1}
        placeholder={props?.placeholder}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none transition focus:border-primary"
      />
    </label>
  );
}

export function MCASSMiniApp() {
  const [inputs, setInputs] = useState<McassInputs>(defaultInputs);
  const [copyState, setCopyState] = useState("Copy report");
  const [showApp, setShowApp] = useState(true);

  const result = useMemo(() => calculateMcass(inputs), [inputs]);

  const update = <K extends keyof McassInputs>(key: K, value: McassInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const reportText = [
    "mCASS autonomic assessment",
    `Total score: ${result.total}/10`,
    `Cardiovagal: ${result.cardiovagal}/3 | Adrenergic: ${result.adrenergic}/4 | Sudomotor: ${result.sudomotor}/3`,
    `Severity: ${result.severity} | CAN stage: ${result.canStage}`,
    `Pattern: ${result.pattern}`,
    "",
    "Key findings:",
    `• HRV SDNN ${formatValue(inputs.hrvSdnn, " ms")}; RMSSD ${formatValue(inputs.hrvRmssd, " ms")}`,
    `• Deep breathing ΔHR ${formatValue(inputs.deepBreathingDeltaHr, " bpm")}; E:I ${formatValue(inputs.deepBreathingEiRatio, "")}`,
    `• Valsalva ratio ${formatValue(inputs.valsalvaRatio, "")}; 30:15 ratio ${formatValue(inputs.thirtyFifteenRatio, "")}`,
    `• Orthostatic BP fall: SBP ${formatValue(inputs.maxSbpFall, " mmHg")}; DBP ${formatValue(inputs.maxDbpFall, " mmHg")}`,
    `• Standing HR rise ${formatValue(inputs.hrRiseStanding, " bpm")}; ΔHR/ΔSBP ${formatValue(inputs.deltaHrDeltaSbp, "")}`,
    `• Handgrip DBP Δ ${formatValue(inputs.handgripDbpDelta, " mmHg")}; Sudoscan ${formatValue(inputs.sudoscanComposite, "")}`,
    "",
    result.qualityWarnings.length ? `Warnings: ${result.qualityWarnings.join("; ")}` : "Warnings: None",
  ].join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopyState("Copied");
      setTimeout(() => setCopyState("Copy report"), 1400);
    } catch {
      setCopyState("Copy unavailable");
      setTimeout(() => setCopyState("Copy report"), 1400);
    }
  };

  const toggleQuality = (flag: McassQualityFlag) => {
    setInputs((prev) => {
      const flags = new Set(prev.qualityFlags ?? []);
      if (flags.has(flag)) flags.delete(flag);
      else flags.add(flag);
      return { ...prev, qualityFlags: [...flags] };
    });
  };

  return (
    <Collapsible open={showApp} onOpenChange={setShowApp} className="rounded-3xl border border-border bg-card shadow-sm">
      <CollapsibleTrigger asChild>
        <button type="button" className="w-full rounded-3xl text-left">
          <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between md:p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-500/15 p-2 text-cyan-300">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-primary">Autonomic testing</div>
                <h2 className="text-2xl font-semibold">mCASS Mini App</h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleCopy();
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:bg-accent"
              >
                <Download className="h-4 w-4" />
                {copyState}
              </button>
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">
                {result.severity.toUpperCase()}
              </span>
              {showApp ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-6 p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Cardiovagal", value: result.cardiovagal, max: 3, tone: "text-cyan-300" },
              { label: "Adrenergic", value: result.adrenergic, max: 4, tone: "text-violet-300" },
              { label: "Sudomotor", value: result.sudomotor, max: 3, tone: "text-emerald-300" },
              { label: "Total", value: result.total, max: 10, tone: "text-amber-300" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-background p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</div>
                <div className={`mt-3 text-3xl font-semibold ${item.tone}`}>
                  {item.value}
                  <span className="text-base text-muted-foreground">/{item.max}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
            <div className="space-y-6">
              <section className="space-y-4 rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Intake and safety
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {numberField("Age", inputs.age, (v) => update("age", v ?? 0), { min: 0, max: 120, step: 1 })}
                  <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">Sex</span>
                    <select
                      value={inputs.sex}
                      onChange={(e) => update("sex", e.target.value as "male" | "female")}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(inputs.clinicianApproved)}
                      onChange={(e) => update("clinicianApproved", e.target.checked)}
                    />
                    Clinician-approved score
                  </label>
                  <label className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(inputs.manualOverride)}
                      onChange={(e) => update("manualOverride", e.target.checked)}
                    />
                    Manual override
                  </label>
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Waves className="h-4 w-4 text-cyan-400" />
                  HRV and cardio-vagal testing
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {numberField("SDNN (ms)", inputs.hrvSdnn, (v) => update("hrvSdnn", v), { min: 0, step: 1 })}
                  {numberField("SDSD (ms)", inputs.hrvSdsd, (v) => update("hrvSdsd", v), { min: 0, step: 1 })}
                  {numberField("RMSSD (ms)", inputs.hrvRmssd, (v) => update("hrvRmssd", v), { min: 0, step: 1 })}
                  {numberField("NN50", inputs.hrvNn50, (v) => update("hrvNn50", v), { min: 0, step: 1 })}
                  {numberField("pNN50 (%)", inputs.hrvPnn50, (v) => update("hrvPnn50", v), { min: 0, step: 1 })}
                  {numberField("ΔHR, deep breathing (bpm)", inputs.deepBreathingDeltaHr, (v) => update("deepBreathingDeltaHr", v), { min: 0, step: 1 })}
                  {numberField("E:I ratio", inputs.deepBreathingEiRatio, (v) => update("deepBreathingEiRatio", v), { min: 0, step: 0.01 })}
                  {numberField("Valsalva ratio", inputs.valsalvaRatio, (v) => update("valsalvaRatio", v), { min: 0, step: 0.01 })}
                  {numberField("30:15 ratio", inputs.thirtyFifteenRatio, (v) => update("thirtyFifteenRatio", v), { min: 0, step: 0.01 })}
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Activity className="h-4 w-4 text-violet-400" />
                  Adrenergic and orthostatic testing
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {numberField("Supine SBP", inputs.supineSbp, (v) => update("supineSbp", v), { min: 0, step: 1 })}
                  {numberField("Standing SBP", inputs.standingSbp, (v) => update("standingSbp", v), { min: 0, step: 1 })}
                  {numberField("Supine DBP", inputs.supineDbp, (v) => update("supineDbp", v), { min: 0, step: 1 })}
                  {numberField("Standing DBP", inputs.standingDbp, (v) => update("standingDbp", v), { min: 0, step: 1 })}
                  {numberField("Max SBP fall (mmHg)", inputs.maxSbpFall, (v) => update("maxSbpFall", v), { min: 0, step: 1 })}
                  {numberField("Max DBP fall (mmHg)", inputs.maxDbpFall, (v) => update("maxDbpFall", v), { min: 0, step: 1 })}
                  {numberField("HR rise standing (bpm)", inputs.hrRiseStanding, (v) => update("hrRiseStanding", v), { min: 0, step: 1 })}
                  {numberField("ΔHR/ΔSBP", inputs.deltaHrDeltaSbp, (v) => update("deltaHrDeltaSbp", v), { min: 0, step: 0.01 })}
                  {numberField("6-min standing HR (bpm)", inputs.sixMinuteStandingHr, (v) => update("sixMinuteStandingHr", v), { min: 0, step: 1 })}
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1 text-sm">
                    <span className="text-muted-foreground">POTS screening</span>
                    <select
                      value={inputs.potsScreen ?? "not-screened"}
                      onChange={(e) => update("potsScreen", e.target.value as McassPotsScreen)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary"
                    >
                      <option value="not-screened">Not screened</option>
                      <option value="negative">Negative</option>
                      <option value="borderline">Borderline</option>
                      <option value="positive">Positive</option>
                    </select>
                  </label>
                  {numberField("Handgrip DBP Δ (mmHg)", inputs.handgripDbpDelta, (v) => update("handgripDbpDelta", v), { min: 0, step: 1 })}
                </div>
              </section>

              <section className="space-y-4 rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Brain className="h-4 w-4 text-emerald-400" />
                  Sudoscan and quality checks
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {numberField("Sudoscan composite", inputs.sudoscanComposite, (v) => update("sudoscanComposite", v), { min: 0, max: 3, step: 1 })}
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                    <div className="font-medium text-foreground">Sudoscan reference</div>
                    <div className="mt-1">Generalized lower limit of normal: 60 µS</div>
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {qualityOptions.map((option) => (
                    <label key={option.value} className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={Boolean(inputs.qualityFlags?.includes(option.value))}
                        onChange={() => toggleQuality(option.value)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block font-medium text-foreground">{option.label}</span>
                        <span className="text-muted-foreground">{option.description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-4 rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Stethoscope className="h-4 w-4 text-primary" />
                Clinical interpretation
              </div>

              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">Summary</div>
                <div className="mt-2 text-2xl font-semibold text-foreground">{result.total}/10</div>
                <div className="mt-1 text-sm text-muted-foreground">{result.severity} autonomic dysfunction</div>
                <div className="mt-2 text-sm text-primary">{result.pattern}</div>
              </div>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  CAN stage: <span className="font-medium text-foreground">{result.canStage}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  Manual approval: <span className="font-medium text-foreground">{result.requiresManualApproval ? "Required" : "Complete"}</span>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Info className="h-4 w-4 text-amber-400" />
                  Guardrails
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>• HRV is not interpreted in isolation if rhythm is non-sinus or noisy.</li>
                  <li>• Orthostatic hypotension requires serial SBP/DBP trend review.</li>
                  <li>• POTS is a physiologic screen, not a substitute for definitive CAN staging.</li>
                  <li>• Sudoscan should be interpreted alongside symptoms and formal autonomic testing.</li>
                  <li>• Standard generalized lower limit of normal for Sudoscan is 60 µS.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-background p-3">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  Quality warnings
                </div>
                {result.qualityWarnings.length ? (
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {result.qualityWarnings.map((warning) => (
                      <li key={warning}>• {warning}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No quality red flags currently noted.</p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-background p-3">
                <div className="mb-2 text-sm font-medium text-foreground">Report-ready wording</div>
                <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{reportText}</pre>
              </div>
            </aside>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
