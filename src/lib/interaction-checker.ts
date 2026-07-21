import type { DrugDetails } from "./antiarrhythmic-details";

export type Severity = "contraindicated" | "major" | "moderate";
export type Action = "avoid" | "monitor";

/**
 * Common companion medications to check against an antiarrhythmic's
 * interaction list. Each entry has keywords we substring-match
 * (case-insensitive) against interaction strings, plus a default
 * severity, recommended action, and management guidance.
 */
export type CompanionMed = {
  name: string;
  category: string;
  keywords: string[];
  severity: Severity;
  action: Action;
  management: string;
  rationale: string;
};

export const COMPANION_MEDS: CompanionMed[] = [
  {
    name: "Digoxin",
    category: "Cardiac",
    keywords: ["digoxin"],
    severity: "major",
    action: "monitor",
    management:
      "Reduce digoxin dose ~50%; check level in 5–7 days; watch for nausea, vision changes, bradyarrhythmia.",
    rationale:
      "Amiodarone, quinidine, verapamil, and dronedarone raise digoxin levels via P-gp inhibition — toxicity risk.",
  },
  {
    name: "Warfarin",
    category: "Anticoagulant",
    keywords: ["warfarin", "inr"],
    severity: "major",
    action: "monitor",
    management:
      "Empirically reduce warfarin ~30–50% when starting amiodarone; recheck INR in 3–5 days, then weekly.",
    rationale:
      "CYP2C9 inhibition potentiates warfarin; INR rises within days and bleeding risk climbs.",
  },
  {
    name: "Amiodarone",
    category: "Antiarrhythmic",
    keywords: ["amiodarone"],
    severity: "major",
    action: "avoid",
    management:
      "Avoid stacking QT-prolonging antiarrhythmics; if unavoidable, telemetry + serial QTc, replete K⁺/Mg²⁺.",
    rationale: "Additive QT prolongation and bradycardia; risk of torsades.",
  },
  {
    name: "Verapamil",
    category: "Non-DHP CCB",
    keywords: ["verapamil", "non-dhp", "ccb"],
    severity: "contraindicated",
    action: "avoid",
    management:
      "Do NOT co-administer IV with a β-blocker; if oral pairing is essential, monitor HR/BP and PR interval closely.",
    rationale: "Synergistic AV nodal blockade → high-grade block, asystole, cardiogenic shock.",
  },
  {
    name: "Diltiazem",
    category: "Non-DHP CCB",
    keywords: ["diltiazem", "non-dhp", "ccb"],
    severity: "major",
    action: "avoid",
    management:
      "Avoid IV combination with β-blocker; if oral, start low, monitor HR/BP and conduction.",
    rationale: "Additive negative inotropy/chronotropy → bradycardia and hypotension.",
  },
  {
    name: "IV β-blocker",
    category: "β-blocker",
    keywords: ["β-blocker", "b-blocker", "beta-blocker", "β-blockers"],
    severity: "contraindicated",
    action: "avoid",
    management:
      "Do not push IV β-blocker with IV non-DHP CCB; separate agents, use continuous telemetry.",
    rationale: "Combined AV nodal blockade risks complete heart block.",
  },
  {
    name: "Simvastatin",
    category: "Statin",
    keywords: ["simvastatin", "statin"],
    severity: "major",
    action: "monitor",
    management:
      "Cap simvastatin at 20 mg/day with amiodarone; consider rosuvastatin/pravastatin; monitor CK if myalgia.",
    rationale: "CYP3A4 inhibition raises statin levels → myopathy/rhabdomyolysis.",
  },
  {
    name: "Clarithromycin",
    category: "Macrolide",
    keywords: ["clarithromycin", "macrolide", "qt-prolonging"],
    severity: "major",
    action: "avoid",
    management:
      "Choose azithromycin or doxycycline; if unavoidable, baseline + follow-up ECG, correct electrolytes.",
    rationale: "Additive QT prolongation and CYP3A4 inhibition → torsades risk.",
  },
  {
    name: "Erythromycin",
    category: "Macrolide",
    keywords: ["macrolide", "qt-prolonging"],
    severity: "major",
    action: "avoid",
    management: "Substitute a non-QT antibiotic; if required, telemetry with QTc monitoring.",
    rationale: "Additive QT prolongation; CYP3A4 inhibition.",
  },
  {
    name: "Ketoconazole",
    category: "Azole",
    keywords: ["ketoconazole", "azole", "cyp3a4"],
    severity: "major",
    action: "avoid",
    management:
      "Switch to a non-CYP3A4 antifungal (e.g. terbinafine) or reduce antiarrhythmic dose; monitor for toxicity.",
    rationale: "Potent CYP3A4 inhibition raises antiarrhythmic levels.",
  },
  {
    name: "Fluconazole",
    category: "Azole",
    keywords: ["azole", "qt-prolonging"],
    severity: "major",
    action: "monitor",
    management:
      "Use lowest effective dose, shortest course; ECG and electrolytes before/during therapy.",
    rationale: "Additive QT prolongation.",
  },
  {
    name: "Ciprofloxacin",
    category: "Fluoroquinolone",
    keywords: ["ciprofloxacin", "cyp1a2", "qt-prolonging"],
    severity: "major",
    action: "monitor",
    management: "Prefer non-QT antibiotic; if needed, ECG monitoring and correct K⁺/Mg²⁺.",
    rationale: "CYP1A2 inhibition + QT prolongation.",
  },
  {
    name: "Fluoxetine",
    category: "SSRI",
    keywords: ["fluoxetine", "cyp2d6"],
    severity: "moderate",
    action: "monitor",
    management:
      "Consider sertraline/escitalopram; if continuing, watch for antiarrhythmic toxicity and QTc.",
    rationale: "CYP2D6 inhibition raises levels of β-blockers and flecainide.",
  },
  {
    name: "Paroxetine",
    category: "SSRI",
    keywords: ["paroxetine", "cyp2d6"],
    severity: "moderate",
    action: "monitor",
    management: "Consider alternative SSRI; monitor for bradycardia/toxicity.",
    rationale: "Strong CYP2D6 inhibitor.",
  },
  {
    name: "Methadone",
    category: "Opioid",
    keywords: ["methadone", "qt-prolonging"],
    severity: "major",
    action: "monitor",
    management:
      "Baseline and follow-up ECG; keep QTc <500 ms; correct electrolytes; reassess opioid regimen.",
    rationale: "Independent QT prolongation additive with class Ia/III agents.",
  },
  {
    name: "Hydrochlorothiazide",
    category: "Diuretic",
    keywords: ["hydrochlorothiazide", "hctz", "diuretic"],
    severity: "moderate",
    action: "monitor",
    management:
      "Check K⁺/Mg²⁺ before starting and periodically; replete aggressively; consider K-sparing agent.",
    rationale: "Diuretic-induced hypokalemia/hypomagnesemia lowers torsades threshold.",
  },
  {
    name: "Furosemide",
    category: "Loop diuretic",
    keywords: ["diuretic", "hypokalemi"],
    severity: "moderate",
    action: "monitor",
    management: "Daily electrolytes on inpatients; keep K⁺ >4.0, Mg²⁺ >2.0 mEq/L.",
    rationale: "Hypokalemia potentiates QT prolongation and digoxin toxicity.",
  },
  {
    name: "Cimetidine",
    category: "H2 blocker",
    keywords: ["cimetidine"],
    severity: "moderate",
    action: "monitor",
    management: "Switch to famotidine or PPI; if continued, monitor for antiarrhythmic toxicity.",
    rationale: "Broad CYP inhibitor raises antiarrhythmic levels.",
  },
  {
    name: "Trimethoprim",
    category: "Antibiotic",
    keywords: ["trimethoprim"],
    severity: "moderate",
    action: "monitor",
    management: "Check K⁺; avoid with other hyperkalemia risks; consider alternative antibiotic.",
    rationale: "Blocks ENaC → hyperkalemia, additive with certain antiarrhythmics.",
  },
  {
    name: "Phenytoin",
    category: "Anticonvulsant",
    keywords: ["phenytoin"],
    severity: "moderate",
    action: "monitor",
    management: "Check phenytoin level; watch for ataxia, nystagmus; adjust dose.",
    rationale: "Amiodarone raises phenytoin levels via CYP2C9 inhibition.",
  },
  {
    name: "Rifampin",
    category: "Antibiotic",
    keywords: ["rifampin"],
    severity: "major",
    action: "monitor",
    management:
      "Anticipate loss of antiarrhythmic efficacy; consider alternative or dose increase.",
    rationale: "Potent CYP3A4/P-gp inducer lowers antiarrhythmic levels.",
  },
  {
    name: "Insulin",
    category: "Antihyperglycemic",
    keywords: ["insulin", "hypoglycemi"],
    severity: "moderate",
    action: "monitor",
    management:
      "Educate on masked hypoglycemia signs; check glucose more frequently, especially with non-selective β-blockers.",
    rationale: "β-blockers blunt adrenergic hypoglycemia symptoms.",
  },
  {
    name: "Clonidine",
    category: "Antihypertensive",
    keywords: ["clonidine"],
    severity: "major",
    action: "avoid",
    management:
      "Do not stop clonidine abruptly with a β-blocker on board; taper β-blocker first, then clonidine.",
    rationale: "Rebound hypertensive crisis from unopposed α-stimulation.",
  },
  {
    name: "NSAIDs",
    category: "Analgesic",
    keywords: ["nsaid"],
    severity: "moderate",
    action: "monitor",
    management:
      "Prefer acetaminophen; if NSAID needed, shortest course, monitor BP and renal function.",
    rationale: "NSAIDs blunt antihypertensive effect and raise BP.",
  },
  {
    name: "Cyclosporine",
    category: "Immunosuppressant",
    keywords: ["cyclosporine"],
    severity: "major",
    action: "monitor",
    management: "Check cyclosporine trough; reduce dose; monitor renal function.",
    rationale: "Amiodarone/diltiazem raise cyclosporine levels (CYP3A4/P-gp).",
  },
  {
    name: "Tacrolimus",
    category: "Immunosuppressant",
    keywords: ["tacrolimus"],
    severity: "major",
    action: "monitor",
    management: "Check tacrolimus trough within 3–5 days; adjust dose; watch renal function.",
    rationale: "CYP3A4 inhibition raises tacrolimus levels.",
  },
  {
    name: "TCAs",
    category: "Antidepressant",
    keywords: ["tca"],
    severity: "major",
    action: "avoid",
    management:
      "Avoid class Ia/III co-administration; if needed, ECG monitoring and lowest effective dose.",
    rationale: "Additive QT prolongation and Na⁺ channel blockade.",
  },
  {
    name: "Morphine",
    category: "Opioid",
    keywords: ["morphine"],
    severity: "moderate",
    action: "monitor",
    management: "Monitor BP; use smaller titrated doses.",
    rationale: "Additive hypotension with vasoactive antiarrhythmics.",
  },
];

export type InteractionHit = {
  companion: CompanionMed;
  matches: string[];
  severity: Severity;
  action: Action;
};

function escalate(base: Severity, text: string): Severity {
  const t = text.toLowerCase();
  if (t.includes("contraindicat")) return "contraindicated";
  if (t.includes("avoid") && base === "moderate") return "major";
  return base;
}

export function findInteractions(details: DrugDetails, selected: string[]): InteractionHit[] {
  const hits: InteractionHit[] = [];
  const lowered = details.interactions.map((i) => i.toLowerCase());
  for (const name of selected) {
    const companion = COMPANION_MEDS.find((c) => c.name === name);
    if (!companion) continue;
    const matches: string[] = [];
    lowered.forEach((line, idx) => {
      if (companion.keywords.some((kw) => line.includes(kw.toLowerCase()))) {
        matches.push(details.interactions[idx]);
      }
    });
    if (matches.length) {
      const severity = matches.reduce<Severity>((acc, m) => {
        const next = escalate(companion.severity, m);
        const rank = { moderate: 0, major: 1, contraindicated: 2 } as const;
        return rank[next] > rank[acc] ? next : acc;
      }, companion.severity);
      const action: Action = severity === "contraindicated" ? "avoid" : companion.action;
      hits.push({ companion, matches, severity, action });
    }
  }
  return hits;
}
