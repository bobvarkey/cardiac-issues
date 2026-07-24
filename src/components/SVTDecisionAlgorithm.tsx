import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Heart,
  Info,
  Stethoscope,
  Zap,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types */
/* -------------------------------------------------------------------------- */

type Stability = "stable" | "unstable" | null;
type NarrowQrs = "narrow" | "wide" | null;
type Regularity = "regular" | "irregular" | null;
type SvpSuspected = "avnrt_avrt" | "atrial_flutter" | "atrial_tachy" | "wpw" | "unknown" | null;
type Contraindication =
  | "none"
  | "asthma_copd"
  | "heart_transplant"
  | "av_block_2_3"
  | "sick_sinus"
  | "wpw_pre_excited_af"
  | "hypotension_shock"
  | "poison_od";

interface DecisionState {
  stability: Stability;
  narrowQrs: NarrowQrs;
  regularity: Regularity;
  svpSuspected: SvpSuspected;
  contraindications: Contraindication[];
  vagalDone: boolean;
  adenosineGiven: boolean;
  adenosineDose: "6mg" | "12mg" | null;
  adenosineResponse: "converted" | "no_response" | "transient" | null;
  avBlockersGiven: boolean;
  cardioversionDone: boolean;
}

/* -------------------------------------------------------------------------- */
/* Contraindication definitions */
/* -------------------------------------------------------------------------- */

const CONTRA_ITEMS: { value: Contraindication; label: string; severity: "absolute" | "relative" }[] = [
  { value: "asthma_copd", label: "Severe reactive airway disease (asthma/COPD)", severity: "relative" },
  { value: "heart_transplant", label: "Heart transplant (denervated — extreme sensitivity)", severity: "absolute" },
  { value: "av_block_2_3", label: "2nd/3rd degree AV block without pacemaker", severity: "absolute" },
  { value: "sick_sinus", label: "Sick sinus syndrome without pacemaker", severity: "absolute" },
  { value: "wpw_pre_excited_af", label: "Pre-excited AF / WPW with wide QRS", severity: "absolute" },
  { value: "hypotension_shock", label: "Hypotension / shock (unstable — cardiovert first)", severity: "absolute" },
  { value: "poison_od", label: "Poisoning / overdose (e.g. digoxin, TCA)", severity: "relative" },
];

/* -------------------------------------------------------------------------- */
/* Sub-components */
/* -------------------------------------------------------------------------- */

function StepCard({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 shadow-sm ${className}`}>
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-500/15 text-rose-400">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  label,
  variant = "default",
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  variant?: "default" | "danger" | "success" | "warning";
}) {
  const colors = {
    default: "border-border hover:border-primary/40 text-foreground",
    danger: "border-red-500/40 hover:border-red-500 text-red-400",
    success: "border-emerald-500/40 hover:border-emerald-500 text-emerald-400",
    warning: "border-amber-500/40 hover:border-amber-500 text-amber-400",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
        selected
          ? "border-rose-500 bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/30"
          : colors[variant]
      }`}
    >
      {label}
    </button>
  );
}

function InfoBox({
  icon: Icon,
  children,
  variant = "info",
}: {
  icon?: React.ElementType;
  children: React.ReactNode;
  variant?: "info" | "warning" | "success" | "danger";
}) {
  const colors = {
    info: "border-primary/20 bg-primary/5 text-foreground",
    warning: "border-amber-500/30 bg-amber-500/5 text-amber-300",
    success: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300",
    danger: "border-red-500/30 bg-red-500/5 text-red-300",
  };
  return (
    <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${colors[variant]}`}>
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0" />}
      <div>{children}</div>
    </div>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full transition-all ${
            i < current
              ? "bg-rose-500"
              : i === current
                ? "bg-rose-500/50 ring-1 ring-rose-500/50"
                : "bg-surface"
          }`}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Component */
/* -------------------------------------------------------------------------- */

export function SVTDecisionAlgorithm() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<DecisionState>({
    stability: null,
    narrowQrs: null,
    regularity: null,
    svpSuspected: null,
    contraindications: [],
    vagalDone: false,
    adenosineGiven: false,
    adenosineDose: null,
    adenosineResponse: null,
    avBlockersGiven: false,
    cardioversionDone: false,
  });
  const [showSummary, setShowSummary] = useState(false);

  const update = (patch: Partial<DecisionState>) => {
    setState((s) => ({ ...s, ...patch }));
  };

  const toggleContra = (c: Contraindication) => {
    setState((s) => ({
      ...s,
      contraindications: s.contraindications.includes(c)
        ? s.contraindications.filter((x) => x !== c)
        : [...s.contraindications, c],
    }));
  };

  const hasAbsoluteContra = state.contraindications.some(
    (c) => CONTRA_ITEMS.find((i) => i.value === c)?.severity === "absolute",
  );

  const reset = () => {
    setStep(0);
    setState({
      stability: null,
      narrowQrs: null,
      regularity: null,
      svpSuspected: null,
      contraindications: [],
      vagalDone: false,
      adenosineGiven: false,
      adenosineDose: null,
      adenosineResponse: null,
      avBlockersGiven: false,
      cardioversionDone: false,
    });
    setShowSummary(false);
  };

  /* ------------------------------------------------------------------------ */
  /* Step renderers */
  /* ------------------------------------------------------------------------ */

  function renderStep0() {
    return (
      <StepCard title="Step 1: Assess Stability" icon={Heart}>
        <p className="mb-4 text-sm text-muted-foreground">
          Is the patient hemodynamically stable? Unstable = hypotension (SBP &lt;90), altered mental
          status, ischemic chest pain, pulmonary edema, or shock.
        </p>
        <div className="flex gap-3">
          <OptionButton
            selected={state.stability === "stable"}
            onClick={() => {
              update({ stability: "stable" });
              setStep(1);
            }}
            label="✅ Stable"
            variant="success"
          />
          <OptionButton
            selected={state.stability === "unstable"}
            onClick={() => {
              update({ stability: "unstable" });
              setStep(6); // jump to cardioversion
            }}
            label="⚠️ Unstable"
            variant="danger"
          />
        </div>
      </StepCard>
    );
  }

  function renderStep1() {
    return (
      <StepCard title="Step 2: QRS Width" icon={Activity}>
        <p className="mb-4 text-sm text-muted-foreground">
          Is the QRS narrow (&lt;120 ms) or wide (≥120 ms)?
        </p>
        <div className="flex gap-3">
          <OptionButton
            selected={state.narrowQrs === "narrow"}
            onClick={() => {
              update({ narrowQrs: "narrow" });
              setStep(2);
            }}
            label="Narrow QRS (&lt;120 ms)"
            variant="success"
          />
          <OptionButton
            selected={state.narrowQrs === "wide"}
            onClick={() => {
              update({ narrowQrs: "wide" });
              setStep(7); // wide complex
            }}
            label="Wide QRS (≥120 ms)"
            variant="warning"
          />
        </div>
        {state.narrowQrs === "wide" && (
          <InfoBox variant="warning" icon={AlertTriangle}>
            Wide-complex tachycardia — consider VT, SVT with aberrancy, or pre-excited AF. This
            algorithm focuses on SVT. If VT suspected, treat per VT protocol.
          </InfoBox>
        )}
      </StepCard>
    );
  }

  function renderStep2() {
    return (
      <StepCard title="Step 3: Regularity" icon={Activity}>
        <p className="mb-4 text-sm text-muted-foreground">
          Is the rhythm regular or irregular?
        </p>
        <div className="flex gap-3">
          <OptionButton
            selected={state.regularity === "regular"}
            onClick={() => {
              update({ regularity: "regular" });
              setStep(3);
            }}
            label="Regular"
            variant="success"
          />
          <OptionButton
            selected={state.regularity === "irregular"}
            onClick={() => {
              update({ regularity: "irregular" });
              setStep(8); // irregular narrow
            }}
            label="Irregular"
            variant="warning"
          />
        </div>
      </StepCard>
    );
  }

  function renderStep3() {
    return (
      <StepCard title="Step 4: Suspected SVT Type" icon={Stethoscope}>
        <p className="mb-4 text-sm text-muted-foreground">
          Based on the ECG, what type of SVT is suspected?
        </p>
        <div className="flex flex-wrap gap-2">
          <OptionButton
            selected={state.svpSuspected === "avnrt_avrt"}
            onClick={() => update({ svpSuspected: "avnrt_avrt" })}
            label="AVNRT / AVRT (typical SVT)"
          />
          <OptionButton
            selected={state.svpSuspected === "atrial_flutter"}
            onClick={() => update({ svpSuspected: "atrial_flutter" })}
            label="Atrial Flutter"
          />
          <OptionButton
            selected={state.svpSuspected === "atrial_tachy"}
            onClick={() => update({ svpSuspected: "atrial_tachy" })}
            label="Atrial Tachycardia"
          />
          <OptionButton
            selected={state.svpSuspected === "wpw"}
            onClick={() => update({ svpSuspected: "wpw" })}
            label="WPW / Pre-excitation"
          />
          <OptionButton
            selected={state.svpSuspected === "unknown"}
            onClick={() => update({ svpSuspected: "unknown" })}
            label="Uncertain"
          />
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setStep(4)}
            disabled={!state.svpSuspected}
            className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600 disabled:opacity-40"
          >
            Next: Contraindications
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </StepCard>
    );
  }

  function renderStep4() {
    return (
      <StepCard title="Step 5: Check Contraindications" icon={AlertTriangle}>
        <p className="mb-4 text-sm text-muted-foreground">
          Select any contraindications to adenosine or AV nodal blockers that apply:
        </p>
        <div className="space-y-2">
          {CONTRA_ITEMS.map((item) => (
            <label
              key={item.value}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface/60"
            >
              <input
                type="checkbox"
                checked={state.contraindications.includes(item.value)}
                onChange={() => toggleContra(item.value)}
                className="h-4 w-4 accent-rose-500"
              />
              <span className="flex-1">{item.label}</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                  item.severity === "absolute"
                    ? "bg-red-500/15 text-red-400"
                    : "bg-amber-500/15 text-amber-400"
                }`}
              >
                {item.severity}
              </span>
            </label>
          ))}
        </div>

        {hasAbsoluteContra && (
          <InfoBox variant="danger" icon={AlertTriangle}>
            Absolute contraindication(s) selected. Consider synchronized cardioversion or expert
            consult instead of adenosine.
          </InfoBox>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setStep(5)}
            className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            Next: Management
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </StepCard>
    );
  }

  function renderStep5() {
    const showAdeno = !hasAbsoluteContra;
    const showVagal = showAdeno;

    return (
      <StepCard title="Step 6: Management" icon={Zap}>
        {/* Vagal maneuvers */}
        {showVagal && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium">1. Vagal Maneuvers</h3>
            <p className="mb-2 text-xs text-muted-foreground">
              Modified Valsalva (REVERT trial: ~43% success) or carotid sinus massage.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => update({ vagalDone: true })}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  state.vagalDone
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {state.vagalDone ? "✅ Done" : "Mark as attempted"}
              </button>
            </div>
          </div>
        )}

        {/* Adenosine */}
        {showAdeno && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium">2. Adenosine</h3>
            <p className="mb-2 text-xs text-muted-foreground">
              Rapid IV push through proximal line with 20 mL saline flush. Continuous ECG monitoring.
            </p>
            <div className="mb-2 flex gap-2">
              <OptionButton
                selected={state.adenosineDose === "6mg"}
                onClick={() => update({ adenosineDose: "6mg", adenosineGiven: true })}
                label="6 mg (traditional)"
              />
              <OptionButton
                selected={state.adenosineDose === "12mg"}
                onClick={() => update({ adenosineDose: "12mg", adenosineGiven: true })}
                label="12 mg (first-dose strategy)"
              />
            </div>
            {state.adenosineGiven && (
              <div className="mt-2">
                <p className="mb-2 text-xs text-muted-foreground">Response:</p>
                <div className="flex flex-wrap gap-2">
                  <OptionButton
                    selected={state.adenosineResponse === "converted"}
                    onClick={() => update({ adenosineResponse: "converted" })}
                    label="✅ Converted to sinus"
                    variant="success"
                  />
                  <OptionButton
                    selected={state.adenosineResponse === "transient"}
                    onClick={() => update({ adenosineResponse: "transient" })}
                    label="🔄 Transient slowing / recurrence"
                    variant="warning"
                  />
                  <OptionButton
                    selected={state.adenosineResponse === "no_response"}
                    onClick={() => update({ adenosineResponse: "no_response" })}
                    label="❌ No response"
                    variant="danger"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* AV nodal blockers (if adenosine fails or not given) */}
        {state.adenosineResponse === "no_response" && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium">3. AV Nodal Blocker</h3>
            <p className="mb-2 text-xs text-muted-foreground">
              Diltiazem 0.25 mg/kg IV over 2 min, or metoprolol 2.5–5 mg IV. Avoid if
              pre-excitation/WPW suspected.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => update({ avBlockersGiven: true })}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  state.avBlockersGiven
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {state.avBlockersGiven ? "✅ Given" : "Mark as given"}
              </button>
            </div>
          </div>
        )}

        {/* Cardioversion option */}
        {state.adenosineResponse === "no_response" && state.avBlockersGiven && (
          <InfoBox variant="warning" icon={Info}>
            Refractory SVT — consider synchronized cardioversion (50–100 J biphasic) or expert
            consult. Procainamide or ibutilide are alternatives.
          </InfoBox>
        )}

        {state.adenosineResponse === "converted" && (
          <InfoBox variant="success" icon={CheckCircle2}>
            SVT converted to sinus rhythm. Obtain 12-lead ECG, monitor for recurrence, and
            arrange outpatient EP follow-up.
          </InfoBox>
        )}

        {state.adenosineResponse === "transient" && (
          <InfoBox variant="warning" icon={Info}>
            Transient response — consider repeat adenosine (12 mg) or switch to AV nodal blocker.
            Monitor closely for recurrence.
          </InfoBox>
        )}

        {hasAbsoluteContra && (
          <InfoBox variant="danger" icon={AlertTriangle}>
            Absolute contraindication to adenosine. Proceed to synchronized cardioversion (50–100 J
            biphasic) or expert consult.
          </InfoBox>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setShowSummary(true)}
            className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            View Summary
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </StepCard>
    );
  }

  function renderStep6() {
    // Unstable → cardioversion
    return (
      <StepCard title="Unstable Patient — Cardioversion" icon={AlertTriangle}>
        <InfoBox variant="danger" icon={AlertTriangle}>
          <strong>Unstable SVT — proceed immediately to synchronized cardioversion.</strong>
        </InfoBox>
        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-lg border border-border p-3">
            <h3 className="mb-1 font-medium">Synchronized Cardioversion</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Sedate if possible (midazolam + fentanyl or ketamine)</li>
              <li>• Start at <strong>50–100 J</strong> biphasic (synchronized)</li>
              <li>• If no conversion, escalate: 100 J → 150 J → 200 J</li>
              <li>• Have resuscitation equipment ready</li>
              <li>• Obtain 12-lead ECG after conversion</li>
            </ul>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => update({ cardioversionDone: true })}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                state.cardioversionDone
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-border hover:border-primary/40"
              }`}
            >
              {state.cardioversionDone ? "✅ Done" : "Mark as performed"}
            </button>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setShowSummary(true)}
            className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            View Summary
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </StepCard>
    );
  }

  function renderStep7() {
    // Wide complex
    return (
      <StepCard title="Wide-Complex Tachycardia" icon={AlertTriangle}>
        <InfoBox variant="warning" icon={AlertTriangle}>
          <strong>Wide-complex tachycardia (QRS ≥120 ms).</strong> This algorithm is for SVT. If
          VT is suspected, treat per VT protocol. Consider:
        </InfoBox>
        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex gap-2">
            <span className="text-rose-400">•</span>
            <span><strong>SVT with aberrancy</strong> — if pre-existing BBB or rate-dependent aberrancy</span>
          </li>
          <li className="flex gap-2">
            <span className="text-rose-400">•</span>
            <span><strong>Pre-excited AF / WPW</strong> — avoid AV nodal blockers; use procainamide or ibutilide</span>
          </li>
          <li className="flex gap-2">
            <span className="text-rose-400">•</span>
            <span><strong>Ventricular tachycardia</strong> — treat per ACLS VT protocol</span>
          </li>
        </ul>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setShowSummary(true)}
            className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            View Summary
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </StepCard>
    );
  }

  function renderStep8() {
    // Irregular narrow complex
    return (
      <StepCard title="Irregular Narrow-Complex Tachycardia" icon={Activity}>
        <InfoBox variant="info" icon={Info}>
          Irregular narrow-complex tachycardia — most likely <strong>atrial fibrillation</strong> or{" "}
          <strong>atrial flutter with variable conduction</strong>.
        </InfoBox>
        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-lg border border-border p-3">
            <h3 className="mb-1 font-medium">Management</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Rate control: diltiazem or metoprolol IV</li>
              <li>• If &lt;48 h from onset: consider chemical or electrical cardioversion</li>
              <li>• If &gt;48 h or unknown: rate control + anticoagulation + TEE-guided or delayed cardioversion</li>
              <li>• Assess stroke risk (CHA₂DS₂-VASc) and bleeding risk (HAS-BLED)</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => setShowSummary(true)}
            className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600"
          >
            View Summary
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </StepCard>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Summary */
  /* ------------------------------------------------------------------------ */

  function renderSummary() {
    return (
      <StepCard title="Decision Summary" icon={CheckCircle2}>
        <div className="space-y-3 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-surface/50 p-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Stability
              </span>
              <p className="mt-0.5 font-medium capitalize">{state.stability ?? "—"}</p>
            </div>
            <div className="rounded-lg bg-surface/50 p-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                QRS
              </span>
              <p className="mt-0.5 font-medium">{state.narrowQrs === "narrow" ? "Narrow" : state.narrowQrs === "wide" ? "Wide" : "—"}</p>
            </div>
            <div className="rounded-lg bg-surface/50 p-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Regularity
              </span>
              <p className="mt-0.5 font-medium capitalize">{state.regularity ?? "—"}</p>
            </div>
            <div className="rounded-lg bg-surface/50 p-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Suspected Type
              </span>
              <p className="mt-0.5 font-medium capitalize">
                {state.svpSuspected?.replace(/_/g, " ") ?? "—"}
              </p>
            </div>
          </div>

          {state.contraindications.length > 0 && (
            <div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Contraindications
              </span>
              <ul className="mt-1 space-y-0.5">
                {state.contraindications.map((c) => {
                  const item = CONTRA_ITEMS.find((i) => i.value === c);
                  return (
                    <li key={c} className="flex items-center gap-2 text-xs">
                      <span className="text-red-400">•</span>
                      {item?.label}
                      <span
                        className={`rounded px-1 py-0.5 text-[9px] font-medium uppercase ${
                          item?.severity === "absolute"
                            ? "bg-red-500/15 text-red-400"
                            : "bg-amber-500/15 text-amber-400"
                        }`}
                      >
                        {item?.severity}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Management
            </span>
            <ul className="mt-1 space-y-1 text-xs">
              {state.stability === "unstable" && (
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Synchronized cardioversion {state.cardioversionDone ? "✅" : "recommended"}
                </li>
              )}
              {state.vagalDone && (
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Vagal maneuvers attempted
                </li>
              )}
              {state.adenosineGiven && (
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Adenosine {state.adenosineDose} given —{" "}
                  {state.adenosineResponse === "converted"
                    ? "converted to sinus"
                    : state.adenosineResponse === "transient"
                      ? "transient response"
                      : state.adenosineResponse === "no_response"
                        ? "no response"
                        : "response pending"}
                </li>
              )}
              {state.avBlockersGiven && (
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  AV nodal blocker given
                </li>
              )}
              {state.narrowQrs === "wide" && (
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  Wide-complex — consider VT protocol
                </li>
              )}
              {state.regularity === "irregular" && (
                <li className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-amber-400" />
                  Irregular — likely AF / atrial flutter
                </li>
              )}
            </ul>
          </div>

          {/* Recommendation */}
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
            <span className="text-[10px] font-medium uppercase tracking-wider text-rose-400">
              Recommendation
            </span>
            <p className="mt-1 text-sm">
              {state.stability === "unstable"
                ? "Synchronized cardioversion 50–100 J biphasic."
                : state.narrowQrs === "wide"
                  ? "Evaluate for VT. If SVT with aberrancy confirmed, treat as SVT. Avoid AV nodal blockers if pre-excitation."
                  : state.regularity === "irregular"
                    ? "Rate control (diltiazem/metoprolol). Assess AF duration and stroke risk."
                    : hasAbsoluteContra
                      ? "Consider synchronized cardioversion or expert consult (absolute contraindication to adenosine)."
                      : state.adenosineResponse === "converted"
                        ? "SVT converted. Obtain 12-lead ECG, monitor, arrange EP follow-up."
                        : state.adenosineResponse === "transient"
                          ? "Consider repeat adenosine (12 mg) or AV nodal blocker. Monitor for recurrence."
                          : state.adenosineResponse === "no_response"
                            ? "Consider AV nodal blocker (diltiazem/metoprolol) or synchronized cardioversion."
                            : "Vagal maneuvers → adenosine (6–12 mg) → AV nodal blocker if needed."
              }
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface"
          >
            Start Over
          </button>
        </div>
      </StepCard>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Main render */
  /* ------------------------------------------------------------------------ */

  const steps = [
    { label: "Stability" },
    { label: "QRS" },
    { label: "Regularity" },
    { label: "Type" },
    { label: "Contra" },
    { label: "Manage" },
  ];

  return (
    <div className="space-y-4">
      {/* Progress dots */}
      {!showSummary && step < 6 && (
        <div className="flex items-center gap-3">
          <ProgressDots current={step} total={6} />
          <span className="text-xs text-muted-foreground">
            {steps[step]?.label ?? ""}
          </span>
        </div>
      )}

      {/* Step content */}
      {!showSummary && step === 0 && renderStep0()}
      {!showSummary && step === 1 && renderStep1()}
      {!showSummary && step === 2 && renderStep2()}
      {!showSummary && step === 3 && renderStep3()}
      {!showSummary && step === 4 && renderStep4()}
      {!showSummary && step === 5 && renderStep5()}
      {!showSummary && step === 6 && renderStep6()}
      {!showSummary && step === 7 && renderStep7()}
      {!showSummary && step === 8 && renderStep8()}

      {/* Summary */}
      {showSummary && renderSummary()}
    </div>
  );
}
