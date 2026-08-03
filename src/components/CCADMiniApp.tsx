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
import ctCalciumScore from "@/assets/ct-calcium-score.jpeg.asset.json";

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
      {
        name: "Clopidogrel",
        dose: "75 mg PO daily",
        note: "If aspirin intolerant or high GI risk",
      },
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
      {
        name: "Isosorbide mononitrate",
        dose: "30–120 mg PO daily",
        note: "12-hour nitrate-free interval",
      },
      { name: "GTN spray", dose: "400 mcg SL PRN, repeat q5min ×3" },
      {
        name: "Ivabradine",
        dose: "5–7.5 mg PO BID",
        note: "Sinus rhythm, HR ≥70 despite β-blocker",
      },
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
      {
        name: "Losartan / Valsartan",
        dose: "50–150 mg / 80–320 mg PO daily",
        note: "If ACEi intolerant",
      },
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
          Secondary prevention pillars for chronic coronary artery disease, including
          anti-inflammatory therapy with low-dose colchicine (LoDoCo2).
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
                Multicenter, double-blind, randomized, placebo-controlled trial in 5,522 patients
                with chronic coronary disease. Low-dose colchicine reduced the composite of
                cardiovascular death, spontaneous MI, ischemic stroke, or ischemia-driven coronary
                revascularization.
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
          <span className="font-mono text-xs uppercase tracking-wider text-primary">Effect</span> HR
          0.69 (95% CI 0.57–0.83), P &lt; 0.001 — ~31% relative risk reduction in major
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
          risk of cardiovascular events. Weigh against a small signal of increased
          non-cardiovascular mortality and drug-interaction risk.
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
                        <li
                          key={d.name}
                          className="border-b border-border/50 pb-2 last:border-0 last:pb-0"
                        >
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

      {/* CT calcium score */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Risk stratification · Imaging</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          CT calcium score (CAC · Agatston)
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Non-contrast, ECG-gated CT that quantifies calcified coronary plaque. It detects
          subclinical coronary atherosclerosis before symptoms and refines risk when the decision
          to start preventive therapy — especially statins — is uncertain.
        </p>

        <div className="surface-panel overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-elevated/40 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5">Agatston score</th>
                <th className="px-4 py-2.5">Calcification</th>
                <th className="px-4 py-2.5">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  score: "0",
                  calc: "No detectable coronary calcium",
                  risk: "Very low risk of coronary events in the near term",
                },
                {
                  score: "1–99",
                  calc: "Mild calcification",
                  risk: "Mild atherosclerotic burden",
                },
                {
                  score: "100–399",
                  calc: "Moderate calcification",
                  risk: "Increased cardiovascular risk",
                },
                {
                  score: "≥ 400",
                  calc: "Extensive calcification",
                  risk: "High risk; further evaluation needed",
                },
              ].map((r) => (
                <tr key={r.score} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3 font-mono font-semibold text-primary">{r.score}</td>
                  <td className="px-4 py-3">{r.calc}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="surface-panel space-y-2 p-4">
            <div className="flex items-center gap-2 font-semibold">
              <Stethoscope className="h-4 w-4 text-primary" /> Who benefits most
            </div>
            <p className="text-sm text-muted-foreground">
              Mainly asymptomatic adults 40–75 years with intermediate cardiovascular risk when the
              need for statin therapy is unclear.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Borderline cholesterol levels</li>
              <li>Family history of premature coronary artery disease</li>
              <li>Multiple risk factors but unclear need for statin therapy</li>
            </ul>
          </div>

          <div className="surface-panel space-y-2 p-4">
            <div className="flex items-center gap-2 font-semibold">
              <Activity className="h-4 w-4 text-primary" /> Clinical importance
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Detects hidden coronary atherosclerosis</li>
              <li>Improves risk prediction beyond traditional risk factors</li>
              <li>Guides statin therapy decisions</li>
              <li>Motivates lifestyle modification</li>
            </ul>
          </div>

          <div className="surface-panel space-y-2 border-destructive/25 p-4">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4 text-destructive" /> Limitations
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Does not detect soft (non-calcified) plaque</li>
              <li>Does not directly show severity of artery narrowing</li>
              <li>Not a test for acute chest pain or suspected myocardial infarction</li>
              <li>Not routinely recommended for low-risk young individuals</li>
            </ul>
          </div>

          <div className="surface-panel space-y-2 p-4">
            <div className="flex items-center gap-2 font-semibold">
              <FlaskConical className="h-4 w-4 text-primary" /> CAC score vs CT coronary angiography
            </div>
            <ul className="space-y-2 text-sm">
              {[
                ["Detects calcium burden only", "Shows coronary artery anatomy"],
                ["No contrast required", "Requires contrast injection"],
                ["Risk assessment tool", "Detects stenosis / plaque characteristics"],
                ["Mainly for asymptomatic risk assessment", "Evaluation of suspected CAD"],
              ].map(([cac, cta]) => (
                <li key={cac} className="grid gap-1 border-b border-border/50 pb-2 last:border-0 last:pb-0 sm:grid-cols-2">
                  <span className="text-primary">{cac}</span>
                  <span className="text-muted-foreground">{cta}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <span className="font-semibold">Key point:</span> A calcium score of zero does not mean
          zero risk, but it indicates a very low likelihood of significant calcified coronary
          plaque. A high CAC score indicates higher future cardiovascular risk and the need for
          aggressive risk-factor management.
        </div>

        <figure className="surface-panel space-y-2 p-3">
          <img
            src={ctCalciumScore.url}
            alt="CT calcium score infographic: Agatston score interpretation, who benefits from CAC scoring, clinical importance, limitations, and CAC versus CT coronary angiography"
            loading="lazy"
            className="w-full rounded-lg"
          />
          <figcaption className="text-[11px] text-muted-foreground">
            CT calcium score — Agatston interpretation and clinical use summary.
          </figcaption>
        </figure>
      </section>


      {/* Sources & citations */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Sources & citations</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          LoDoCo2 & colchicine evidence base
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Primary trial, precursor and confirmatory RCTs, meta-analyses, regulatory label, and
          society guidance supporting low-dose colchicine 0.5 mg daily in chronic coronary disease.
        </p>

        <ol className="space-y-3">
          {[
            {
              tag: "Primary RCT",
              title:
                "Nidorf SM, Fiolet ATL, Mosterd A, et al. Colchicine in Patients with Chronic Coronary Disease (LoDoCo2).",
              cite: "N Engl J Med. 2020;383(19):1838–1847.",
              doi: "10.1056/NEJMoa2021372",
              url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2021372",
              note: "5,522 patients; MACE 6.8% vs 9.6%, HR 0.69 (95% CI 0.57–0.83), P<0.001.",
            },
            {
              tag: "Post-ACS RCT",
              title:
                "Tardif JC, Kouz S, Waters DD, et al. Efficacy and Safety of Low-Dose Colchicine after Myocardial Infarction (COLCOT).",
              cite: "N Engl J Med. 2019;381(26):2497–2505.",
              doi: "10.1056/NEJMoa1912388",
              url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1912388",
              note: "4,745 post-MI patients; HR 0.77 for ischemic CV events, benefit largest when started <3 days post-MI.",
            },
            {
              tag: "Pilot RCT",
              title:
                "Nidorf SM, Eikelboom JW, Budgeon CA, Thompson PL. Low-dose colchicine for secondary prevention of cardiovascular disease (LoDoCo).",
              cite: "J Am Coll Cardiol. 2013;61(4):404–410.",
              doi: "10.1016/j.jacc.2012.10.027",
              url: "https://www.jacc.org/doi/10.1016/j.jacc.2012.10.027",
              note: "Original 532-patient signal that seeded LoDoCo2.",
            },
            {
              tag: "Meta-analysis",
              title:
                "Fiolet ATL, Opstal TSJ, Mosterd A, et al. Efficacy and safety of low-dose colchicine in patients with coronary disease: a systematic review and meta-analysis of randomized trials.",
              cite: "Eur Heart J. 2021;42(28):2765–2775.",
              doi: "10.1093/eurheartj/ehab115",
              url: "https://academic.oup.com/eurheartj/article/42/28/2765/6248800",
              note: "Pooled MACE reduction consistent with LoDoCo2 and COLCOT.",
            },
            {
              tag: "FDA label",
              title:
                "U.S. FDA. LODOCO (colchicine) 0.5 mg tablets — Prescribing Information. Approved June 2023 for CV risk reduction in adults with established atherosclerotic disease or multiple risk factors.",
              cite: "FDA Drug Approvals, 2023.",
              url: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/216483s000lbl.pdf",
              note: "First FDA-approved cardiovascular indication for colchicine.",
            },
            {
              tag: "Guideline",
              title:
                "Virani SS, Newby LK, Arnold SV, et al. 2023 AHA/ACC/ACCP/ASPC/NLA/PCNA Guideline for the Management of Patients With Chronic Coronary Disease.",
              cite: "Circulation. 2023;148(9):e9–e119.",
              doi: "10.1161/CIR.0000000000001168",
              url: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001168",
              note: "Class 2b recommendation to consider colchicine 0.5 mg daily in CCD.",
            },
            {
              tag: "Guideline",
              title:
                "Vrints C, Andreotti F, Koskinas KC, et al. 2024 ESC Guidelines for the management of chronic coronary syndromes.",
              cite: "Eur Heart J. 2024;45(36):3415–3537.",
              doi: "10.1093/eurheartj/ehae177",
              url: "https://academic.oup.com/eurheartj/article/45/36/3415/7743115",
              note: "Colchicine 0.5 mg daily may be considered to reduce MI, stroke, and need for revascularization (Class IIa).",
            },
          ].map((r) => (
            <li key={r.title} className="surface-panel space-y-2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                  {r.tag}
                </span>
                {r.doi && (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    DOI {r.doi}
                  </span>
                )}
              </div>
              <div className="text-sm font-medium leading-snug">{r.title}</div>
              <div className="font-mono text-xs text-muted-foreground">{r.cite}</div>
              {r.note && <div className="text-xs text-muted-foreground">{r.note}</div>}
              <a
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-primary hover:underline"
              >
                <BookOpen className="h-3.5 w-3.5" />
                View source
                <ExternalLink className="h-3 w-3" />
              </a>
            </li>
          ))}
        </ol>

        <p className="text-[11px] text-muted-foreground">
          Citations are provided for verification and continuing education. Cross-check against
          the latest full-text guideline updates before clinical application.
        </p>
      </section>
    </div>
  );
}
