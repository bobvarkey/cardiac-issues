import {
  HeartPulse,
  Pill,
  ShieldAlert,
  BookOpen,
  ExternalLink,
  Activity,
  Stethoscope,
  FlaskConical,
  ClipboardCheck,
} from "lucide-react";

type Step = {
  n: number;
  title: string;
  goal: string;
  drugs: { name: string; dose: string; note?: string }[];
  monitor: string[];
  icon: React.ComponentType<{ className?: string }>;
};

const steps: Step[] = [
  {
    n: 1,
    title: "Lifestyle & risk-factor foundation",
    goal: "Applies to every patient — reassess at each visit.",
    icon: HeartPulse,
    drugs: [
      { name: "Smoking cessation", dose: "Varenicline / NRT / bupropion PRN" },
      { name: "Mediterranean diet", dose: "≥150 min/wk moderate aerobic activity" },
      { name: "BMI target", dose: "18.5–24.9 kg/m²; waist <94 cm (M) / <80 cm (F)" },
    ],
    monitor: [
      "BP, weight, HbA1c, lipids at baseline then 3–6 monthly",
      "Cardiac rehab referral after ACS or revascularization",
    ],
  },
  {
    n: 2,
    title: "Antiplatelet therapy",
    goal: "Lifelong single antiplatelet in all CCAD; DAPT only in defined windows.",
    icon: Pill,
    drugs: [
      { name: "Aspirin", dose: "75–100 mg PO daily", note: "First-line lifelong SAPT" },
      { name: "Clopidogrel", dose: "75 mg PO daily", note: "If aspirin intolerant or high GI risk" },
      {
        name: "DAPT (aspirin + P2Y12)",
        dose: "6–12 mo post-PCI, then step down to SAPT",
        note: "Shorten to 1–3 mo if high bleeding risk (PRECISE-DAPT ≥25)",
      },
    ],
    monitor: [
      "Bleeding history, Hb, platelets at 1 and 6 months",
      "Add PPI if prior GI bleed, age >65, or on anticoagulant",
    ],
  },
  {
    n: 3,
    title: "Lipid lowering — LDL-C <1.4 mmol/L (<55 mg/dL)",
    goal: "High-intensity statin for all; escalate if target not met at 4–6 weeks.",
    icon: FlaskConical,
    drugs: [
      { name: "Atorvastatin", dose: "40–80 mg PO nightly", note: "First-line high-intensity" },
      { name: "Rosuvastatin", dose: "20–40 mg PO nightly", note: "Alternative high-intensity" },
      { name: "Ezetimibe", dose: "10 mg PO daily", note: "Add if LDL >1.4 on max statin" },
      {
        name: "PCSK9i (evolocumab / alirocumab)",
        dose: "140 mg SC q2wk / 75–150 mg SC q2wk",
        note: "If LDL remains above target on statin + ezetimibe",
      },
    ],
    monitor: [
      "Lipid panel + ALT at baseline, 4–12 weeks, then annually",
      "CK only if muscle symptoms; check TSH if new myalgia",
    ],
  },
  {
    n: 4,
    title: "Antianginal & anti-ischemic therapy",
    goal: "Titrate to symptom control and resting HR 55–60 bpm.",
    icon: Activity,
    drugs: [
      { name: "Metoprolol succinate", dose: "25–200 mg PO daily", note: "First-line β-blocker" },
      { name: "Bisoprolol", dose: "2.5–10 mg PO daily" },
      {
        name: "Amlodipine",
        dose: "5–10 mg PO daily",
        note: "Add or substitute if β-blocker contraindicated / vasospastic angina",
      },
      { name: "Isosorbide mononitrate", dose: "30–120 mg PO daily", note: "12-hour nitrate-free interval" },
      { name: "GTN spray", dose: "400 mcg SL PRN, repeat q5min ×3" },
      { name: "Ivabradine", dose: "5–7.5 mg PO BID", note: "Sinus rhythm, HR ≥70 despite β-blocker" },
      { name: "Ranolazine", dose: "500–1000 mg PO BID", note: "Refractory angina; QT monitoring" },
    ],
    monitor: [
      "HR, BP, symptom diary at each visit",
      "ECG at baseline and if dose changes (QTc for ranolazine)",
    ],
  },
  {
    n: 5,
    title: "RAAS inhibition",
    goal: "Indicated with LVEF ≤40%, hypertension, diabetes, or CKD.",
    icon: Stethoscope,
    drugs: [
      { name: "Ramipril", dose: "2.5–10 mg PO daily" },
      { name: "Perindopril", dose: "4–8 mg PO daily" },
      { name: "Losartan / Valsartan", dose: "50–150 mg / 80–320 mg PO daily", note: "If ACEi intolerant" },
    ],
    monitor: [
      "U&E and eGFR at 1–2 weeks after start / uptitration, then 6-monthly",
      "Hold if K⁺ >5.5 or creatinine rise >30%",
    ],
  },
  {
    n: 6,
    title: "Anti-inflammatory therapy (LoDoCo2)",
    goal: "Consider in stable CCAD ≥6 months on GDMT with eGFR >50.",
    icon: ShieldAlert,
    drugs: [
      {
        name: "Colchicine",
        dose: "0.5 mg PO daily",
        note: "31% RRR in MACE (HR 0.69, NEJM 2020)",
      },
    ],
    monitor: [
      "Baseline U&E, LFTs; recheck at 3 months then annually",
      "Avoid with strong CYP3A4 / P-gp inhibitors (clarithromycin, ketoconazole)",
      "Stop for persistent diarrhoea or myopathy",
    ],
  },
  {
    n: 7,
    title: "Comorbidity-directed add-ons",
    goal: "Layer if diabetes, HF, or persistent symptoms despite steps 1–6.",
    icon: ClipboardCheck,
    drugs: [
      {
        name: "SGLT2 inhibitor (empagliflozin / dapagliflozin)",
        dose: "10 mg PO daily",
        note: "Diabetes, HFrEF, or CKD — cardiorenal benefit",
      },
      {
        name: "GLP-1 RA (semaglutide / liraglutide)",
        dose: "0.5–1 mg SC weekly / 1.2–1.8 mg SC daily",
        note: "T2DM with established ASCVD",
      },
      {
        name: "Referral for revascularization",
        dose: "PCI or CABG",
        note: "Refractory angina, high-risk anatomy, or LVEF ≤35% with multivessel disease",
      },
    ],
    monitor: [
      "eGFR, volume status, and ketones (SGLT2i) at 4 weeks",
      "Reassess angina class (CCS) and repeat functional imaging if escalating symptoms",
    ],
  },
];

export function CCADMiniApp() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">
            Chronic Coronary Artery Disease
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">CCAD — evidence & management</h1>
        <p className="max-w-2xl text-muted-foreground">
          Secondary prevention pillars for chronic coronary artery disease, including anti-inflammatory
          therapy with low-dose colchicine (LoDoCo2).
        </p>
      </section>

      {/* LoDoCo2 highlight */}
      <section className="surface-panel space-y-5 border-primary/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
                Key trial · LoDoCo2 · NEJM 2020
              </div>
              <h2 className="mt-1 text-xl font-semibold">
                Colchicine 0.5 mg daily in chronic coronary disease
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Multicenter, double-blind, randomized, placebo-controlled trial in 5,522 patients with
                chronic coronary disease. Low-dose colchicine reduced the composite of cardiovascular
                death, spontaneous MI, ischemic stroke, or ischemia-driven coronary revascularization.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
              Colchicine 0.5 mg/day · n = 2,762
            </div>
            <div className="mt-2 text-3xl font-semibold">6.8%</div>
            <div className="text-xs text-muted-foreground">primary composite endpoint</div>
          </div>
          <div className="rounded-xl border border-border bg-surface-elevated/40 p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Placebo · n = 2,760
            </div>
            <div className="mt-2 text-3xl font-semibold">9.6%</div>
            <div className="text-xs text-muted-foreground">primary composite endpoint</div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-elevated/40 p-3 text-sm">
          <span className="font-mono text-xs uppercase tracking-wider text-primary">Effect</span>{" "}
          HR 0.69 (95% CI 0.57–0.83), P &lt; 0.001 — ~31% relative risk reduction in major
          cardiovascular events.
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-3 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <HeartPulse className="h-4 w-4 text-primary" /> Who to consider
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Established chronic coronary disease on standard secondary prevention</li>
              <li>Stable ≥ 6 months after acute event or revascularization</li>
              <li>eGFR &gt; 50 mL/min and no significant hepatic disease</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border p-3 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4 text-destructive" /> Cautions
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Avoid with strong CYP3A4 / P-gp inhibitors (clarithromycin, ketoconazole)</li>
              <li>Severe renal or hepatic impairment</li>
              <li>Non-cardiovascular death numerically higher (0.7 vs 0.5 events/100 pt-yr)</li>
              <li>GI intolerance is the most common reason for discontinuation</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <span className="font-semibold">Bottom line:</span> In patients with chronic coronary
          disease already on guideline-directed therapy, adding colchicine 0.5 mg daily lowers the
          risk of cardiovascular events. Weigh against a small signal of increased non-cardiovascular
          mortality and drug-interaction risk.
        </div>

        <a
          href="https://www.nejm.org/doi/full/10.1056/NEJMoa2021372"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-primary hover:underline"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Nidorf SM et al., NEJM 2020 · 10.1056/NEJMoa2021372
          <ExternalLink className="h-3 w-3" />
        </a>
      </section>

      {/* Step-by-step treatment algorithm */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">
            Step-by-step treatment algorithm
          </span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Guideline-directed medical therapy for CCAD
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Sequential pillars based on the 2024 ESC guideline on chronic coronary syndromes and the
          2023 AHA/ACC CCD guideline. Titrate stepwise; do not skip a pillar unless contraindicated.
        </p>

        <ol className="space-y-4">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.n} className="surface-panel space-y-4 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
                      Step {s.n}
                    </div>
                    <h3 className="mt-0.5 text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.goal}</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-border bg-surface-elevated/40 p-3">
                    <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                      <Pill className="h-3 w-3" /> Drug & dose
                    </div>
                    <ul className="space-y-2 text-sm">
                      {s.drugs.map((d) => (
                        <li key={d.name} className="border-b border-border/50 pb-2 last:border-0 last:pb-0">
                          <div className="font-medium">{d.name}</div>
                          <div className="font-mono text-xs text-primary">{d.dose}</div>
                          {d.note && (
                            <div className="mt-0.5 text-xs text-muted-foreground">{d.note}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-lg border border-border bg-surface-elevated/40 p-3">
                    <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                      <ClipboardCheck className="h-3 w-3" /> Monitoring
                    </div>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {s.monitor.map((m) => (
                        <li key={m} className="flex gap-2">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                          <span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="text-[11px] text-muted-foreground">
          Educational reference only — follow local protocols and individualize dosing to
          comorbidity, bleeding risk, and renal / hepatic function.
        </p>
      </section>
    </div>
  );
}
