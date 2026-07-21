// Cardiac algorithm & reference data
// Source: user-provided clinical JSON. For educational use only.

export type Algorithm = {
  id: string;
  name: string;
  summary: string;
  context?: string;
  sections: Section[];
};

export type Section = {
  id: string;
  label: string;
  kind?: "step" | "branch" | "loop" | "info";
  criteria?: Record<string, string | number | boolean>;
  actions?: string[];
  details?: Record<string, string | number | boolean>;
  parameters?: Record<string, string | number>;
  branches?: { label: string; goto: string; tone?: "danger" | "warn" | "ok" }[];
  loop?: {
    cycle_minutes: number;
    sequence: {
      action: string;
      drug?: string;
      dose?: string;
      duration_minutes?: number;
      options?: { drug: string; dose_sequence: string[] }[];
      parameters?: Record<string, string | number>;
      details?: Record<string, string | number | boolean>;
      indication?: string;
    }[];
  };
  notes?: string[];
};

export const hsAndTs = [
  "Hypovolemia",
  "Hypoxia",
  "Hydrogen ion (acidosis)",
  "Hypo-/Hyperkalemia",
  "Hypothermia",
  "Tension pneumothorax",
  "Cardiac tamponade",
  "Toxins",
  "Thrombosis (pulmonary)",
  "Thrombosis (coronary)",
];

export const algorithms: Algorithm[] = [
  {
    id: "code-blue",
    name: "Adult Code Blue — Cardiac Arrest",
    summary: "In-hospital adult cardiac arrest: high-quality CPR, defibrillation, ACLS drugs.",
    context: "Unresponsive · No normal breathing · No pulse",
    sections: [
      {
        id: "initial_assessment",
        label: "1. Initial Code Blue Response",
        actions: [
          "Activate the Code Blue team",
          "Start high-quality CPR immediately",
          "Attach monitor / defibrillator",
          "Provide oxygen",
          "Establish IV or IO access",
        ],
        details: {
          "CPR rate": "100–120 / min",
          "Compression depth": "≥ 5 cm",
          "Compression : ventilation": "30 : 2 (no advanced airway)",
        },
      },
      {
        id: "rhythm_check_1",
        label: "2. First Rhythm Check",
        kind: "branch",
        branches: [
          { label: "Shockable — VF / pulseless VT", goto: "shockable_path", tone: "danger" },
          { label: "Non-shockable — Asystole / PEA", goto: "nonshockable_path", tone: "warn" },
        ],
      },
      {
        id: "shockable_path",
        label: "Shockable Rhythm (VF / pVT) — 2-min cycles",
        kind: "loop",
        loop: {
          cycle_minutes: 2,
          sequence: [
            {
              action: "Deliver defibrillation shock",
              parameters: { biphasic: "120–200 J (or max)", monophasic: "360 J" },
            },
            { action: "Resume CPR immediately", duration_minutes: 2 },
            {
              action: "Vasopressor",
              drug: "Epinephrine",
              dose: "1 mg IV/IO every 3–5 min",
            },
            {
              action: "Consider antiarrhythmic (refractory VF/pVT)",
              options: [
                { drug: "Amiodarone", dose_sequence: ["300 mg IV/IO bolus", "150 mg IV/IO"] },
                {
                  drug: "Lidocaine",
                  dose_sequence: ["1–1.5 mg/kg IV/IO", "0.5–0.75 mg/kg IV/IO"],
                },
              ],
            },
            {
              action: "Advanced airway + capnography",
              details: { "Ventilation rate": "10 / min", Compressions: "continuous" },
            },
            { action: "Search for reversible causes (Hs & Ts)" },
          ],
        },
      },
      {
        id: "nonshockable_path",
        label: "Non-shockable Rhythm (Asystole / PEA) — 2-min cycles",
        kind: "loop",
        loop: {
          cycle_minutes: 2,
          sequence: [
            { action: "Continue CPR", duration_minutes: 2 },
            { action: "Vasopressor", drug: "Epinephrine", dose: "1 mg IV/IO every 3–5 min" },
            {
              action: "Advanced airway + capnography",
              details: { "Ventilation rate": "10 / min", Compressions: "continuous" },
            },
            { action: "Search for reversible causes (Hs & Ts)" },
          ],
        },
      },
      {
        id: "rosc_care",
        label: "Post-ROSC Care",
        actions: [
          "Optimize oxygenation and ventilation",
          "Maintain systolic BP above threshold",
          "Obtain 12-lead ECG",
          "Consider coronary reperfusion",
          "Initiate targeted temperature management",
          "Admit to ICU for monitoring",
        ],
      },
    ],
  },
  {
    id: "tachycardia",
    name: "Adult Tachycardia With a Pulse",
    summary: "Rate > 150 bpm — determine stability, then rhythm-guided therapy.",
    context: "HR > 150 bpm with pulse",
    sections: [
      {
        id: "tachy_initial",
        label: "1. Assess Tachycardia",
        criteria: { "Tachycardia threshold": "≥ 150 bpm" },
        actions: [
          "Obtain 12-lead ECG",
          "Check vitals & mental status",
          "Identify QRS width and regularity",
        ],
      },
      {
        id: "tachy_stability_check",
        label: "2. Is the patient unstable?",
        kind: "branch",
        notes: [
          "Instability: hypotension, altered mental status, shock, ischemic chest pain, acute HF",
        ],
        branches: [
          {
            label: "Unstable → Synchronized cardioversion",
            goto: "tachy_immediate_cardioversion",
            tone: "danger",
          },
          { label: "Stable → Rhythm-guided management", goto: "tachy_rhythm_guided", tone: "ok" },
        ],
      },
      {
        id: "tachy_immediate_cardioversion",
        label: "Immediate Synchronized Cardioversion",
        actions: [
          "Prepare synchronized cardioversion",
          "Sedate if time allows",
          "Select energy based on rhythm",
        ],
        parameters: {
          "Regular narrow": "50–100 J",
          "Irregular narrow (AFib)": "120–200 J",
          "Monomorphic VT": "100–200 J",
        },
      },
      {
        id: "tachy_rhythm_guided",
        label: "Stable — Rhythm-Guided Management",
        kind: "branch",
        branches: [
          { label: "Sinus tachycardia", goto: "tachy_sinus" },
          { label: "SVT (narrow, regular)", goto: "tachy_svt" },
          { label: "Atrial fib / flutter", goto: "tachy_afl_afib" },
          { label: "Monomorphic VT", goto: "tachy_monomorphic_vt", tone: "warn" },
          { label: "Polymorphic VT / Torsades", goto: "tachy_torsades", tone: "danger" },
        ],
      },
      {
        id: "tachy_sinus",
        label: "Sinus Tachycardia",
        actions: ["Identify and treat underlying cause"],
        notes: ["Common causes: hypovolemia, fever, pain, anxiety, sepsis, PE, hyperthyroidism"],
      },
      {
        id: "tachy_svt",
        label: "Narrow-Complex SVT",
        criteria: { QRS: "< 120 ms", Rhythm: "regular" },
        actions: [
          "Vagal maneuvers",
          "Adenosine 6 mg rapid IV push",
          "If no response → Adenosine 12 mg",
          "Consider beta-blocker or non-DHP CCB",
          "Synchronized cardioversion if refractory or unstable",
        ],
      },
      {
        id: "tachy_afl_afib",
        label: "Atrial Flutter / Fibrillation",
        actions: [
          "Rate control with beta-blocker or non-DHP CCB",
          "Consider rhythm control / cardioversion based on duration & thromboembolic risk",
          "Evaluate anticoagulation need (CHA₂DS₂-VASc)",
        ],
      },
      {
        id: "tachy_monomorphic_vt",
        label: "Monomorphic VT (Stable)",
        actions: [
          "Expert consultation",
          "Antiarrhythmic infusion",
          "Prepare for cardioversion if worsening",
        ],
        notes: [
          "Options: Amiodarone 150 mg over 10 min · Procainamide infusion · Sotalol infusion",
        ],
      },
      {
        id: "tachy_torsades",
        label: "Polymorphic VT / Torsades de Pointes",
        actions: [
          "Magnesium sulfate IV",
          "Overdrive pacing or isoproterenol if bradycardia-related",
          "Avoid QT-prolonging drugs",
          "Unsynchronized shock if hemodynamically unstable",
        ],
      },
    ],
  },
  {
    id: "bradycardia",
    name: "Adult Bradycardia With a Pulse",
    summary: "HR < 50 bpm — treat only if symptomatic.",
    context: "HR < 50 bpm with pulse",
    sections: [
      {
        id: "brady_initial",
        label: "1. Assess Bradycardia",
        criteria: { "Bradycardia threshold": "< 50 bpm" },
        actions: ["Obtain 12-lead ECG", "Assess symptoms & perfusion"],
      },
      {
        id: "brady_stability_check",
        label: "2. Is bradycardia causing symptoms?",
        kind: "branch",
        branches: [
          { label: "Symptomatic → Treat", goto: "brady_treat", tone: "danger" },
          { label: "Asymptomatic → Observe & investigate", goto: "brady_observe", tone: "ok" },
        ],
      },
      {
        id: "brady_treat",
        label: "Treat Symptomatic Bradycardia",
        actions: [
          "Maintain airway & oxygenation",
          "Cardiac monitor, BP, oximetry",
          "IV access",
          "Atropine IV",
          "Prepare transcutaneous pacing",
          "Consider dopamine or epinephrine infusion",
          "Expert consult for high-grade block or non-response",
        ],
        parameters: {
          "Atropine bolus": "1 mg IV",
          "Atropine repeat": "every 3–5 min (max 3 mg)",
          Dopamine: "5–20 mcg/kg/min",
          Epinephrine: "2–10 mcg/min",
        },
      },
      {
        id: "brady_observe",
        label: "Observe and Identify Cause",
        actions: ["Monitor rhythm & vitals", "12-lead ECG", "Search for underlying cause"],
        notes: [
          "Common causes: hypoxia, drug effects (β-blockers, CCB, digoxin), inferior MI, hypothermia, electrolyte abnormalities",
        ],
      },
    ],
  },
  {
    id: "atrial-fibrillation",
    name: "Atrial Fibrillation / Flutter — Acute",
    summary: "Rate vs rhythm strategy based on stability, duration, and stroke risk.",
    context: "Irregularly irregular · No P waves",
    sections: [
      {
        id: "af_initial",
        label: "1. Confirm AF/AFL and Assess Stability",
        actions: [
          "Obtain 12-lead ECG",
          "Assess vitals & signs of instability",
          "Check for reversible triggers (sepsis, thyrotoxicosis, PE, post-op, alcohol)",
        ],
      },
      {
        id: "af_stability_check",
        label: "2. Is the patient unstable?",
        kind: "branch",
        branches: [
          { label: "Unstable → Immediate cardioversion", goto: "af_unstable", tone: "danger" },
          { label: "Stable → Choose rate vs rhythm strategy", goto: "af_stable", tone: "ok" },
        ],
      },
      {
        id: "af_unstable",
        label: "Unstable AF / AFL",
        actions: [
          "Prepare immediate synchronized cardioversion",
          "Oxygen & airway support",
          "IV access",
          "Short-acting sedation if time allows",
        ],
        parameters: {
          "Initial energy (biphasic)": "120–200 J",
          Repeat: "increase stepwise if no conversion",
        },
      },
      {
        id: "af_stable",
        label: "Stable — decide by duration",
        kind: "branch",
        branches: [
          { label: "< 48 h — Rhythm or rate control", goto: "af_short", tone: "ok" },
          { label: "≥ 48 h or unknown — Rate control", goto: "af_long", tone: "warn" },
        ],
      },
      {
        id: "af_short",
        label: "AF < 48 h",
        actions: [
          "Decide rate control vs elective cardioversion",
          "Rhythm control: pharmacologic or electrical cardioversion",
          "Rate control: metoprolol or diltiazem (IV/PO)",
          "Consider anticoagulation per CHA₂DS₂-VASc",
        ],
      },
      {
        id: "af_long",
        label: "AF ≥ 48 h or Unknown Duration",
        actions: [
          "Rate control with beta-blocker or non-DHP CCB",
          "Evaluate anticoagulation (CHA₂DS₂-VASc)",
          "Delayed cardioversion with pre-procedural anticoagulation OR TEE-guided strategy",
          "Address reversible triggers",
        ],
      },
      {
        id: "af_follow_up",
        label: "Follow-up",
        actions: [
          "Document rate vs rhythm strategy",
          "Cardiology / EP consult",
          "Optimize risk factors",
          "Educate on adherence & stroke symptoms",
        ],
      },
    ],
  },
  {
    id: "pvc",
    name: "Premature Ventricular Complexes",
    summary: "Risk-stratify by structural heart disease, burden, and family history.",
    context: "PVCs on ECG or monitor",
    sections: [
      {
        id: "pvc_initial",
        label: "1. Confirm Ventricular Ectopy & Assess Symptoms",
        actions: ["Review 12-lead ECG", "Quantify PVC burden (Holter)", "Assess symptoms & vitals"],
      },
      {
        id: "pvc_risk",
        label: "2. Risk Stratification",
        kind: "branch",
        branches: [
          { label: "Low-risk profile", goto: "pvc_reassure", tone: "ok" },
          {
            label: "Structural disease or high-risk features",
            goto: "pvc_cardiology",
            tone: "warn",
          },
        ],
      },
      {
        id: "pvc_reassure",
        label: "Low-Risk PVCs — Reassurance",
        criteria: {
          "Structural heart disease": "none",
          "PVC burden": "≤ 10%",
          "Couplets/triplets/NSVT": "none",
          "Concerning family history": "none",
        },
        actions: [
          "Reassure if asymptomatic / mildly symptomatic",
          "Address lifestyle & stimulant use",
          "Correct electrolyte abnormalities",
          "Follow-up ECG or Holter if needed",
        ],
      },
      {
        id: "pvc_cardiology",
        label: "PVCs with Structural Disease or High-Risk Features",
        actions: [
          "Refer to cardiology for detailed workup",
          "Echocardiography and stress testing",
          "Optimize ischemic heart disease management",
          "Beta-blocker for symptom control",
          "Discuss antiarrhythmic or ablation in selected cases",
        ],
      },
      {
        id: "pvc_underlying",
        label: "Treat Underlying Causes",
        actions: [
          "Correct hypokalemia / hypomagnesemia",
          "Reduce or stop offending drugs / stimulants",
          "Manage thyroid dysfunction",
          "Control BP and ischemia",
        ],
      },
    ],
  },
];

// Re-export treatment modules
export {
  treatmentModules,
  commonArrhythmiaTreatments,
  type TreatmentModule,
  type TreatmentStep,
  type ArrhythmiaTreatment,
} from "./treatment-algorithms";

// Treatment reference mapping for UI components
export const treatmentReferences: Record<string, string> = {
  af_treatment: "Atrial Fibrillation/Flutter Treatment Algorithm",
  ventricular_ectopy_treatment: "PVC/Ventricular Ectopy Treatment Algorithm",
  code_blue_adult_cardiac_arrest_shockable_path: "Code Blue - Shockable Rhythm Path",
  code_blue_adult_cardiac_arrest_nonshockable_path: "Code Blue - Non-Shockable Rhythm Path",
};

export type Arrhythmia = {
  id: string;
  name: string;
  category: string;
  features: Record<string, string>;
  notes?: string[];
};

export const arrhythmias: Arrhythmia[] = [
  {
    id: "nsr",
    name: "Normal Sinus Rhythm",
    category: "Baseline",
    features: {
      Rate: "60–100 bpm",
      Regularity: "Regular",
      "P wave": "Present before each QRS",
      "PR interval": "0.12–0.20 s",
      QRS: "< 0.12 s",
    },
  },
  {
    id: "sinus_bradycardia",
    name: "Sinus Bradycardia",
    category: "Bradycardia",
    features: {
      Rate: "< 60 bpm",
      Regularity: "Regular",
      "P wave": "Normal before each QRS",
      QRS: "< 0.12 s",
    },
    notes: ["May be normal in athletes / sleep", "Evaluate symptoms and cause"],
  },
  {
    id: "sinus_tachycardia",
    name: "Sinus Tachycardia",
    category: "Tachycardia",
    features: { Rate: "> 100 bpm", Regularity: "Regular", "P wave": "Normal", QRS: "< 0.12 s" },
    notes: ["Usually secondary to physiologic or pathologic stress"],
  },
  {
    id: "svt",
    name: "Supraventricular Tachycardia",
    category: "Tachycardia",
    features: {
      Rate: "150–250 bpm",
      Regularity: "Regular",
      "P wave": "Often hidden in QRS / T",
      QRS: "< 0.12 s",
    },
  },
  {
    id: "atrial_flutter",
    name: "Atrial Flutter",
    category: "Atrial",
    features: {
      "Atrial rate": "250–350 bpm",
      "Ventricular response": "Variable",
      "P wave": "Sawtooth flutter waves",
      QRS: "< 0.12 s",
    },
  },
  {
    id: "atrial_fibrillation",
    name: "Atrial Fibrillation",
    category: "Atrial",
    features: {
      Rhythm: "Irregularly irregular",
      "P wave": "Absent",
      Baseline: "Fibrillatory waves",
      QRS: "< 0.12 s",
    },
  },
  {
    id: "first_degree_av_block",
    name: "First-Degree AV Block",
    category: "AV Block",
    features: { "PR interval": "> 0.20 s", Rhythm: "Regular", Conduction: "Every P conducts" },
  },
  {
    id: "second_degree_type_i",
    name: "2nd-Degree AV Block Type I (Wenckebach)",
    category: "AV Block",
    features: {
      Rhythm: "Irregular, grouped beats",
      "PR interval": "Progressive lengthening → dropped QRS",
    },
  },
  {
    id: "second_degree_type_ii",
    name: "2nd-Degree AV Block Type II",
    category: "AV Block",
    features: {
      Rhythm: "Often regular with sudden dropped QRS",
      "PR interval": "Constant on conducted beats",
    },
  },
  {
    id: "third_degree_av_block",
    name: "3rd-Degree (Complete) AV Block",
    category: "AV Block",
    features: {
      "Atrial rate": "Independent",
      "Ventricular rate": "Independent",
      "PR interval": "Variable",
      Relationship: "No P–QRS conduction",
    },
  },
  {
    id: "junctional_rhythm",
    name: "Junctional / Nodal Rhythm",
    category: "Bradycardia",
    features: { Rate: "40–60 bpm", "P wave": "Inverted or absent", QRS: "< 0.12 s" },
  },
  {
    id: "pvc",
    name: "Premature Ventricular Complex",
    category: "Ectopy",
    features: {
      QRS: "Wide, bizarre",
      Timing: "Early beat, no P",
      "Compensatory pause": "Often present",
    },
  },
  {
    id: "monomorphic_vt",
    name: "Monomorphic VT",
    category: "Ventricular",
    features: { Rate: "> 100 bpm", QRS: "Wide, uniform morphology", Rhythm: "Regular" },
  },
  {
    id: "polymorphic_vt_torsades",
    name: "Polymorphic VT / Torsades",
    category: "Ventricular",
    features: {
      QRS: "Wide, changing morphology",
      Appearance: "Twisting of points",
      Association: "Often prolonged QT",
    },
  },
  {
    id: "ventricular_fibrillation",
    name: "Ventricular Fibrillation",
    category: "Arrest",
    features: { Electrical: "Chaotic, disorganized", QRS: "None", Output: "No pulse" },
  },
  {
    id: "pea",
    name: "Pulseless Electrical Activity",
    category: "Arrest",
    features: { ECG: "Organized electrical activity", Pulse: "Absent" },
  },
  {
    id: "asystole",
    name: "Asystole",
    category: "Arrest",
    features: { ECG: "Flat line / minimal activity", Pulse: "Absent" },
  },
  {
    id: "arvc",
    name: "ARVC (Arrhythmogenic RV Cardiomyopathy)",
    category: "Inherited Channelopathy",
    features: {
      "Epsilon wave": "Small deflection after QRS in V1-V3",
      "T-wave": "Inverted in V1-V3",
      QRS: "Prolonged in right precordial leads",
      Risk: "Ventricular arrhythmias, SCD",
    },
    notes: [
      "Fibrofatty replacement of RV myocardium",
      "Exclude in young patients with VT of RV origin",
      "Family screening important",
    ],
  },
  {
    id: "brugada",
    name: "Brugada Syndrome",
    category: "Inherited Channelopathy",
    features: {
      "Type 1": "Coved ST elevation ≥2mm in V1-V3",
      "ST morphology": "Downward sloping to T-wave",
      "T-wave": "Inverted in V1-V3",
      Risk: "Ventricular fibrillation, SCD",
    },
    notes: [
      "Autosomal dominant sodium channelopathy",
      "May be unmasked by fever or drugs",
      "Consider in young males with syncope",
    ],
  },
];
