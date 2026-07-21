import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Ban,
  CheckCircle2,
  Droplets,
  ExternalLink,
  Eye,
  FileText,
  Flame,
  HeartPulse,
  Info,
  Pill,
  ShieldAlert,
  Syringe,
  Thermometer,
  Zap,
} from "lucide-react";
import stellateUltrasoundAsset from "@/assets/stellate-ganglion-ultrasound.jpeg.asset.json";
import stellateSonoanatomyAsset from "@/assets/stellate-ganglion-sonoanatomy.jpeg.asset.json";

type ChecklistItem = { id: string; label: string; required: boolean };

const preChecklist: ChecklistItem[] = [
  { id: "consent", label: "Informed consent / documented indication", required: true },
  { id: "coag", label: "Coagulation status acceptable (INR/platelets reviewed)", required: true },
  {
    id: "allergy",
    label: "No local anaesthetic allergy; resuscitation cart checked",
    required: true,
  },
  {
    id: "ultrasound",
    label: "Ultrasound, sterile probe cover, high-frequency linear probe",
    required: true,
  },
  { id: "monitor", label: "Continuous monitoring: ECG, NIBP, SpO₂", required: true },
  { id: "access", label: "Peripheral IV access; airway support available", required: true },
];

const contraindicationsChecklist: ChecklistItem[] = [
  {
    id: "no_infection",
    label: "No local infection, cellulitis, or abscess over the planned insertion site",
    required: true,
  },
  {
    id: "no_pneumothorax",
    label: "No contralateral pneumothorax, significant lung disease, or pneumonectomy",
    required: true,
  },
  {
    id: "no_coagulopathy",
    label: "No uncorrected coagulopathy or severe thrombocytopenia",
    required: true,
  },
  {
    id: "no_allergy",
    label: "No known allergy to the planned local anaesthetic (e.g., amide allergy)",
    required: true,
  },
  {
    id: "able_position",
    label: "Patient can tolerate supine positioning with slight neck rotation / extension",
    required: true,
  },
  {
    id: "no_distorted_anatomy",
    label: "Neck anatomy not severely distorted by surgery, radiation, or mass (relative)",
    required: false,
  },
];

const bleedingChecklist: ChecklistItem[] = [
  {
    id: "inr",
    label: "INR reviewed and acceptable per local neuraxial/plexus policy (commonly ≤ 1.4)",
    required: false,
  },
  {
    id: "platelets",
    label: "Platelet count ≥ 50,000/µL (≥ 100,000/µL preferred) if thrombocytopenic",
    required: false,
  },
  {
    id: "anticoag_review",
    label: "Anticoagulation/antiplatelet agents reviewed; timing/reversal plan documented",
    required: true,
  },
  {
    id: "compress_obs",
    label: "Post-procedure compression site available and observation plan set",
    required: true,
  },
];

const consentChecklist: ChecklistItem[] = [
  {
    id: "indication",
    label: "Indication explained: rescue SGB for refractory VT/VF electrical storm",
    required: true,
  },
  {
    id: "benefits",
    label: "Potential benefits discussed: reduce sympathetic drive, terminate VT storm, reduce shocks",
    required: true,
  },
  {
    id: "alternatives",
    label: "Alternatives discussed: additional antiarrhythmics, sedation/analgesia, repeat DC shocks, catheter ablation, thoracic epidural",
    required: true,
  },
  {
    id: "risks",
    label: "Risks reviewed: Horner syndrome, recurrent laryngeal nerve block/hoarseness, vascular injury/hematoma, pneumothorax, brachial plexus block, LAST, seizure, cardiac arrest",
    required: true,
  },
  {
    id: "capacity",
    label: "Patient has decision-making capacity (or surrogate present) and agrees to proceed",
    required: true,
  },
];

const medications = [
  {
    name: "Bupivacaine",
    concentration: "0.25–0.5%",
    volume: "10–20 mL",
    note: "Long-acting amide; slower onset, longer duration. Watch for cardiac toxicity (LAST).",
  },
  {
    name: "Ropivacaine",
    concentration: "0.2–0.5%",
    volume: "10–20 mL",
    note: "Preferential sensory block; safer cardiac profile than bupivacaine.",
  },
  {
    name: "Lidocaine",
    concentration: "1%",
    volume: "10 mL",
    note: "Faster onset if urgent; shorter duration. Useful for diagnostic test dose.",
  },
];

const complications = [
  {
    name: "Horner syndrome",
    signs: "Ptosis, miosis, anhidrosis (ipsilateral face)",
    type: "expected",
  },
  {
    name: "Recurrent laryngeal nerve block",
    signs: "Hoarseness, dysphagia, aspiration risk",
    type: "warn",
  },
  {
    name: "Vascular injury / hematoma",
    signs: "Carotid or vertebral puncture; expanding neck mass",
    type: "danger",
  },
  {
    name: "Pneumothorax",
    signs: "Pleural puncture, sudden desaturation, chest pain",
    type: "danger",
  },
  { name: "Brachial plexus block", signs: "Arm weakness / sensory loss", type: "warn" },
  {
    name: "LAST (local anaesthetic systemic toxicity)",
    signs: "Tinnitus, perioral numbness, seizures, arrhythmia, cardiac arrest",
    type: "danger",
  },
];

const evidence = [
  {
    citation: "Tan AY et al. Circulation 2018",
    note: "Bilateral stellate ganglion blockade suppressed VT in a canine model and reduced sympathetic nerve activity.",
    href: "https://www.ahajournals.org/doi/10.1161/CIRCEP.117.005470",
  },
  {
    citation: "Meng L et al. Heart Rhythm 2018",
    note: "Ultrasound-guided stellate ganglion block terminated electrical storm in patients with refractory VT/VF.",
    href: "https://www.heartrhythmjournal.com/article/S1547-5271(18)30276-3/fulltext",
  },
  {
    citation: "Takizawa et al. J Cardiovasc Electrophysiol 2017",
    note: "Percutaneous stellate ganglion block as rescue therapy for recurrent VT storm after ICD shocks.",
    href: "https://onlinelibrary.wiley.com/doi/10.1111/jce.13252",
  },
];

function ChecklistGroup({
  items,
  checked,
  toggle,
  title,
  icon: Icon,
  colorClass,
}: {
  items: ChecklistItem[];
  checked: Record<string, boolean>;
  toggle: (id: string) => void;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass?: string;
}) {
  const isReady = items.filter((i) => i.required).every((i) => checked[i.id]);
  return (
    <div className="surface-panel space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${colorClass ?? "text-primary"}`} />
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-elevated/40 p-3 transition hover:bg-surface-elevated"
          >
            <input
              type="checkbox"
              checked={!!checked[item.id]}
              onChange={() => toggle(item.id)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{item.label}</div>
              {item.required && <div className="text-[10px] text-muted-foreground">Required</div>}
            </div>
            {item.required && !checked[item.id] && (
              <ShieldAlert className="h-4 w-4 text-destructive" />
            )}
            {item.required && checked[item.id] && <CheckCircle2 className="h-4 w-4 text-ok" />}
          </label>
        ))}
      </div>
      {isReady ? (
        <div className="flex items-center gap-2 rounded-lg border border-ok/25 bg-ok/5 p-3 text-sm text-ok">
          <CheckCircle2 className="h-4 w-4" />
          All required items complete.
        </div>
      ) : (
        <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="mb-1 h-4 w-4" />
          Complete all required items before needling.
        </div>
      )}
    </div>
  );
}

export function StellateGanglionBlock() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }));
  const ready = preChecklist.filter((i) => i.required).every((i) => checked[i.id]);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">
            Rescue therapy · Electrical storm
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Stellate Ganglion Block for arrhythmias
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Not every V-tach needs a shock. A quick ultrasound-guided stellate ganglion block can
          break the sympathetic surge driving refractory VT/VF storm — especially in patients being
          repeatedly shocked by their AICD.
        </p>
      </section>

      {/* Case vignette */}
      <section className="surface-panel border-primary/30 space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-warn" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-warn">
            Case vignette
          </span>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">
            65-year-old male · recurrent AICD shocks in V-tach storm
          </p>
          <p className="text-sm text-muted-foreground">
            He has received 8 shocks in 2 hours despite IV amiodarone, lidocaine, and deep sedation.
            The rhythm repeatedly degenerates into VT after each DC cardioversion. Catheter ablation
            is being arranged but is not immediately available. An ultrasound-guided right stellate
            ganglion block is performed with 15 mL bupivacaine 0.25%.
          </p>
        </div>
        <div className="rounded-lg border border-warn/25 bg-warn/5 p-3 text-sm">
          <span className="font-semibold text-warn">Why it fits:</span> Stellate ganglion block
          interrupts preganglionic sympathetic efferents to the heart, reducing myocardial
          catecholamine drive and suppressing triggered activity in electrically unstable
          myocardium.
        </div>
      </section>

      {/* Decision protocol: when to block vs shock */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Decision protocol</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Block first, or shock again?</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="surface-panel space-y-3 border-ok/25">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-ok" />
              <span className="font-semibold text-sm">Consider SGB now</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ok" />
                <span>≥3 appropriate AICD shocks in ≤1 hour or electrical storm</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ok" />
                <span>VT/VF recurs despite IV amiodarone ± lidocaine and sedation</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ok" />
                <span>Hemodynamics tolerated enough to allow a 10–15 min procedure</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ok" />
                <span>
                  Operator trained in ultrasound-guided neck blocks, airway support present
                </span>
              </li>
            </ul>
          </div>
          <div className="surface-panel space-y-3 border-destructive/25">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-destructive" />
              <span className="font-semibold text-sm">Keep shocking / escalate instead</span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-destructive" />
                <span>
                  Unstable VT with pulse: syncopal, hypotensive, or rapidly decompensating
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-destructive" />
                <span>Untrained operator, no monitoring, or no airway/resuscitation backup</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-destructive" />
                <span>
                  Uncorrected coagulopathy, local infection, or contralateral pneumothorax
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-destructive" />
                <span>Patient unable to lie supine or cooperate for neck block</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface-elevated/40 p-3 text-sm text-muted-foreground">
          <ArrowRight className="mb-1 inline h-4 w-4 text-primary" />
          <strong className="text-foreground"> Practical rule:</strong> Do not delay life-saving DC
          shocks for an unstable patient. In a tolerated electrical storm, however, every additional
          shock fuels catecholamine surge and myocardial injury — that is the window where SGB often
          breaks the cycle.
        </div>
      </section>

      {/* Pre-procedure checklist */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Pre-procedure safety</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Checklist before needling</h2>
        <div className="surface-panel space-y-3">
          {preChecklist.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-elevated/40 p-3 transition hover:bg-surface-elevated"
            >
              <input
                type="checkbox"
                checked={!!checked[item.id]}
                onChange={() => toggle(item.id)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{item.label}</div>
                {item.required && <div className="text-[10px] text-muted-foreground">Required</div>}
              </div>
              {item.required && !checked[item.id] && (
                <ShieldAlert className="h-4 w-4 text-destructive" />
              )}
              {item.required && checked[item.id] && <CheckCircle2 className="h-4 w-4 text-ok" />}
            </label>
          ))}
          {!ready && (
            <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="mb-1 h-4 w-4" />
              Complete all required items before proceeding.
            </div>
          )}
          {ready && (
            <div className="flex items-center gap-2 rounded-lg border border-ok/25 bg-ok/5 p-3 text-sm text-ok">
              <CheckCircle2 className="h-4 w-4" />
              All required safety checks complete. Proceed with ultrasound-guided block.
            </div>
          )}
        </div>
      </section>

      {/* Anatomy & ultrasound */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Anatomy & ultrasound</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">What you are looking for</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="surface-panel space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
              Key landmarks
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="text-foreground">SCM</strong> — sternocleidomastoid muscle,
                  superficial layer.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="text-foreground">IJ</strong> — internal jugular vein,
                  compressible.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="text-foreground">CA</strong> — carotid artery, pulsatile,
                  non-compressible.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="text-foreground">Longus colli m.</strong> — deep prevertebral
                  muscle; the stellate ganglion sits just anterior to it at C6/C7.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>
                  <strong className="text-foreground">Stellate ganglion</strong> — fusion of
                  inferior cervical and first thoracic ganglia.
                </span>
              </li>
            </ul>
            <div className="rounded-lg border border-warn/25 bg-warn/5 p-3 text-sm text-warn">
              <Info className="mb-1 h-4 w-4" />
              Keep the needle lateral to the carotid sheath and avoid the vertebral artery.
              Pneumothorax risk rises below C7.
            </div>
          </div>
          <div className="space-y-4">
            <div className="surface-panel overflow-hidden p-0">
              <img
                src={stellateSonoanatomyAsset.url}
                alt="Sonoanatomy and block target: SCM, IJV, carotid artery, prevertebral fascia, longus colli muscle, and stellate ganglion at C6 transverse process"
                className="h-auto w-full object-cover"
                loading="lazy"
              />
              <div className="p-3 text-[11px] text-muted-foreground">
                Sonoanatomy and block target at C6. Left: SCM, IJV, carotid artery (CA),
                prevertebral fascia, longus colli, and stellate ganglion. Right: needle target deep
                to the prevertebral fascia, lateral to the carotid sheath.
              </div>
            </div>
            <div className="surface-panel overflow-hidden p-0">
              <img
                src={stellateUltrasoundAsset.url}
                alt="Ultrasound of right stellate ganglion: SCM, IJ, carotid artery, longus colli, and stellate ganglion labelled"
                className="h-auto w-full object-cover"
                loading="lazy"
              />
              <div className="p-3 text-[11px] text-muted-foreground">
                RT STELLATE ultrasound view. SCM = sternocleidomastoid; IJ = internal jugular vein;
                CA = carotid artery; Longus Colli m. = prevertebral muscle; asterisks mark the
                stellate ganglion.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-step */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Procedure</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Step-by-step block</h2>
        <ol className="space-y-3">
          {[
            {
              n: 1,
              title: "Position and scan",
              text: "Supine, head slightly rotated away. Place high-frequency linear probe transversely at the level of the cricoid cartilage (C6).",
              icon: Activity,
            },
            {
              n: 2,
              title: "Identify the column",
              text: "From superficial to deep: SCM → IJ/CA → anterior scalene → prevertebral fascia → longus colli. The stellate ganglion lies anterior to longus colli, deep to the carotid sheath.",
              icon: Eye,
            },
            {
              n: 3,
              title: "Skin prep and needle entry",
              text: "Sterile prep, drape, local skin wheal with lidocaine. Use an in-plane approach from the lateral side, aiming toward the prevertebral fascia over longus colli.",
              icon: Syringe,
            },
            {
              n: 4,
              title: "Inject local anaesthetic",
              text: "Hydro-dissect under the prevertebral fascia with 10–20 mL of bupivacaine 0.25% or ropivacaine 0.2%. Aspirate before each incremental injection.",
              icon: Pill,
            },
            {
              n: 5,
              title: "Assess effect and monitor",
              text: "Watch for Horner signs (ptosis, miosis, anhidrosis) ipsilateral to the block within 5–15 min. Continue ECG, NIBP, and SpO₂ monitoring for at least 30–60 min. If VT persists after 15–20 min, consider bilateral block or escalation to thoracic epidural / general anaesthesia.",
              icon: Thermometer,
            },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <li key={step.n} className="surface-panel flex items-start gap-4 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
                    Step {step.n}
                  </div>
                  <h3 className="mt-0.5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                </div>
                <ArrowRight className="mt-4 h-4 w-4 shrink-0 text-muted-foreground" />
              </li>
            );
          })}
        </ol>
      </section>

      {/* Monitoring before / during / after */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Monitoring</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Before, during, and after the block
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="surface-panel space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
              Before
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>Confirm continuous ECG, NIBP, pulse oximetry</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>Review coagulation status and anticoagulation plan</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>
                  Ensure working peripheral IV, defibrillator, airway cart, lipid emulsion
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>Baseline neuro exam and voice (recurrent laryngeal baseline)</span>
              </li>
            </ul>
          </div>
          <div className="surface-panel space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
              During
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>Watch the ECG rhythm continuously — VT may terminate mid-procedure</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>Monitor BP every 2–5 min; watch for hypotension from sympathectomy</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>Aspirate before each incremental injection; watch for vascular uptake</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>Ask patient to report tinnitus, perioral numbness, or metallic taste</span>
              </li>
            </ul>
          </div>
          <div className="surface-panel space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-primary">After</div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>Document Horner syndrome signs (ptosis, miosis, anhidrosis)</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>Monitor BP, SpO₂, rhythm for 30–60 min in recovery area</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>Reassess for hoarseness, dysphagia, or arm weakness</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                <span>Repeat ECG, check for recurrence; escalate if storm persists</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Medication table */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Medication</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Local anaesthetic options</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {medications.map((m) => (
            <div key={m.name} className="surface-panel space-y-2">
              <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
                {m.name}
              </div>
              <div className="text-2xl font-semibold">{m.volume}</div>
              <div className="text-sm font-medium text-primary">{m.concentration}</div>
              <p className="text-xs text-muted-foreground">{m.note}</p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border bg-surface-elevated/40 p-3 text-sm text-muted-foreground">
          <HeartPulse className="mb-1 inline h-4 w-4 text-primary" />
          <strong className="text-foreground"> Typical cardiac rescue dose:</strong> 10–20 mL per
          side of a long-acting amide. Do not exceed maximum local anaesthetic doses; keep lipid
          emulsion (20% intralipid) immediately available.
        </div>
      </section>

      {/* Complications */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Complications</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">What to watch for</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {complications.map((c) => (
            <div
              key={c.name}
              className={`rounded-xl border p-4 ${
                c.type === "danger"
                  ? "border-destructive/25 bg-destructive/5"
                  : c.type === "warn"
                    ? "border-warn/25 bg-warn/5"
                    : "border-border bg-surface-elevated/40"
              }`}
            >
              <div className="flex items-center gap-2">
                {c.type === "danger" ? (
                  <Zap className="h-4 w-4 text-destructive" />
                ) : c.type === "warn" ? (
                  <AlertTriangle className="h-4 w-4 text-warn" />
                ) : (
                  <Eye className="h-4 w-4 text-primary" />
                )}
                <span className="font-semibold text-sm">{c.name}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{c.signs}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Evidence */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Evidence</span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">Why it works in VT storm</h2>
        <div className="space-y-3">
          {evidence.map((e) => (
            <div key={e.citation} className="surface-panel space-y-2">
              <div className="text-sm font-medium">{e.note}</div>
              <a
                href={e.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                {e.citation}
              </a>
            </div>
          ))}
        </div>
      </section>

      <p className="text-[11px] text-muted-foreground">
        Educational reference only. Stellate ganglion block for electrical storm should be performed
        by clinicians trained in regional anaesthesia/ultrasound-guided neck blocks, with airway and
        resuscitation support immediately available. Always follow local protocols and institutional
        privileges.
      </p>
    </div>
  );
}
