import { useState } from "react";
import {
  ClipboardList,
  Timer,
  Pill,
  ShieldAlert,
  Activity,
  CheckCircle2,
  ChevronDown,
  Calculator,
} from "lucide-react";
import { HUTTDoseCalculator } from "./HUTTDoseCalculator";


type ProtocolKey = "standard" | "italian";

const PROTOCOLS: Record<
  ProtocolKey,
  {
    name: string;
    subtitle: string;
    accent: string;
    passive: { angle: string; duration: string; notes: string };
    provocation: {
      agent: string;
      dose: string;
      route: string;
      duration: string;
      notes: string;
    }[];
    totalTime: string;
    endpoint: string;
    references: string;
    citations: { label: string; url: string }[];
  }
> = {
  standard: {
    name: "Standard (Westminster) Protocol",
    subtitle: "ESC-endorsed passive tilt + nitroglycerin provocation",
    accent: "from-rose-500/20 to-amber-500/10",
    passive: {
      angle: "60°–70° head-up",
      duration: "20 minutes",
      notes:
        "Continuous ECG, beat-to-beat BP (Finapres/Nexfin) or ≥ q1 min cuff BP. Quiet, dim room; NPO ≥ 2 h; supine rest ≥ 5–10 min before tilt.",
    },
    provocation: [
      {
        agent: "Nitroglycerin (GTN)",
        dose: "400 mcg (1 spray) sublingual",
        route: "Sublingual spray",
        duration: "Observe up to 15–20 minutes further",
        notes:
          "Given at end of passive phase if no diagnostic event. Patient remains tilted at 60–70°.",
      },
    ],
    totalTime: "≈ 35–40 minutes tilted",
    endpoint:
      "Syncope/near-syncope with reproduction of symptoms + characteristic BP/HR pattern (VASIS 1–3), OTS, POTS, or completion without event.",
    references: "ESC 2018 Syncope Guidelines; Brignole et al.",
    citations: [
      {
        label: "ESC 2018 Syncope Guidelines (Eur Heart J)",
        url: "https://academic.oup.com/eurheartj/article/39/21/1883/4939241",
      },
      {
        label: "Brignole et al. — VASIS classification (Europace 2000)",
        url: "https://pubmed.ncbi.nlm.nih.gov/11225598/",
      },
      {
        label: "Westminster protocol — Fitzpatrick et al., JACC 1991",
        url: "https://pubmed.ncbi.nlm.nih.gov/1901083/",
      },
    ],
  },
  italian: {
    name: "Italian Protocol",
    subtitle: "Shortened passive phase + early sublingual GTN",
    accent: "from-emerald-500/20 to-sky-500/10",
    passive: {
      angle: "60° head-up",
      duration: "20 minutes",
      notes:
        "Same monitoring: continuous ECG + beat-to-beat BP. Emphasis on shorter total study time and higher patient throughput.",
    },
    provocation: [
      {
        agent: "Nitroglycerin (GTN)",
        dose: "300–400 mcg sublingual",
        route: "Sublingual spray/tablet",
        duration: "15 minutes further tilted",
        notes:
          "Given if passive phase is negative. Patient stays at 60°. Slightly higher positivity rate vs Westminster with comparable specificity.",
      },
    ],
    totalTime: "≈ 35 minutes tilted",
    endpoint:
      "Same VASIS classification. Italian protocol validated by Bartoletti et al. for improved sensitivity in reflex syncope.",
    references: "Bartoletti A, et al. Europace 2000; ESC 2018.",
    citations: [
      {
        label: "Bartoletti A, et al. — 'Italian' shortened GTN protocol (Europace 2000)",
        url: "https://pubmed.ncbi.nlm.nih.gov/11225599/",
      },
      {
        label: "ESC 2018 Syncope Guidelines (Eur Heart J)",
        url: "https://academic.oup.com/eurheartj/article/39/21/1883/4939241",
      },
      {
        label: "Sutton R, Brignole M — Tilt-testing methodology review",
        url: "https://pubmed.ncbi.nlm.nih.gov/24614482/",
      },
    ],
  },
};

const SHARED_SETUP = [
  "Fasting ≥ 2 hours; light meal permitted earlier",
  "Withhold vasoactive drugs when clinically safe (β-blocker, nitrates, α-blockers)",
  "IV access (18–20 G) for emergencies — no routine fluids",
  "Straps at knees and pelvis; footboard weight-bearing",
  "Supine baseline 5–10 min: HR, BP, ECG rhythm",
  "Emergency cart, atropine, IV fluids, reverse-Trendelenburg capability",
];

const VASIS = [
  {
    type: "VASIS 1 — Mixed",
    detail: "HR falls but ≥ 40 bpm, or < 40 bpm for < 10 s. BP falls before HR.",
  },
  {
    type: "VASIS 2A — Cardioinhibitory w/o asystole",
    detail: "HR < 40 bpm for > 10 s, no asystole > 3 s. BP falls before HR.",
  },
  {
    type: "VASIS 2B — Cardioinhibitory with asystole",
    detail: "Asystole > 3 s. BP fall coincides with or follows HR fall.",
  },
  { type: "VASIS 3 — Vasodepressor", detail: "HR falls < 10% from peak at syncope. Pure BP drop." },
  {
    type: "Exception — Chronotropic incompetence",
    detail: "No HR rise (< 10%) during tilt.",
  },
  {
    type: "POTS",
    detail: "HR rise ≥ 30 bpm (≥ 40 in adolescents) within 10 min, without orthostatic hypotension.",
  },
  {
    type: "Orthostatic hypotension",
    detail: "SBP drop ≥ 20 or DBP ≥ 10 within 3 min of tilt.",
  },
];

type MedDetail = {
  dose: string;
  infusion?: string;
  admin: string[];
  monitoring: string;
};

const MEDS: {
  name: string;
  role: string;
  onset: string;
  duration: string;
  caution: string;
  standard: MedDetail;
  italian: MedDetail;
  citations?: { label: string; url: string }[];
}[] = [
  {
    name: "Nitroglycerin (GTN)",
    role: "Pharmacologic provocation",
    onset: "1–3 min",
    duration: "3–5 min",
    caution:
      "Avoid if SBP < 90 mmHg, severe AS/HOCM, RV infarct, or PDE5 inhibitor use within 24 h (sildenafil) / 48 h (tadalafil).",
    standard: {
      dose: "400 mcg (1 metered spray) sublingual — single dose",
      admin: [
        "Given at end of 20-min passive phase if no diagnostic event",
        "Patient remains upright at 60–70° for 15–20 min further",
        "1 spray under the tongue, mouth closed, no swallow for 10 s",
        "Do NOT repeat dose",
      ],
      monitoring:
        "Continuous ECG + beat-to-beat BP. Record symptoms, HR, BP every 1 min until endpoint or 20 min.",
    },
    italian: {
      dose: "300–400 mcg sublingual (spray or 0.3 mg tablet) — single dose",
      admin: [
        "Given at end of 20-min passive phase (tilt maintained at 60°)",
        "Observation limited to 15 min post-GTN (shorter than Westminster)",
        "Single spray/tablet SL — no repeat",
        "Same holding-position and swallow rules as Standard",
      ],
      monitoring:
        "Continuous ECG + beat-to-beat BP; strict 15-min cut-off improves throughput without loss of specificity (Bartoletti 2000).",
    },
    citations: [
      {
        label: "Raviele A, et al. — SL nitroglycerin tilt protocol (Am J Cardiol 1995)",
        url: "https://pubmed.ncbi.nlm.nih.gov/7900654/",
      },
      {
        label: "Bartoletti A, et al. — 'Italian' shortened GTN protocol (Europace 2000)",
        url: "https://pubmed.ncbi.nlm.nih.gov/11225599/",
      },
    ],
  },
  {
    name: "Isoproterenol",
    role: "Alternative β-agonist provocation",
    onset: "2–5 min",
    duration: "10–15 min after stop",
    caution:
      "Avoid in CAD, prior MI, tachyarrhythmia, hyperthyroidism, uncontrolled HTN, age > 50 (relative). Largely replaced by GTN in both protocols.",
    standard: {
      dose: "IV infusion 1 → 3 mcg/min, titrated to HR increase of 20–25% above baseline",
      infusion:
        "Mix 1 mg (5 mL of 1:5000) in 250 mL D5W → 4 mcg/mL. Start 15 mL/h (~1 mcg/min); titrate by 15 mL/h every 5 min. Max 3 mcg/min.",
      admin: [
        "Dedicated IV line; infusion pump mandatory",
        "Give at each dose step for ≥ 5 min while tilted at 60–70°",
        "Stop infusion immediately on syncope, VT, SBP < 70, or HR > 150",
        "Return patient supine before restarting",
      ],
      monitoring: "Continuous ECG, BP every 1 min, SpO₂. Have β-blocker (esmolol) available.",
    },
    italian: {
      dose: "Not part of the standard Italian protocol; GTN preferred",
      infusion: "If used: 1–2 mcg/min IV, titrate to HR +25% — same mixing as Standard",
      admin: [
        "Reserved for GTN contraindication or repeat non-diagnostic study",
        "Same pump-based titration and stop rules as Standard",
      ],
      monitoring: "Same as Standard.",
    },
    citations: [
      {
        label: "Almquist A, et al. — Isoproterenol tilt testing (NEJM 1989)",
        url: "https://pubmed.ncbi.nlm.nih.gov/2586562/",
      },
      {
        label: "Kapoor WN, Brant N — Evaluation of syncope by upright tilt (Ann Intern Med 1992)",
        url: "https://pubmed.ncbi.nlm.nih.gov/1543309/",
      },
    ],
  },
  {
    name: "Atropine",
    role: "Rescue — symptomatic bradycardia / asystole",
    onset: "< 1 min IV",
    duration: "30–60 min",
    caution: "Paradoxical bradycardia if dose < 0.5 mg. Avoid in narrow-angle glaucoma.",
    standard: {
      dose: "0.5–1 mg IV push; may repeat every 3–5 min to max 3 mg",
      admin: [
        "Draw up 1 mg (10 mL of 0.1 mg/mL) at start of study — kept at bedside",
        "Give IV push over 15–30 s through a running line, then 10 mL NS flush",
        "Return patient to supine/Trendelenburg first",
        "Prepare transcutaneous pacing if HR does not respond after 2 mg",
      ],
      monitoring: "ECG rhythm continuously; recheck HR/BP at 1, 3, 5 min.",
    },
    italian: {
      dose: "Same — 0.5–1 mg IV push, repeat q3–5 min to 3 mg max",
      admin: ["Identical to Standard — no protocol-specific difference"],
      monitoring: "Same as Standard.",
    },
    citations: [
      {
        label: "ACLS bradycardia algorithm — atropine 0.5–1 mg IV (AHA 2020)",
        url: "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines",
      },
    ],
  },
  {
    name: "Normal saline 0.9%",
    role: "Rescue — post-tilt hypotension",
    onset: "Immediate (volume)",
    duration: "Transient",
    caution: "Use caution in heart failure / severe AS; smaller aliquots (100–250 mL).",
    standard: {
      dose: "250–500 mL IV bolus; may repeat once (max 1 L)",
      infusion: "Wide-open through 18–20 G peripheral IV; pressure bag if needed",
      admin: [
        "Return patient fully supine or Trendelenburg first",
        "Give bolus over 5–10 min",
        "Reassess SBP and mental status after each 250 mL",
      ],
      monitoring: "BP q1 min, lung auscultation, SpO₂ before/after each bolus.",
    },
    italian: {
      dose: "Same — 250–500 mL IV, repeat to 1 L",
      admin: ["Identical to Standard — no protocol-specific difference"],
      monitoring: "Same as Standard.",
    },
    citations: [
      {
        label: "ESC 2018 Syncope Guidelines — tilt rescue with IV fluids",
        url: "https://academic.oup.com/eurheartj/article/39/21/1883/4939241",
      },
    ],
  },
  {
    name: "Phenylephrine",
    role: "Refractory hypotension after volume + supine",
    onset: "1 min IV",
    duration: "5–20 min (bolus)",
    caution:
      "Pure α-agonist → reflex bradycardia; avoid in severe HTN, closed-angle glaucoma, severe AS.",
    standard: {
      dose: "Bolus: 50–200 mcg IV every 10–15 min PRN",
      infusion:
        "If needed: 10 mg in 100 mL NS (100 mcg/mL). Start 0.5 mcg/kg/min (~ 20 mL/h for 70 kg); titrate to MAP ≥ 65.",
      admin: [
        "Bolus: dilute 10 mg in 100 mL NS (100 mcg/mL); give 0.5–2 mL IV push",
        "Central line preferred for infusion; large peripheral acceptable short-term",
        "Wean as soon as BP restored; typically not needed if supine positioning works",
      ],
      monitoring: "Arterial line or q1-min NIBP; watch for reflex bradycardia — atropine ready.",
    },
    italian: {
      dose: "Same — 50–200 mcg IV bolus PRN",
      admin: ["Identical to Standard — no protocol-specific difference"],
      monitoring: "Same as Standard.",
    },
  },
];


function Section({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border bg-surface/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface/70 transition"
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
            open ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function HUTTProtocolReference() {
  const [active, setActive] = useState<ProtocolKey>("standard");
  const p = PROTOCOLS[active];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-semibold tracking-tight">Study setup & protocol reference</h2>
        <div className="inline-flex rounded-lg border border-border bg-surface/50 p-1 text-xs">
          {(Object.keys(PROTOCOLS) as ProtocolKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setActive(k)}
              className={`px-3 py-1.5 rounded-md transition font-medium ${
                active === k
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {PROTOCOLS[k].name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`rounded-xl border border-border bg-gradient-to-br ${p.accent} p-4 backdrop-blur`}
      >
        <div className="text-xs font-mono uppercase tracking-wider text-primary">
          {active === "standard" ? "Westminster" : "Italian"} protocol
        </div>
        <h3 className="mt-1 text-lg font-semibold">{p.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{p.subtitle}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm">
          <div className="rounded-lg bg-background/40 p-3">
            <div className="text-[11px] uppercase text-muted-foreground">Tilt angle</div>
            <div className="mt-1 font-semibold">{p.passive.angle}</div>
          </div>
          <div className="rounded-lg bg-background/40 p-3">
            <div className="text-[11px] uppercase text-muted-foreground">Passive phase</div>
            <div className="mt-1 font-semibold">{p.passive.duration}</div>
          </div>
          <div className="rounded-lg bg-background/40 p-3">
            <div className="text-[11px] uppercase text-muted-foreground">Total tilted</div>
            <div className="mt-1 font-semibold">{p.totalTime}</div>
          </div>
        </div>
      </div>

      <Section title="Pre-test setup & monitoring" icon={ClipboardList}>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {SHARED_SETUP.map((s) => (
            <li key={s} className="flex gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">{p.passive.notes}</p>
      </Section>

      <Section title="Phase timing" icon={Timer}>
        <ol className="space-y-3 text-sm">
          <li className="rounded-lg border border-border bg-background/40 p-3">
            <div className="font-semibold">1. Supine baseline</div>
            <div className="text-muted-foreground">5–10 min. Record HR, BP, rhythm.</div>
          </li>
          <li className="rounded-lg border border-border bg-background/40 p-3">
            <div className="font-semibold">2. Passive tilt</div>
            <div className="text-muted-foreground">
              {p.passive.angle} · {p.passive.duration}. Continuous ECG + beat-to-beat BP.
            </div>
          </li>
          <li className="rounded-lg border border-border bg-background/40 p-3">
            <div className="font-semibold">3. Pharmacologic provocation (if negative)</div>
            {p.provocation.map((m) => (
              <div key={m.agent} className="text-muted-foreground">
                {m.agent} {m.dose} — observe {m.duration}.
              </div>
            ))}
          </li>
          <li className="rounded-lg border border-border bg-background/40 p-3">
            <div className="font-semibold">4. Recovery</div>
            <div className="text-muted-foreground">
              Return supine immediately on syncope/pre-syncope. Monitor 5–10 min until HR/BP baseline.
            </div>
          </li>
        </ol>
      </Section>

      <Section title={`Medications — ${active === "standard" ? "Standard" : "Italian"} protocol`} icon={Pill}>
        <div className="grid gap-3">
          {MEDS.map((m) => {
            const d = active === "standard" ? m.standard : m.italian;
            return (
              <div
                key={m.name}
                className="rounded-lg border border-border bg-background/40 p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.role}</div>
                  </div>
                  <div className="text-[11px] font-mono uppercase text-muted-foreground">
                    Onset {m.onset} · Duration {m.duration}
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-sm">
                  <div>
                    <span className="text-[11px] uppercase text-muted-foreground">Dose</span>
                    <div className="font-mono text-xs mt-0.5">{d.dose}</div>
                  </div>
                  {d.infusion && (
                    <div>
                      <span className="text-[11px] uppercase text-muted-foreground">
                        Infusion / mixing
                      </span>
                      <div className="font-mono text-xs mt-0.5">{d.infusion}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] uppercase text-muted-foreground">
                      Administration
                    </span>
                    <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground list-disc pl-5">
                      {d.admin.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase text-muted-foreground">Monitoring</span>
                    <div className="text-xs text-muted-foreground mt-0.5">{d.monitoring}</div>
                  </div>
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/5 px-2 py-1.5 text-xs text-amber-600 dark:text-amber-400">
                    <strong>Caution:</strong> {m.caution}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Dose & infusion calculator (optional)" icon={Calculator} defaultOpen={false}>
        <HUTTDoseCalculator />
      </Section>

      <Section title="VASIS classification & endpoints" icon={Activity}>

        <ul className="space-y-2 text-sm">
          {VASIS.map((v) => (
            <li key={v.type} className="rounded-lg border border-border bg-background/40 p-3">
              <div className="font-semibold">{v.type}</div>
              <div className="text-muted-foreground text-xs mt-0.5">{v.detail}</div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          <strong className="text-foreground">Positive endpoint:</strong> {p.endpoint}
        </p>
      </Section>

      <Section title="Safety, contraindications & stopping rules" icon={ShieldAlert} defaultOpen={false}>
        <div className="grid gap-3 md:grid-cols-2 text-sm">
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3">
            <div className="text-xs uppercase font-semibold text-destructive">
              Contraindications
            </div>
            <ul className="mt-1 space-y-1 text-muted-foreground list-disc pl-5">
              <li>Critical aortic stenosis, HOCM with severe LVOT obstruction</li>
              <li>Critical proximal coronary or cerebrovascular stenosis</li>
              <li>Recent (&lt; 2 wk) MI or unstable angina</li>
              <li>Uncontrolled arrhythmia or severe hypotension</li>
              <li>Pregnancy (relative — for GTN provocation)</li>
              <li>PDE5 inhibitor within 24–48 h (nitrate contraindication)</li>
            </ul>
          </div>
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3">
            <div className="text-xs uppercase font-semibold text-amber-500">Stop criteria</div>
            <ul className="mt-1 space-y-1 text-muted-foreground list-disc pl-5">
              <li>Syncope or reproduction of clinical symptoms</li>
              <li>Sustained asystole &gt; 3 s or complete heart block</li>
              <li>Sustained VT or hemodynamically significant arrhythmia</li>
              <li>SBP &lt; 70 mmHg with symptoms</li>
              <li>Patient request or intolerance</li>
            </ul>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{p.references}</p>
      </Section>
    </div>
  );
}
