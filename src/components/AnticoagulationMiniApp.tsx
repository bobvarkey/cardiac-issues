import React, { useMemo, useState } from "react";
import { ChevronRight, Pill, AlertTriangle, Info, Clock, Heart, Brain, Droplets, Image as ImageIcon, Scissors } from "lucide-react";

import periopImage from "@/assets/periop-blood-thinners.jpeg.asset.json";

const periopStopTimes = [
  { drug: "Aspirin", stop: "5–7 days", note: "May be continued in selected high cardiovascular risk patients", color: "text-rose-400" },
  { drug: "Clopidogrel", stop: "5 days", note: "", color: "text-teal-300" },
  { drug: "Prasugrel", stop: "7 days", note: "", color: "text-orange-400" },
  { drug: "Ticagrelor", stop: "5 days", note: "", color: "text-purple-400" },
  { drug: "Warfarin", stop: "5 days", note: "Check INR before surgery; target INR <1.5", color: "text-sky-400" },
  { drug: "Rivaroxaban / Apixaban / Edoxaban", stop: "2 days (48 h)", note: "Longer (3–4 days) if renal impairment", color: "text-emerald-400" },
  { drug: "Dabigatran", stop: "2–4 days", note: "Up to 5 days with significant renal impairment", color: "text-pink-400" },
];

const periopCautions = [
  "Recent coronary stent",
  "Recent heart attack",
  "Mechanical heart valve",
  "Atrial fibrillation with high stroke risk",
];


const imageFiles = [
  { src: "/images/anticoagulation/stroke-timing.jpg", title: "Stroke Prevention - DOAC Timing", desc: "Early DOAC initiation (≤4 days) after AF-related ischemic stroke" },
  { src: "/images/anticoagulation/ich-restart.jpg", title: "OAC After ICH", desc: "Restart timing (4-8 weeks) and LAAC alternative" },
  { src: "/images/anticoagulation/restarting-after-ich-v2.jpg", title: "Restarting After ICH", desc: "4-8 week delay for OAC resumption after intracranial hemorrhage" },
  { src: "/images/anticoagulation/vte-initial.jpg", title: "VTE Initial Treatment", desc: "DOAC dosing for acute DVT/PE" },
  { src: "/images/anticoagulation/extended-vte.jpg", title: "Extended VTE Therapy", desc: "Reduced dose options and recurrence risk" },
  { src: "/images/anticoagulation/extended-vte-therapy-v2.jpg", title: "Extended VTE Therapy (v2)", desc: "Apixaban 2.5mg BID or Rivaroxaban 10mg daily for long-term prevention" },
  { src: "/images/anticoagulation/kidney-disease.jpg", title: "DOACs in Kidney Disease", desc: "CKD stages and dialysis considerations" },
  { src: "/images/anticoagulation/renal-clearance-rule-v2.jpg", title: "Renal Clearance Rule", desc: "CKD Stage 4/5 and dialysis: apixaban preferred, avoid dabigatran" },
  { src: "/images/anticoagulation/liver-disease.jpg", title: "DOACs in Liver Disease", desc: "Child-Pugh classification" },
  { src: "/images/anticoagulation/liver-function-check-v2.jpg", title: "Liver Function Check", desc: "Child-Pugh A: all DOACs safe; Class B: avoid rivaroxaban" },
  { src: "/images/anticoagulation/obesity.jpg", title: "Frailty & Obesity", desc: "BMI ≥40 kg/m² recommendations" },
  { src: "/images/anticoagulation/cancer-thrombosis.jpg", title: "Cancer-Associated Thrombosis", desc: "DOACs vs LMWH, Khorana score" },
  { src: "/images/anticoagulation/af-stroke-prevention.jpg", title: "AF Stroke Prevention", desc: "2023 ACC/AHA risk-based anticoagulation" },
  { src: "/images/anticoagulation/vte-prevention-surgery.jpg", title: "VTE Prevention After Surgery", desc: "DOACs vs LMWH for hip/knee replacement" },
  { src: "/images/anticoagulation/valvular-disease.jpg", title: "Valvular Heart Disease", desc: "DOACs in mechanical valves, RHD, TAVI" },
  { src: "/images/anticoagulation/no-go-valves-v2.jpg", title: "No-Go Valves", desc: "DOACs contraindicated: mechanical valves, rheumatic mitral stenosis" },
  { src: "/images/anticoagulation/thrombophilia-aps.jpg", title: "Thrombophilia & APS", desc: "When DOACs are not the right choice" },
  { src: "/images/anticoagulation/laac-ablation.jpg", title: "LAAC & AF Ablation", desc: "Alternatives to long-term OAC" },
  { src: "/images/anticoagulation/doac-cheatsheet-v2.jpg", title: "DOAC Cheatsheet", desc: "Quick reference: acute stroke, mechanical valves, CKD, liver disease, extended VTE" },
];

const data = {
  title: "DOACs and Anticoagulation Clinical Algorithms",
  versions: "2026-07",
  modules: [
    {
      id: "vte_initial_treatment",
      name: "VTE Initial Treatment",
      agents: [
        {
          drug: "Dabigatran",
          dose: "150 mg",
          frequency: "BID",
          note: "start after ≥5 days parenteral heparin",
        },
        {
          drug: "Edoxaban",
          dose: "60 mg",
          frequency: "daily",
          note: "start after ≥5 days parenteral heparin",
        },
        {
          drug: "Rivaroxaban",
          dose: "15 mg",
          frequency: "BID",
          duration: "21 days",
          then: "20 mg daily",
          note: "no heparin needed for loading",
        },
        {
          drug: "Apixaban",
          dose: "10 mg",
          frequency: "BID",
          duration: "7 days",
          then: "5 mg BID",
          note: "no heparin needed for loading",
        },
      ],
      comments: "COBRRA trial: apixaban preferred vs rivaroxaban for less bleeding",
    },
    {
      id: "extended_vte",
      name: "Extended VTE Therapy",
      rules: [
        {
          indication: "extended",
          agents: [
            { drug: "Apixaban", dose: "2.5 mg", frequency: "BID" },
            { drug: "Rivaroxaban", dose: "10 mg", frequency: "daily" },
            { drug: "Dabigatran", dose: "150 mg", frequency: "BID" },
          ],
        },
        { provoked_vte_recurrence: "~2%/year", note: "short-term therapy" },
        { unprovoked_vte_recurrence: "~10%/year", note: "consider indefinite therapy" },
        { aspirin: "far less effective than extended DOAC" },
      ],
    },
    {
      id: "doacs_in_kidney_disease",
      name: "DOACs in Kidney Disease",
      stages: [
        { ckd_stage: "3", egfr: "30-59", recommendation: "standard dosing per label" },
        {
          ckd_stage: "4",
          egfr: "15-29",
          recommendation: "apixaban preferred with label-concordant dosing supported by 2024 KDIGO",
        },
        {
          ckd_stage: "5",
          egfr: "<15",
          recommendation: "use caution; consider apixaban; limited data",
        },
        {
          dialysis: "ESKD",
          recommendation: "apixaban may be considered for nonvalvular AF; avoid dabigatran (removed by dialysis)",
        },
      ],
    },
  ],
  stroke_secondary_prevention: {
    early_initiation: "≤4 days after AF-related ischemic stroke reduces 30-day recurrent stroke (OR 0.70)",
    avoid_within_48h: "avoid anticoagulation within 48 hours in unselected patients",
    exclude: "very severe stroke, large hemorrhagic transformation, endocarditis",
  },
  oac_after_brain_bleed: {
    resume_benefit: "resuming lowers ischemic stroke and MACE",
    risk: "raises recurrent ICH and hemorrhagic MACE",
    timing: "for most patients wait 4-8 weeks before resuming OAC",
    alternative: "LAA closure reasonable for patients unsuitable for long-term OAC",
  },
  guideline_additions: {
    vte: {
      acute_treatment: [
        "Apixaban or rivaroxaban can be started without heparin lead-in.",
        "Dabigatran and edoxaban require at least 5 days of parenteral anticoagulation first.",
      ],
      extended_treatment: [
        "Use reduced-dose apixaban 2.5 mg BID or rivaroxaban 10 mg daily for extended prevention when appropriate.",
        "Aspirin is less effective than extended DOAC therapy for recurrence prevention.",
      ],
    },
    af: {
      nonvalvular_af: [
        "DOACs are preferred over warfarin for eligible nonvalvular AF.",
        "Use CHA2DS2-VASc for thromboembolic risk assessment; bleeding scores should inform risk modification, not exclude anticoagulation by themselves.",
      ],
      exceptions: [
        "Mitral stenosis and mechanical valves are not DOAC candidates.",
        "Left atrial appendage occlusion is an option when long-term OAC is contraindicated.",
      ],
    },
    stroke: {
      ischemic_stroke: [
        "For AF-related ischemic stroke, early DOAC initiation within 4 days may be reasonable in selected patients.",
        "Avoid routine anticoagulation within 48 hours in unselected patients; exclude severe stroke, large hemorrhagic transformation, and endocarditis.",
      ],
    },
    ich: {
      restart: [
        "Resuming anticoagulation after ICH reduces ischemic stroke/MACE but increases recurrent ICH risk.",
        "For most patients, waiting 4 to 8 weeks before restarting OAC is prudent.",
        "Left atrial appendage closure is a reasonable alternative in patients unsuitable for long-term OAC.",
      ],
    },
    aplas: {
      rule: [
        "Avoid DOACs in thrombotic antiphospholipid syndrome, especially high-risk APS; warfarin is preferred.",
      ],
    },
    rhd: {
      rule: [
        "Rheumatic mitral stenosis / rheumatic heart disease with AF should receive warfarin, not a DOAC.",
        "Mechanical prosthetic valves also require warfarin; DOACs are contraindicated.",
      ],
    },
  },
};

const steps = [
  { id: "select", label: "Select" },
  { id: "input", label: "Input" },
  { id: "recommend", label: "Recommend" },
  { id: "summary", label: "Summary" },
];

const scenarios = [
  { id: "vte", label: "VTE", icon: Droplets, description: "Venous thromboembolism treatment" },
  { id: "af", label: "AF / NVAF", icon: Heart, description: "Atrial fibrillation anticoagulation" },
  { id: "stroke", label: "Stroke", icon: Brain, description: "Ischemic stroke prevention" },
  { id: "ich", label: "ICH", icon: AlertTriangle, description: "Intracranial hemorrhage management" },
  { id: "aplas", label: "APLAS", icon: AlertTriangle, description: "Antiphospholipid antibody syndrome" },
  { id: "rhd", label: "RHD", icon: Heart, description: "Rheumatic heart disease" },
];

function getRecommendation(sc: string, form: Record<string, string>) {
  const out = { title: sc, bullets: [] as string[], caution: [] as string[] };

  if (sc === "vte") {
    out.bullets.push("Apixaban or rivaroxaban can be used without heparin lead-in.");
    out.bullets.push("Dabigatran and edoxaban require at least 5 days of parenteral anticoagulation first.");
    if (form.phase === "extended") {
      out.bullets.push("Extended therapy options include apixaban 2.5 mg BID or rivaroxaban 10 mg daily.");
    }
    if (form.phase === "acute") {
      out.bullets.push("For initial VTE: apixaban 10 mg BID × 7 days, then 5 mg BID.");
      out.bullets.push("For initial VTE: rivaroxaban 15 mg BID × 21 days, then 20 mg daily.");
    }
  }

  if (sc === "af") {
    if (form.valvular === "rhd" || form.valvular === "mechanical") {
      out.bullets.push("Warfarin is preferred; DOACs are not appropriate.");
      out.caution.push("Mechanical valves and rheumatic mitral stenosis are DOAC contraindications.");
    } else {
      out.bullets.push("DOACs are preferred over warfarin for eligible nonvalvular AF.");
      out.bullets.push("Use CHA₂DS₂-VASc for stroke risk; bleeding scores inform risk modification.");
    }
  }

  if (sc === "stroke") {
    out.bullets.push("Early DOAC initiation within 4 days may be reasonable in selected AF-related ischemic stroke cases.");
    out.caution.push("Avoid routine anticoagulation within 48 hours in unselected patients.");
    out.caution.push("Exclude severe stroke, large hemorrhagic transformation, and endocarditis.");
  }

  if (sc === "ich") {
    out.bullets.push("For most patients, waiting 4 to 8 weeks before restarting OAC is prudent.");
    out.bullets.push("Left atrial appendage closure is a reasonable alternative when long-term OAC is unsuitable.");
    out.caution.push("Resuming OAC reduces ischemic stroke but increases recurrent ICH risk.");
  }

  if (sc === "aplas") {
    out.bullets.push("Avoid DOACs in thrombotic APS; warfarin is preferred.");
    out.caution.push("Especially high-risk APS: triple-positive, arterial events, recurrent VTE on DOACs.");
  }

  if (sc === "rhd") {
    out.bullets.push("Rheumatic mitral stenosis / RHD with AF should receive warfarin.");
    out.bullets.push("Mechanical prosthetic valves also require warfarin; DOACs are contraindicated.");
  }

  if (form.egfr && Number(form.egfr) < 30) {
    out.caution.push("Severe CKD (eGFR <30): use apixaban with caution; avoid dabigatran.");
  }
  if (form.egfr && Number(form.egfr) < 15) {
    out.caution.push("ESKD/dialysis: limited data; apixaban may be considered for nonvalvular AF.");
  }

  return out;
}

export function AnticoagulationMiniApp() {
  const [activeTab, setActiveTab] = useState<"calculator" | "images">("calculator");
  const [step, setStep] = useState(0);
  const [scenario, setScenario] = useState("vte");
  const [form, setForm] = useState({
    phase: "acute",
    valvular: "none",
    egfr: "",
    notes: "",
  });

  const selected = useMemo(() => scenarios.find((x) => x.id === scenario), [scenario]);
  const rec = useMemo(() => getRecommendation(scenario, form), [scenario, form]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
        <header className="rounded-2xl border border-cyan-400/30 bg-slate-900 p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <Pill className="h-8 w-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Anticoagulation Guidelines
              </h1>
              <p className="mt-1 text-slate-400">
                DOAC dosing, VTE treatment, AF management, and special populations
              </p>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`rounded-full px-4 py-2 border text-sm font-medium transition ${
              activeTab === "calculator"
                ? "bg-cyan-400 text-slate-950 border-cyan-300"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            <Pill className="inline h-4 w-4 mr-1" />
            Calculator
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`rounded-full px-4 py-2 border text-sm font-medium transition ${
              activeTab === "images"
                ? "bg-cyan-400 text-slate-950 border-cyan-300"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            <ImageIcon className="inline h-4 w-4 mr-1" />
            Images
          </button>
        </div>

        {activeTab === "calculator" && (
        <>
        {/* Stepper */}
        <div className="flex flex-wrap gap-2">
          {steps.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              className={`rounded-full px-4 py-2 border text-sm font-medium transition ${
                step === i
                  ? "bg-cyan-400 text-slate-950 border-cyan-300"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
              }`}
            >
              {i + 1}. {s.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Scenario sidebar */}
          <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
            <h2 className="text-lg font-semibold">Clinical Scenario</h2>
            {scenarios.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id)}
                  className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                    scenario === s.id
                      ? "border-cyan-400 bg-cyan-400/10"
                      : "border-slate-700 bg-slate-950/40 hover:border-slate-500"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${scenario === s.id ? "text-cyan-400" : "text-slate-400"}`} />
                    <div className="font-medium">{s.label}</div>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{s.description}</div>
                </button>
              );
            })}
          </aside>

          {/* Main content */}
          <main className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-6">
            {step === 0 && (
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">Choose a pathway</h2>
                <p className="text-slate-300">
                  Select a clinical scenario on the left to drive the decision logic.
                </p>
                <div className="mt-4 p-4 rounded-lg bg-slate-950/50 border border-slate-700">
                  <p className="text-sm text-slate-400">
                    <Info className="inline h-4 w-4 mr-1" />
                    Each pathway provides evidence-based recommendations from current guidelines
                    (2024 KDIGO, COBRRA trial, stroke prevention in AF, ICH restart timing).
                  </p>
                </div>
              </section>
            )}

            {step === 1 && (
              <section className="grid gap-4 md:grid-cols-2">
                {scenario === "vte" && (
                  <>
                    <label className="space-y-2">
                      <span className="block text-sm text-slate-300">Treatment Phase</span>
                      <select
                        value={form.phase}
                        onChange={(e) => setForm({ ...form, phase: e.target.value })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 focus:border-cyan-400 focus:outline-none"
                      >
                        <option value="acute">Acute VTE (initial treatment)</option>
                        <option value="extended">Extended therapy (≥3 months)</option>
                      </select>
                    </label>
                  </>
                )}

                {scenario === "af" && (
                  <label className="space-y-2">
                    <span className="block text-sm text-slate-300">Valvular Status</span>
                    <select
                      value={form.valvular}
                      onChange={(e) => setForm({ ...form, valvular: e.target.value })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="none">Nonvalvular AF</option>
                      <option value="rhd">Rheumatic mitral stenosis</option>
                      <option value="mechanical">Mechanical valve</option>
                    </select>
                  </label>
                )}

                {(scenario === "vte" || scenario === "af") && (
                  <label className="space-y-2">
                    <span className="block text-sm text-slate-300">eGFR (ml/min/1.73m²)</span>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={form.egfr}
                      onChange={(e) => setForm({ ...form, egfr: e.target.value })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 focus:border-cyan-400 focus:outline-none"
                    />
                    <span className="text-xs text-slate-500">
                      Used to adjust DOAC selection for CKD
                    </span>
                  </label>
                )}

                {(scenario === "stroke" || scenario === "ich") && (
                  <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-700">
                    <p className="text-sm text-slate-300">
                      <Clock className="inline h-4 w-4 mr-1" />
                      {scenario === "stroke" && "Timing of anticoagulation after stroke is critical."}
                      {scenario === "ich" && "Timing of restarting anticoagulation after ICH is critical."}
                    </p>
                  </div>
                )}

                <label className="space-y-2 md:col-span-2">
                  <span className="block text-sm text-slate-300">Clinical Notes</span>
                  <textarea
                    placeholder="Optional notes"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 focus:border-cyan-400 focus:outline-none"
                    rows={3}
                  />
                </label>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Recommendations</h2>
                <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-700">
                  <h3 className="font-medium text-cyan-400 mb-2">
                    {selected?.label} — {form.phase === "extended" ? "Extended" : "Acute"} Treatment
                  </h3>
                  <ul className="space-y-2">
                    {rec.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 mt-1 text-cyan-400 flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {rec.caution.length > 0 && (
                  <div className="p-4 rounded-lg bg-amber-950/30 border border-amber-500/50">
                    <h3 className="font-medium text-amber-400 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Cautions
                    </h3>
                    <ul className="space-y-1 text-sm text-amber-100">
                      {rec.caution.map((c, i) => (
                        <li key={i}>• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {step === 3 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold">Summary</h2>
                <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-700">
                  <p className="text-sm text-slate-300">
                    <strong>Scenario:</strong> {selected?.label}
                  </p>
                  {(scenario === "vte" || scenario === "af") && form.egfr && (
                    <p className="text-sm text-slate-300 mt-1">
                      <strong>eGFR:</strong> {form.egfr} ml/min/1.73m²
                    </p>
                  )}
                  {scenario === "af" && (
                    <p className="text-sm text-slate-300 mt-1">
                      <strong>Valvular status:</strong>{" "}
                      {form.valvular === "none"
                        ? "Nonvalvular"
                        : form.valvular === "rhd"
                        ? "Rheumatic mitral stenosis"
                        : "Mechanical valve"}
                    </p>
                  )}
                </div>
                <ul className="space-y-2">
                  {rec.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ChevronRight className="h-4 w-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                {rec.caution.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/50">
                    <p className="text-xs text-amber-200">
                      <AlertTriangle className="inline h-3 w-3 mr-1" />
                      {rec.caution.length} caution(s) noted — see Recommend step for details.
                    </p>
                  </div>
                )}
                <div className="mt-6 p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30">
                  <p className="text-xs text-cyan-200">
                    For educational reference only. Not a substitute for clinical judgment,
                    institutional protocols, or current guidelines.
                  </p>
                </div>
              </section>
            )}
          </main>
        </div>

        {/* DOAC Reference Tables */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <h2 className="text-xl font-semibold">DOAC Dosing Reference</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* VTE Initial Treatment */}
            <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-700">
              <h3 className="font-medium text-cyan-400 mb-3">VTE Initial Treatment</h3>
              <div className="space-y-3">
                {(data.modules[0]?.agents ?? []).map((agent, i) => (
                  <div key={i} className="text-sm">
                    <div className="font-medium">{agent.drug}</div>
                    <div className="text-slate-400">
                      {agent.dose} {agent.frequency}
                      {agent.duration && ` × ${agent.duration}`}
                      {agent.then && `, then ${agent.then}`}
                    </div>
                    <div className="text-xs text-amber-300">{agent.note}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
                {data.modules[0]?.comments}
              </div>
            </div>

            {/* Extended VTE */}
            <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-700">
              <h3 className="font-medium text-cyan-400 mb-3">Extended VTE Therapy</h3>
              <div className="space-y-2">
                {(data.modules[1]?.rules?.[0]?.agents ?? []).map((agent, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-medium">{agent.drug}</span>: {agent.dose} {agent.frequency}
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 space-y-1 text-xs text-slate-400">
                <div>Provoked VTE recurrence: ~2%/year (short-term therapy)</div>
                <div>Unprovoked VTE recurrence: ~10%/year (consider indefinite)</div>
                <div className="text-amber-300">Aspirin: far less effective than extended DOAC</div>
              </div>
            </div>

            {/* CKD Dosing */}
            <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-700 md:col-span-2">
              <h3 className="font-medium text-cyan-400 mb-3">DOACs in Kidney Disease (2024 KDIGO)</h3>
              <div className="grid gap-2 md:grid-cols-4">
                {(data.modules[2]?.stages ?? []).map((stage, i) => (
                  <div key={i} className="p-2 rounded bg-slate-900">
                    <div className="text-xs text-slate-400">
                      {stage.ckd_stage || stage.dialysis} {stage.egfr && `(${stage.egfr})`}
                    </div>
                    <div className="text-sm mt-1">{stage.recommendation}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stroke & ICH Guidelines */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <h2 className="text-xl font-semibold">Stroke & ICH Guidelines</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-700">
              <h3 className="font-medium text-cyan-400 mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Ischemic Stroke (AF-related)
              </h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                  <span>{data.stroke_secondary_prevention.early_initiation}</span>
                </li>
                <li className="flex items-start gap-2 text-amber-200">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{data.stroke_secondary_prevention.avoid_within_48h}</span>
                </li>
                <li className="text-xs text-slate-400 mt-2">
                  Exclude: {data.stroke_secondary_prevention.exclude}
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-700">
              <h3 className="font-medium text-amber-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                OAC After ICH
              </h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                  <span>{data.oac_after_brain_bleed.timing}</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="h-4 w-4 mt-0.5 text-cyan-400 flex-shrink-0" />
                  <span>{data.oac_after_brain_bleed.alternative}</span>
                </li>
                <li className="text-xs text-slate-400 mt-2">
                  Benefit: {data.oac_after_brain_bleed.resume_benefit} | Risk: {data.oac_after_brain_bleed.risk}
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contraindications */}
        <section className="rounded-2xl border border-red-900/50 bg-red-950/20 p-5">
          <h2 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            DOAC Contraindications & Special Populations
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="p-3 rounded bg-red-950/30 border border-red-800/50">
              <h3 className="font-medium text-red-300 mb-1">Antiphospholipid Syndrome</h3>
              <p className="text-sm text-slate-300">
                Avoid DOACs in thrombotic APS, especially high-risk (triple-positive, arterial events).
                Warfarin preferred.
              </p>
            </div>
            <div className="p-3 rounded bg-red-950/30 border border-red-800/50">
              <h3 className="font-medium text-red-300 mb-1">Rheumatic Heart Disease</h3>
              <p className="text-sm text-slate-300">
                Rheumatic mitral stenosis with AF → warfarin. Mechanical valves → warfarin.
                DOACs contraindicated.
              </p>
            </div>
          </div>
        </section>
        </>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Guideline Images</h2>
            <p className="text-slate-400">Reference infographics for anticoagulation management.</p>
            <div className="grid gap-6 md:grid-cols-2">
              {imageFiles.map((img, i) => (
                <div key={i} className="rounded-xl border border-slate-700 bg-slate-950/50 overflow-hidden">
                  <img 
                    src={img.src} 
                    alt={img.title}
                    className="w-full h-auto"
                  />
                  <div className="p-3 border-t border-slate-700">
                    <h3 className="font-medium text-cyan-400">{img.title}</h3>
                    <p className="text-sm text-slate-400">{img.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}