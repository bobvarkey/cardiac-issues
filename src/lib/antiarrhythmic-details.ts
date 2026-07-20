export type DoseRoute = {
  route: string;
  dose: string;
  notes?: string;
};

export type MonitoringItem = {
  watch: string;
  stopOrEscalate?: string;
};

export type DrugDetails = {
  name: string;
  className: string;
  classKey: string;
  mnemonic?: string;
  indications: string[];
  dosing: DoseRoute[];
  contraindications: string[];
  interactions: string[];
  adverse: string[];
  monitoring: MonitoringItem[];
};

export const CALCULATOR_DRUGS = new Set([
  "Diltiazem",
  "Metoprolol",
  "Esmolol",
  "Digoxin",
  "Amiodarone",
  "Adenosine",
  "Verapamil",
]);

export const DRUG_DETAILS: Record<string, DrugDetails> = {
  Ivabradine: {
    name: "Ivabradine",
    className: "HCN (\"funny\" If) channel blocker",
    classKey: "Class 0",
    mnemonic: "\"Funny\" — the F in Funny, Some Block Potassium Channels Mainly",
    indications: [
      "Chronic stable HFrEF (LVEF ≤35%) in sinus rhythm with resting HR ≥70 bpm on max-tolerated β-blocker",
      "Symptomatic inappropriate sinus tachycardia (off-label)",
      "Stable angina in sinus rhythm intolerant of β-blockers",
    ],
    dosing: [
      { route: "PO — HFrEF", dose: "Start 5 mg BID with meals; titrate after 2 wk to target HR 50–60 bpm (max 7.5 mg BID)" },
      { route: "PO — Age ≥75 or conduction disease", dose: "Start 2.5 mg BID" },
    ],
    contraindications: [
      "Acute decompensated heart failure",
      "BP <90/50 mmHg",
      "Sick sinus syndrome, SA block, or 3° AV block without pacemaker",
      "Resting HR <60 bpm before treatment",
      "Severe hepatic impairment",
      "Pacemaker-dependent (HR set by pacemaker)",
      "Atrial fibrillation (ineffective — acts on sinus node only)",
      "Strong CYP3A4 inhibitors",
    ],
    interactions: [
      "Strong CYP3A4 inhibitors (ketoconazole, itraconazole, clarithromycin, ritonavir, nefazodone) — contraindicated",
      "Moderate CYP3A4 inhibitors (diltiazem, verapamil, grapefruit juice) — avoid or reduce dose; additive bradycardia",
      "CYP3A4 inducers (rifampin, phenytoin, St John's wort) — reduce ivabradine effect",
      "Other bradycardic agents (β-blockers, digoxin, amiodarone) — additive HR reduction",
      "QT-prolonging drugs — avoid combination",
    ],
    adverse: [
      "Bradycardia",
      "Luminous phenomena / phosphenes (transient visual brightness, ~15%)",
      "Atrial fibrillation (~5%, higher than placebo)",
      "1° AV block, ventricular extrasystoles",
      "Blurred vision, headache, dizziness",
    ],
    monitoring: [
      { watch: "Resting HR at baseline, 2 wk, and after each titration", stopOrEscalate: "Reduce or hold if HR <50 bpm or symptomatic bradycardia" },
      { watch: "Rhythm — new AF or conduction disease", stopOrEscalate: "Discontinue if persistent AF develops" },
      { watch: "Visual symptoms (phosphenes) — usually resolve; warn about driving at night" },
      { watch: "BP and volume status in HFrEF patients" },
    ],
  },

  Quinidine: {
    name: "Quinidine",
    className: "Na+ channel blocker (moderate)",
    classKey: "Class Ia",
    mnemonic: "\"Quinidine\" in Quinidine likes fever",
    indications: ["Brugada syndrome", "Short QT syndrome", "Selected AF (rare)"],
    dosing: [
      { route: "PO (sulfate)", dose: "200–400 mg q6h" },
      { route: "PO (gluconate ER)", dose: "324–648 mg q8–12h" },
    ],
    contraindications: [
      "Prolonged QT / prior torsades",
      "Complete heart block without pacemaker",
      "Thrombocytopenia / TTP history",
      "Myasthenia gravis",
    ],
    interactions: [
      "↑ Digoxin levels (halve digoxin dose)",
      "CYP2D6 inhibitor — ↑ TCAs, β-blockers",
      "Other QT-prolonging drugs (macrolides, azoles, methadone)",
      "Warfarin — ↑ INR",
    ],
    adverse: ["QT prolongation / torsades", "Cinchonism (tinnitus, headache)", "Thrombocytopenia", "Diarrhea"],
    monitoring: [
      { watch: "ECG QTc and QRS width at baseline and after each dose change", stopOrEscalate: "Stop if QTc >500 ms or QRS widens >25%" },
      { watch: "Electrolytes (K+ >4, Mg2+ >2)", stopOrEscalate: "Replete before continuing" },
      { watch: "CBC weekly ×1 month then monthly", stopOrEscalate: "Stop if platelets <100k" },
      { watch: "Digoxin level if co-administered" },
    ],
  },
  Procainamide: {
    name: "Procainamide",
    className: "Na+ channel blocker (moderate)",
    classKey: "Class Ia",
    indications: ["Stable monomorphic VT", "Pre-excited AF (WPW)"],
    dosing: [
      { route: "IV load", dose: "20–50 mg/min until arrhythmia suppressed, hypotension, QRS widens >50%, or max 17 mg/kg" },
      { route: "IV maintenance", dose: "1–4 mg/min infusion" },
    ],
    contraindications: [
      "2nd/3rd degree AV block without pacemaker",
      "Long QT / torsades",
      "SLE",
      "Severe HF",
    ],
    interactions: [
      "Other QT-prolonging agents",
      "Amiodarone — ↑ procainamide/NAPA level",
      "Cimetidine, trimethoprim — reduce renal clearance",
    ],
    adverse: ["Drug-induced lupus", "QT prolongation / torsades", "Hypotension (IV)", "Agranulocytosis"],
    monitoring: [
      { watch: "Continuous ECG during load", stopOrEscalate: "STOP infusion if QRS widens >50%, QTc >500 ms, hypotension, or arrhythmia terminates" },
      { watch: "BP q5min during load", stopOrEscalate: "Slow/stop if SBP <90" },
      { watch: "CBC weekly ×3 months", stopOrEscalate: "Stop if WBC <3000 or ANC <1500" },
      { watch: "ANA if therapy >6 months", stopOrEscalate: "Stop for lupus-like symptoms" },
    ],
  },
  Disopyramide: {
    name: "Disopyramide",
    className: "Na+ channel blocker (moderate)",
    classKey: "Class Ia",
    indications: ["Hypertrophic obstructive cardiomyopathy", "Vagally-mediated AF"],
    dosing: [
      { route: "PO IR", dose: "100–200 mg q6h" },
      { route: "PO CR", dose: "200–400 mg q12h" },
    ],
    contraindications: [
      "HFrEF / cardiogenic shock",
      "Long QT",
      "Narrow-angle glaucoma",
      "Urinary retention / BPH",
      "2nd/3rd degree AV block without pacemaker",
    ],
    interactions: [
      "CYP3A4 inhibitors (macrolides, azoles) — ↑ level, ↑ QT",
      "Other QT-prolonging drugs",
      "Anticholinergics — additive effects",
    ],
    adverse: ["Anticholinergic (dry mouth, urinary retention)", "Negative inotrope — heart failure", "QT prolongation"],
    monitoring: [
      { watch: "ECG QTc and QRS", stopOrEscalate: "Stop if QTc >500 ms or QRS >25% widening" },
      { watch: "LV function / signs of HF", stopOrEscalate: "Stop for new dyspnea, edema, decreased EF" },
      { watch: "Urinary symptoms, IOP" },
    ],
  },
  Lidocaine: {
    name: "Lidocaine",
    className: "Na+ channel blocker (weak, fast)",
    classKey: "Class Ib",
    indications: ["VT/VF in ischemia", "Post-MI ventricular arrhythmias", "Digoxin-toxic VT"],
    dosing: [
      { route: "IV bolus", dose: "1–1.5 mg/kg; may repeat 0.5–0.75 mg/kg q5–10min (max 3 mg/kg)" },
      { route: "IV infusion", dose: "1–4 mg/min (reduce in HF/hepatic dysfunction)" },
    ],
    contraindications: [
      "Amide-anesthetic allergy",
      "Stokes-Adams / severe SA-AV block without pacemaker",
      "WPW syndrome",
    ],
    interactions: [
      "β-blockers, cimetidine — ↑ lidocaine level",
      "Amiodarone — additive toxicity",
      "Phenytoin — additive cardiac depression",
    ],
    adverse: ["CNS: perioral numbness, tremor, seizures", "Confusion", "Bradycardia at high doses"],
    monitoring: [
      { watch: "Neurologic status q1h", stopOrEscalate: "STOP for tremor, dysarthria, confusion, seizures" },
      { watch: "ECG for bradycardia, wide QRS", stopOrEscalate: "Stop if new AV block or QRS widening" },
      { watch: "Level if infusion >24h or hepatic dysfunction (target 1.5–5 mcg/mL)" },
    ],
  },
  Mexiletine: {
    name: "Mexiletine",
    className: "Na+ channel blocker (weak, fast)",
    classKey: "Class Ib",
    indications: ["Chronic ventricular arrhythmias", "LQT3", "Adjunct to amiodarone"],
    dosing: [
      { route: "PO", dose: "150–300 mg q8h with food" },
    ],
    contraindications: [
      "Cardiogenic shock",
      "2nd/3rd degree AV block without pacemaker",
    ],
    interactions: [
      "CYP1A2 inhibitors (ciprofloxacin, fluvoxamine) — ↑ level",
      "Rifampin, phenytoin — ↓ level",
      "Theophylline — ↑ theophylline level",
    ],
    adverse: ["GI upset, nausea", "Tremor", "Dizziness", "Hepatotoxicity (rare)"],
    monitoring: [
      { watch: "ECG", stopOrEscalate: "Stop for new bradyarrhythmia" },
      { watch: "LFTs baseline and periodically", stopOrEscalate: "Stop if AST/ALT >3× ULN" },
      { watch: "Neurologic: tremor, ataxia", stopOrEscalate: "Reduce dose or stop" },
    ],
  },
  Flecainide: {
    name: "Flecainide",
    className: "Na+ channel blocker (strong, slow)",
    classKey: "Class Ic",
    indications: ["Paroxysmal AF (pill-in-pocket) — structurally normal heart", "SVT", "Idiopathic VT"],
    dosing: [
      { route: "PO maintenance", dose: "50–150 mg q12h" },
      { route: "PO pill-in-pocket", dose: "200–300 mg single dose (with AV-nodal blocker)" },
    ],
    contraindications: [
      "Structural heart disease / CAD / prior MI (CAST trial — ↑ mortality)",
      "HFrEF",
      "2nd/3rd degree AV block without pacemaker",
      "Brugada syndrome",
    ],
    interactions: [
      "Amiodarone — ↑ flecainide level (halve dose)",
      "Digoxin — ↑ digoxin level",
      "β-blockers, verapamil — additive negative inotropy",
    ],
    adverse: ["Proarrhythmia (1:1 atrial flutter conduction)", "Negative inotrope", "AVOID in structural heart disease / CAD"],
    monitoring: [
      { watch: "ECG QRS width", stopOrEscalate: "Stop if QRS widens >25% from baseline" },
      { watch: "Echo before starting (require normal structure/function)" },
      { watch: "Co-prescribe AV-nodal blocker for AF to prevent 1:1 flutter", stopOrEscalate: "Stop for wide-complex tachycardia or syncope" },
    ],
  },
  Propafenone: {
    name: "Propafenone",
    className: "Na+ channel blocker (strong) + weak β-blocker",
    classKey: "Class Ic",
    indications: ["Paroxysmal AF (pill-in-pocket)", "SVT prevention"],
    dosing: [
      { route: "PO IR", dose: "150–300 mg q8h" },
      { route: "PO SR", dose: "225–425 mg q12h" },
      { route: "PO pill-in-pocket", dose: "450–600 mg single dose" },
    ],
    contraindications: [
      "Structural heart disease / HFrEF",
      "Severe COPD / asthma (β-effect)",
      "SA/AV node dysfunction without pacemaker",
      "Brugada syndrome",
    ],
    interactions: [
      "Warfarin — ↑ INR",
      "Digoxin — ↑ digoxin level",
      "CYP2D6 substrates/inhibitors",
    ],
    adverse: ["Metallic taste", "Bronchospasm (β-effect)", "Proarrhythmia — avoid in structural heart disease", "Bradycardia"],
    monitoring: [
      { watch: "ECG (QRS, PR)", stopOrEscalate: "Stop if QRS >25% widening or high-grade AV block" },
      { watch: "Echo before starting" },
      { watch: "Respiratory symptoms in COPD/asthma", stopOrEscalate: "Stop for bronchospasm" },
    ],
  },
  Propranolol: {
    name: "Propranolol",
    className: "Non-selective β-blocker",
    classKey: "Class II",
    mnemonic: "\"LOL\"",
    indications: ["Rate control", "Thyroid storm", "Long QT syndrome", "HOCM"],
    dosing: [
      { route: "PO", dose: "10–40 mg q6–8h (up to 320 mg/day)" },
      { route: "IV", dose: "0.5–1 mg slow push q5min up to 5 mg" },
    ],
    contraindications: [
      "Severe asthma / reactive airway disease",
      "Sinus bradycardia / 2nd–3rd degree AV block without pacemaker",
      "Cardiogenic shock, decompensated HF",
      "Cocaine-induced ischemia (unopposed α)",
    ],
    interactions: [
      "Verapamil/diltiazem — profound bradycardia",
      "Insulin/sulfonylureas — masks hypoglycemia",
      "Clonidine — rebound HTN if clonidine withdrawn",
    ],
    adverse: ["Bronchospasm", "Bradycardia / AV block", "Fatigue", "Masked hypoglycemia"],
    monitoring: [
      { watch: "HR, BP", stopOrEscalate: "Hold if HR <50 or SBP <90" },
      { watch: "ECG for AV block", stopOrEscalate: "Stop for 2nd/3rd degree AV block" },
      { watch: "Wheezing in reactive airway patients", stopOrEscalate: "Stop for bronchospasm" },
      { watch: "Glucose in diabetics" },
    ],
  },
  Metoprolol: {
    name: "Metoprolol",
    className: "β1-selective blocker",
    classKey: "Class II",
    mnemonic: "\"LOL\"",
    indications: ["Rate control in AF/flutter", "Post-MI", "SVT", "HFrEF (succinate)"],
    dosing: [
      { route: "IV (tartrate)", dose: "2.5–5 mg over 2 min q5min ×3 doses" },
      { route: "PO (tartrate)", dose: "25–100 mg BID" },
      { route: "PO (succinate ER)", dose: "25–200 mg daily (HFrEF)" },
    ],
    contraindications: [
      "HR <50, SBP <100, PR >0.24 s, 2nd/3rd degree AV block",
      "Decompensated HF / cardiogenic shock",
      "Severe reactive airway disease",
    ],
    interactions: [
      "Verapamil/diltiazem IV — severe bradycardia / asystole risk",
      "CYP2D6 inhibitors (fluoxetine, paroxetine, quinidine) — ↑ level",
      "Digoxin — additive AV nodal block",
    ],
    adverse: ["Bradycardia / AV block", "Hypotension", "Fatigue", "Bronchospasm at high doses"],
    monitoring: [
      { watch: "HR, BP before each IV dose", stopOrEscalate: "Hold if HR <50 or SBP <100" },
      { watch: "ECG for PR prolongation / AV block", stopOrEscalate: "Stop for 2nd/3rd degree block" },
      { watch: "Signs of decompensated HF when initiating chronic therapy" },
    ],
  },
  Atenolol: {
    name: "Atenolol",
    className: "β1-selective blocker",
    classKey: "Class II",
    mnemonic: "\"LOL\"",
    indications: ["Rate control", "Hypertension", "Angina"],
    dosing: [
      { route: "PO", dose: "25–100 mg daily (dose-adjust for CrCl <35)" },
    ],
    contraindications: [
      "Sinus bradycardia, 2nd/3rd degree AV block without pacemaker",
      "Cardiogenic shock / decompensated HF",
      "Severe renal impairment without adjustment",
    ],
    interactions: [
      "Non-DHP CCBs — additive bradycardia",
      "NSAIDs — reduce antihypertensive effect",
    ],
    adverse: ["Bradycardia", "Fatigue", "Cold extremities", "Renal accumulation"],
    monitoring: [
      { watch: "HR, BP", stopOrEscalate: "Hold if HR <50 or SBP <90" },
      { watch: "Renal function", stopOrEscalate: "Reduce dose if CrCl <35" },
    ],
  },
  Esmolol: {
    name: "Esmolol",
    className: "Ultra-short acting β1 blocker (IV)",
    classKey: "Class II",
    indications: ["Acute rate control (perioperative)", "Aortic dissection", "SVT in unstable patients"],
    dosing: [
      { route: "IV load", dose: "0.5 mg/kg over 1 min" },
      { route: "IV infusion", dose: "50–200 mcg/kg/min (titrate q4min)" },
    ],
    contraindications: [
      "Sinus bradycardia, 2nd/3rd degree AV block without pacemaker",
      "Decompensated HF / cardiogenic shock",
      "Severe pulmonary hypertension",
    ],
    interactions: [
      "Verapamil IV — severe bradycardia",
      "Digoxin — additive AV nodal block",
      "Morphine — ↑ esmolol level",
    ],
    adverse: ["Hypotension", "Bradycardia", "Infusion-site reactions"],
    monitoring: [
      { watch: "Continuous BP, HR, ECG", stopOrEscalate: "Reduce/stop for SBP <90 or HR <50" },
      { watch: "Titrate to target HR/BP; effect resolves ~10 min after stop" },
    ],
  },
  Amiodarone: {
    name: "Amiodarone",
    className: "K+ channel blocker (also Na+, β, Ca2+ effects)",
    classKey: "Class III",
    mnemonic: "\"A\" in AIDS",
    indications: ["VT/VF in cardiac arrest", "Stable wide-complex tachycardia", "AF rhythm/rate control", "Post-cardiac surgery arrhythmias"],
    dosing: [
      { route: "IV (arrest)", dose: "300 mg IV/IO push; may repeat 150 mg" },
      { route: "IV (stable)", dose: "150 mg over 10 min → 1 mg/min ×6h → 0.5 mg/min ×18h" },
      { route: "PO load", dose: "400 mg TID ×1 week → 400 mg daily ×3 weeks → 200 mg daily" },
    ],
    contraindications: [
      "Iodine hypersensitivity",
      "Severe SA node dysfunction / 2nd–3rd degree AV block without pacemaker",
      "Cardiogenic shock",
      "Thyroid dysfunction (relative)",
    ],
    interactions: [
      "Warfarin — ↑ INR (reduce warfarin by ~50%)",
      "Digoxin — ↑ digoxin level (reduce by 50%)",
      "Statins (simvastatin) — ↑ myopathy risk",
      "Other QT-prolonging drugs",
      "Flecainide, procainamide — ↑ their levels",
    ],
    adverse: ["Pulmonary fibrosis", "Thyroid dysfunction (hypo/hyper)", "Hepatotoxicity", "Corneal deposits, blue-grey skin", "QT prolongation"],
    monitoring: [
      { watch: "ECG QTc, HR", stopOrEscalate: "Stop if QTc >500 ms or symptomatic bradycardia" },
      { watch: "TFTs, LFTs at baseline then q6mo", stopOrEscalate: "Stop for TSH abnormality or LFTs >3× ULN" },
      { watch: "CXR baseline + yearly; PFTs if dyspnea", stopOrEscalate: "STOP for new dyspnea, cough, or infiltrates (pulmonary toxicity)" },
      { watch: "Ophthalmology yearly", stopOrEscalate: "Stop for visual changes / optic neuritis" },
      { watch: "INR closely if on warfarin" },
    ],
  },
  Ibutilide: {
    name: "Ibutilide",
    className: "K+ channel blocker (IV)",
    classKey: "Class III",
    mnemonic: "\"I\" in AIDS",
    indications: ["Chemical cardioversion of AF/flutter"],
    dosing: [
      { route: "IV (≥60 kg)", dose: "1 mg over 10 min; may repeat ×1 after 10 min" },
      { route: "IV (<60 kg)", dose: "0.01 mg/kg over 10 min; may repeat ×1" },
    ],
    contraindications: [
      "QTc >440 ms",
      "Hypokalemia / hypomagnesemia",
      "HFrEF (EF <30% — high torsades risk)",
      "Prior torsades",
    ],
    interactions: [
      "Other Class Ia/III antiarrhythmics — do NOT co-administer within 4h",
      "Any QT-prolonging drug",
    ],
    adverse: ["Torsades de pointes (2–4%)", "QT prolongation", "Hypotension"],
    monitoring: [
      { watch: "Continuous ECG for ≥4 h post-dose (or until QTc normalizes)", stopOrEscalate: "STOP infusion for QTc >500 ms, VT, or any wide-complex ectopy" },
      { watch: "K+ >4 mEq/L and Mg2+ >2 mg/dL before dosing", stopOrEscalate: "Replete first" },
      { watch: "Defibrillator + magnesium at bedside" },
    ],
  },
  Dofetilide: {
    name: "Dofetilide",
    className: "Pure K+ channel blocker (oral)",
    classKey: "Class III",
    mnemonic: "\"D\" in AIDS",
    indications: ["Maintenance of sinus rhythm in AF/flutter", "Chemical cardioversion"],
    dosing: [
      { route: "PO (CrCl >60)", dose: "500 mcg BID" },
      { route: "PO (CrCl 40–60)", dose: "250 mcg BID" },
      { route: "PO (CrCl 20–39)", dose: "125 mcg BID" },
      { route: "PO (CrCl <20)", dose: "Contraindicated" },
    ],
    contraindications: [
      "CrCl <20 mL/min",
      "Baseline QTc >440 ms (>500 if BBB)",
      "Hypokalemia / hypomagnesemia",
      "Concurrent verapamil, cimetidine, hydrochlorothiazide, ketoconazole, trimethoprim, prochlorperazine, megestrol",
    ],
    interactions: [
      "Verapamil, HCTZ, cimetidine, ketoconazole, trimethoprim — ↑ dofetilide (CONTRAINDICATED)",
      "Any QT-prolonging drug",
    ],
    adverse: ["Torsades de pointes", "QT prolongation", "Headache"],
    monitoring: [
      { watch: "In-hospital initiation ×3 days with continuous ECG", stopOrEscalate: "STOP if QTc >500 ms (>550 if BBB) after any dose" },
      { watch: "CrCl before each dose adjustment", stopOrEscalate: "Recalculate dose or stop" },
      { watch: "K+ >4, Mg2+ >2 always" },
    ],
  },
  Sotalol: {
    name: "Sotalol",
    className: "K+ channel blocker + non-selective β-blocker",
    classKey: "Class III",
    mnemonic: "\"S\" in AIDS",
    indications: ["AF/flutter maintenance", "Ventricular arrhythmias"],
    dosing: [
      { route: "PO (CrCl >60)", dose: "80 mg BID, titrate q3d to 160 mg BID" },
      { route: "PO (CrCl 40–60)", dose: "80 mg daily" },
      { route: "IV", dose: "75 mg over 5h (equivalent to 80 mg PO)" },
    ],
    contraindications: [
      "CrCl <40 mL/min (relative)",
      "Baseline QTc >450 ms",
      "Severe reactive airway disease",
      "HFrEF (worsens HF)",
      "Sinus bradycardia / 2nd–3rd degree AV block without pacemaker",
    ],
    interactions: [
      "Other QT-prolonging drugs",
      "Digoxin, non-DHP CCBs — additive bradycardia/AV block",
      "Insulin — masks hypoglycemia",
    ],
    adverse: ["Torsades de pointes", "Bradycardia", "Bronchospasm", "Fatigue"],
    monitoring: [
      { watch: "In-hospital initiation ×3 days with continuous ECG", stopOrEscalate: "STOP if QTc >500 ms" },
      { watch: "CrCl before dose changes" },
      { watch: "K+ >4, Mg2+ >2", stopOrEscalate: "Replete before continuing" },
      { watch: "HR", stopOrEscalate: "Hold if HR <50" },
    ],
  },
  Verapamil: {
    name: "Verapamil",
    className: "Non-dihydropyridine Ca2+ channel blocker",
    classKey: "Class IV",
    indications: ["SVT (AVNRT)", "Rate control in AF (no HFrEF)", "Idiopathic fascicular VT"],
    dosing: [
      { route: "IV", dose: "2.5–5 mg over 2 min; may repeat 5–10 mg q15–30 min (max 20 mg)" },
      { route: "PO IR", dose: "80–120 mg TID" },
      { route: "PO ER", dose: "180–480 mg daily" },
    ],
    contraindications: [
      "HFrEF / cardiogenic shock",
      "WPW with AF (accelerates accessory pathway conduction)",
      "Sick sinus / 2nd–3rd degree AV block without pacemaker",
      "IV β-blocker use (asystole risk)",
      "Wide-complex tachycardia of unknown origin",
    ],
    interactions: [
      "IV β-blockers — asystole / severe hypotension",
      "Digoxin — ↑ digoxin level ~70%",
      "Statins (simvastatin) — ↑ myopathy",
      "CYP3A4 substrates broadly",
    ],
    adverse: ["Constipation", "Bradycardia / AV block", "Negative inotrope — AVOID in HFrEF", "Hypotension"],
    monitoring: [
      { watch: "HR, BP, ECG during IV dose", stopOrEscalate: "STOP for SBP <90, HR <50, or new AV block" },
      { watch: "LV function before starting (require EF preserved)" },
      { watch: "Digoxin level if co-administered" },
    ],
  },
  Diltiazem: {
    name: "Diltiazem",
    className: "Non-dihydropyridine Ca2+ channel blocker",
    classKey: "Class IV",
    indications: ["Rate control in AF/flutter", "SVT (AVNRT)", "Angina"],
    dosing: [
      { route: "IV bolus", dose: "0.25 mg/kg over 2 min; may repeat 0.35 mg/kg after 15 min" },
      { route: "IV infusion", dose: "5–15 mg/h titrated to HR" },
      { route: "PO", dose: "120–360 mg daily (ER) or 30–90 mg QID (IR)" },
    ],
    contraindications: [
      "HFrEF / cardiogenic shock",
      "WPW with AF",
      "Sick sinus / 2nd–3rd degree AV block without pacemaker",
      "SBP <90",
      "Concurrent IV β-blocker",
    ],
    interactions: [
      "IV β-blockers — severe bradycardia / asystole",
      "Digoxin — ↑ digoxin level",
      "CYP3A4 substrates (simvastatin, cyclosporine, tacrolimus) — ↑ levels",
    ],
    adverse: ["Bradycardia / AV block", "Hypotension", "Peripheral edema", "AVOID in HFrEF and WPW with AF"],
    monitoring: [
      { watch: "HR, BP, ECG during IV load and infusion", stopOrEscalate: "STOP infusion for SBP <90, HR <50, or new AV block" },
      { watch: "LV function before starting" },
      { watch: "LFTs with chronic use" },
    ],
  },
  Digoxin: {
    name: "Digoxin",
    className: "Cardiac glycoside (Na/K-ATPase inhibitor)",
    classKey: "Class V",
    indications: ["Rate control in AF (esp. sedentary or HFrEF)", "HFrEF symptom control"],
    dosing: [
      { route: "IV load", dose: "0.25 mg IV q2h up to total 1–1.5 mg (0.5 mg initial then 0.25 mg doses)" },
      { route: "PO maintenance", dose: "0.125–0.25 mg daily (0.0625–0.125 mg if elderly or renal impairment)" },
    ],
    contraindications: [
      "VF / sustained VT",
      "WPW with AF",
      "2nd/3rd degree AV block without pacemaker",
      "Hypertrophic obstructive cardiomyopathy",
      "Digoxin toxicity",
    ],
    interactions: [
      "Amiodarone, verapamil, quinidine, propafenone — ↑ digoxin level (halve dose)",
      "Diuretics — hypokalemia potentiates toxicity",
      "Clarithromycin, cyclosporine — ↑ level",
    ],
    adverse: ["Digoxin toxicity: nausea, visual halos, confusion", "Bradyarrhythmias, PVCs, junctional rhythms", "Narrow therapeutic index"],
    monitoring: [
      { watch: "Digoxin level 6–8h post-dose; target 0.5–0.9 ng/mL in HF", stopOrEscalate: "Hold and consider Fab if >2 ng/mL or symptomatic" },
      { watch: "K+ (keep >4), Mg2+, renal function", stopOrEscalate: "Replete K+; reduce dose if renal function declines" },
      { watch: "ECG for bradyarrhythmias, junctional rhythms, PVCs", stopOrEscalate: "STOP and give Digoxin-Fab for life-threatening arrhythmia or hyperkalemia >5 in acute toxicity" },
      { watch: "Symptoms: nausea, visual halos, confusion" },
    ],
  },
  Adenosine: {
    name: "Adenosine",
    className: "Purinergic agonist (AV nodal blocker)",
    classKey: "Class V",
    indications: ["SVT termination (AVNRT, AVRT)", "SVT diagnostic (differentiate SVT vs VT)"],
    dosing: [
      { route: "IV rapid push", dose: "6 mg rapid IV push followed immediately by 20 mL saline flush", notes: "Use large vein, rapid administration essential" },
      { route: "Repeat dose", dose: "12 mg rapid IV push if no response to 6 mg", notes: "May repeat once (max 2 doses of 12 mg)" },
      { route: "Third dose", dose: "12 mg rapid IV push if no response to first 12 mg", notes: "Max single dose 12 mg" },
    ],
    contraindications: [
      "WPW with pre-excited AF (may accelerate accessory pathway)",
      "Heart transplant (denervated heart, exaggerated response)",
      "Severe asthma (bronchospasm risk)",
      "2nd/3rd degree AV block without pacemaker",
    ],
    interactions: [
      "Dipyridamole — potentiates adenosine effect (use much lower dose)",
      "Theophylline, caffeine — antagonize adenosine effect",
      "Carbamazepine — may increase AV block risk",
    ],
    adverse: ["Transient chest discomfort, flushing, dyspnea", "Brief asystole (usually <5 sec)", "Bronchospasm in asthmatics", "PACs/PVCs after termination"],
    monitoring: [
      { watch: "Continuous ECG during and after administration" },
      { watch: "BP during administration", stopOrEscalate: "Unlikely to cause sustained hypotension" },
      { watch: "Airway if asthma history", stopOrEscalate: "Have bronchodilator ready" },
    ],
  },
  "Magnesium Sulfate": {
    name: "Magnesium Sulfate",
    className: "Electrolyte (multichannel effects)",
    classKey: "Class V",
    indications: ["Torsades de pointes", "Refractory VT/VF (especially if hypomagnesemic)", "Digitalis-induced arrhythmias", "AV node block (adjunct)", "Polymorphic VT with normal QT"],
    dosing: [
      { route: "IV bolus (torsades)", dose: "1–2 g (8–16 mEq) IV over 5–20 min", notes: "May repeat if needed" },
      { route: "IV infusion", dose: "0.5–1 g/hr continuous infusion", notes: "Follow bolus for sustained effect" },
      { route: "IV bolus (cardiac arrest)", dose: "1–2 g IV push for refractory VF/pulseless VT", notes: "Not in ACLS algorithm, but consider if torsades suspected" },
    ],
    contraindications: [
      "Hypermagnesemia",
      "Renal failure with elevated Mg2+",
      "Heart block (may worsen)",
    ],
    interactions: [
      "Neuromuscular blockers — potentiates (caution with intubation)",
      "Calcium channel blockers — additive AV block",
      "Digoxin — Mg2+ potentiates but also treats digoxin toxicity",
    ],
    adverse: ["Flushing, warmth", "Hypotension (dose-related)", "Muscle weakness, areflexia at high levels", "Respiratory depression (>4 mEq/L)"],
    monitoring: [
      { watch: "BP during and after infusion", stopOrEscalate: "Stop or slow infusion if SBP <90" },
      { watch: "Deep tendon reflexes", stopOrEscalate: "Absence suggests Mg2+ >4 mEq/L" },
      { watch: "Serum Mg2+ level with renal impairment", stopOrEscalate: "Hold if >4 mEq/L" },
      { watch: "ECG for AV block", stopOrEscalate: "May need calcium gluconate if symptomatic AV block" },
    ],
  },
};
