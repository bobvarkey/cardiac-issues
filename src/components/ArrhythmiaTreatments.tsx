// Arrhythmia Treatment Protocol with Medications and Electrolyte Management

export interface ArrhythmiaTreatment {
  id: string;
  name: string;
  treatment: {
    acute: string[];
    chronic: string[];
    medications: {
      drug: string;
      dose: string;
      route: string;
      frequency?: string;
      notes?: string;
    }[];
    procedures?: string[];
  };
  electrolytes?: {
    check: string[];
    correct: string[];
  };
  monitoring: string[];
}

export const ARRHYTHMIA_TREATMENTS: ArrhythmiaTreatment[] = [
  {
    id: "af",
    name: "Atrial Fibrillation",
    treatment: {
      acute: [
        "Assess hemodynamic stability",
        "If unstable: synchronized cardioversion 120-200J biphasic",
        "Rate control: metoprolol 5mg IV over 2min, may repeat x3",
        "Alternative: diltiazem 0.25mg/kg IV over 2min, then 5-15mg/h infusion",
        "If new onset <48h and no structural disease: consider cardioversion",
        "If >48h or unknown: rate control + anticoagulation, TEE before cardioversion",
      ],
      chronic: [
        "Rate control: beta-blocker (metoprolol, atenolol) or CCB (diltiazem, verapamil)",
        "Rhythm control: amiodarone, flecainide, propafenone (no structural disease)",
        "Anticoagulation based on CHA₂DS₂-VASc (≥2 in men, ≥3 in women)",
        "Consider ablation for symptomatic paroxysmal AF",
      ],
      medications: [
        { drug: "Metoprolol", dose: "25-100mg", route: "PO", frequency: "BID", notes: "Start 25mg BID, titrate" },
        { drug: "Diltiazem", dose: "120-360mg", route: "PO", frequency: "daily (ER)", notes: "Extended release for rate control" },
        { drug: "Amiodarone", dose: "100-200mg", route: "PO", frequency: "daily", notes: "Maintenance dose; 400mg BID x1wk for loading" },
        { drug: "Apixaban", dose: "5mg", route: "PO", frequency: "BID", notes: "2.5mg BID if age ≥80, weight ≤60kg, or Cr ≥1.5" },
        { drug: "Rivaroxaban", dose: "20mg", route: "PO", frequency: "daily with food", notes: "15mg daily if CrCl 15-50" },
        { drug: "Warfarin", dose: "2-5mg", route: "PO", frequency: "daily", notes: "Titrated to INR 2-3" },
      ],
      procedures: [
        "Electrical cardioversion (synchronized)",
        "Catheter ablation (pulmonary vein isolation)",
        "Left atrial appendage closure (Watchman)",
      ],
    },
    electrolytes: {
      check: [
        "Potassium (hypokalemia promotes AF)",
        "Magnesium (hypomagnesemia promotes AF)",
        "TSH (hyperthyroidism causes AF)",
        "Renal function (for DOAC dosing)",
      ],
      correct: [
        "K⁺ to 4.0-4.5 mEq/L",
        "Mg⁺⁺ to >2.0 mg/dL",
        "Treat thyroid dysfunction",
      ],
    },
    monitoring: [
      "Heart rate (target <110 bpm at rest for rate control)",
      "Blood pressure",
      "INR if on warfarin",
      "Renal function for DOAC dosing",
      "QT interval if on antiarrhythmics",
    ],
  },
  {
    id: "aflutter",
    name: "Atrial Flutter",
    treatment: {
      acute: [
        "Rate control often difficult (2:1 conduction = 150 bpm)",
        "Diltiazem 0.25mg/kg IV, then 5-15mg/h infusion",
        "Metoprolol 5mg IV x3 doses",
        "Consider synchronized cardioversion 50-100J",
        "Overdrive pacing may terminate flutter",
      ],
      chronic: [
        "Catheter ablation (first-line, 90% success)",
        "Rate control with CCB or beta-blocker",
        "Anticoagulation (same stroke risk as AF)",
        "Avoid class I agents without AV nodal blocker",
      ],
      medications: [
        { drug: "Diltiazem", dose: "0.25mg/kg", route: "IV", notes: "Over 2 min, then infusion 5-15mg/h" },
        { drug: "Metoprolol", dose: "5mg", route: "IV", frequency: "q5min x3", notes: "For rate control" },
        { drug: "Ibutilide", dose: "1mg", route: "IV", notes: "Over 10 min; for cardioversion, monitor QT x4h" },
        { drug: "Apixaban", dose: "5mg", route: "PO", frequency: "BID", notes: "Anticoagulation recommended" },
      ],
      procedures: [
        "Catheter ablation (cavotricuspid isthmus ablation)",
        "Synchronized cardioversion",
      ],
    },
    electrolytes: {
      check: ["Potassium", "Magnesium", "TSH"],
      correct: ["K⁺ to 4.0-4.5 mEq/L", "Mg⁺⁺ to >2.0 mg/dL"],
    },
    monitoring: ["Heart rate", "Blood pressure", "QT if ibutilide used", "Flutter cycle length"],
  },
  {
    id: "svt",
    name: "SVT (AVNRT/AVRT)",
    treatment: {
      acute: [
        "Vagal maneuvers (Valsalva, modified Valsalva)",
        "Adenosine 6mg rapid IV push, then 12mg if needed",
        "If adenosine fails: diltiazem or metoprolol IV",
        "Synchronized cardioversion if unstable",
      ],
      chronic: [
        "Catheter ablation (first-line, 95% success)",
        "Beta-blocker or CCB for prevention",
        "Flecainide/propafenone if no structural disease",
      ],
      medications: [
        { drug: "Adenosine", dose: "6mg → 12mg", route: "IV", notes: "Rapid push with flush; effect <10 seconds" },
        { drug: "Verapamil", dose: "2.5-5mg", route: "IV", notes: "Over 2 min; avoid in HFrEF" },
        { drug: "Metoprolol", dose: "25-100mg", route: "PO", frequency: "daily-BID", notes: "For prevention" },
        { drug: "Flecainide", dose: "100-200mg", route: "PO", frequency: "BID", notes: "Avoid if structural heart disease" },
      ],
      procedures: ["Catheter ablation (slow pathway modification for AVNRT)", "Accessory pathway ablation (AVRT)"],
    },
    electrolytes: {
      check: ["Potassium", "Magnesium"],
      correct: ["K⁺ to 4.0-4.5 mEq/L", "Mg⁺⁺ to >2.0 mg/dL"],
    },
    monitoring: ["Heart rate", "Blood pressure", "Symptoms"],
  },
  {
    id: "vt",
    name: "Ventricular Tachycardia",
    treatment: {
      acute: [
        "Assess stability (pulse, BP, mental status)",
        "Pulseless VT: defibrillation 200J biphasic, CPR, epinephrine 1mg q3-5min",
        "Stable monomorphic VT: amiodarone 150mg IV over 10min",
        "Alternative: procainamide 20-50mg/min IV, max 17mg/kg",
        "Alternative: lidocaine 1-1.5mg/kg IV, then 1-4mg/min",
        "Synchronized cardioversion if unstable",
      ],
      chronic: [
        "ICD implantation for sustained VT",
        "Beta-blocker (first-line for prevention)",
        "Amiodarone for refractory VT",
        "Catheter ablation for recurrent monomorphic VT",
        "Treat underlying cause (ischemia, electrolytes, cardiomyopathy)",
      ],
      medications: [
        { drug: "Amiodarone", dose: "150mg", route: "IV", frequency: "over 10 min", notes: "Then 1mg/min x6h, 0.5mg/min x18h" },
        { drug: "Lidocaine", dose: "1-1.5mg/kg", route: "IV", notes: "Then 1-4mg/min infusion" },
        { drug: "Procainamide", dose: "20-50mg/min", route: "IV", notes: "Max 17mg/kg; monitor BP and QRS width" },
        { drug: "Metoprolol", dose: "25-200mg", route: "PO", frequency: "daily-BID", notes: "For prevention" },
      ],
      procedures: ["Synchronized cardioversion", "ICD implantation", "Catheter ablation", "Sympathectomy (rare)"],
    },
    electrolytes: {
      check: [
        "Potassium (hypokalemia → VT)",
        "Magnesium (hypomagnesemia → VT)",
        "Calcium",
        "Troponin (ischemia)",
        "Drug levels (digoxin, antiarrhythmics)",
      ],
      correct: [
        "K⁺ to 4.5-5.0 mEq/L",
        "Mg⁺⁺ to >2.0 mg/dL (MgSO₄ 2g IV for TdP)",
        "Ca⁺⁺ if prolonged QT",
        "Discontinue proarrhythmic drugs",
      ],
    },
    monitoring: ["Continuous ECG", "Blood pressure", "Oxygen saturation", "Urine output", "QT interval"],
  },
  {
    id: "vfib",
    name: "Ventricular Fibrillation",
    treatment: {
      acute: [
        "CPR immediately, high-quality compressions",
        "Defibrillation 200J biphasic (or 360J monophasic)",
        "Resume CPR x2 min, check rhythm",
        "Epinephrine 1mg IV/IO q3-5min",
        "Amiodarone 300mg IV/IO after 2nd shock, 150mg after 3rd shock",
        "Consider lidocaine if amiodarone unavailable",
        "Treat reversible causes (H's and T's)",
      ],
      chronic: [
        "ICD implantation (mandatory)",
        "Treat underlying cause",
        "Beta-blocker for prevention",
        "Consider amiodarone if ICD shocks frequent",
      ],
      medications: [
        { drug: "Epinephrine", dose: "1mg", route: "IV/IO", frequency: "q3-5min", notes: "First-line vasopressor" },
        { drug: "Amiodarone", dose: "300mg → 150mg", route: "IV/IO", notes: "After 2nd and 3rd shocks" },
        { drug: "Lidocaine", dose: "1-1.5mg/kg", route: "IV/IO", notes: "Alternative to amiodarone" },
        { drug: "Magnesium", dose: "1-2g", route: "IV", notes: "For torsades de pointes" },
      ],
      procedures: ["Defibrillation", "CPR", "ICD implantation after ROSC"],
    },
    electrolytes: {
      check: ["All electrolytes", "Arterial blood gas", "Troponin", "Drug levels", "Glucose"],
      correct: [
        "K⁺ > 4.0 mEq/L",
        "Mg⁺⁺ > 2.0 mg/dL",
        "Correct acidosis",
        "Treat hypothermia",
        "Treat hypoglycemia",
      ],
    },
    monitoring: ["Continuous ECG", "Blood pressure (invasive)", "Oxygen saturation", "ETCO₂", "Temperature"],
  },
  {
    id: "pvc",
    name: "Premature Ventricular Contractions",
    treatment: {
      acute: [
        "Assess for structural heart disease",
        "If asymptomatic and no structural disease: reassurance",
        "If symptomatic: beta-blocker",
        "If >10,000/24h or symptoms: consider cardiology referral",
        "Avoid Class I antiarrhythmics (proarrhythmic)",
      ],
      chronic: [
        "Treat underlying cause (ischemia, electrolytes, stimulants)",
        "Beta-blocker for symptomatic PVCs",
        "Catheter ablation for frequent monomorphic PVCs",
        "Avoid Class I agents unless ablation fails",
      ],
      medications: [
        { drug: "Metoprolol", dose: "25-100mg", route: "PO", frequency: "BID", notes: "First-line for symptoms" },
        { drug: "Flecainide", dose: "100-200mg", route: "PO", frequency: "BID", notes: "Only if no structural disease" },
        { drug: "Mexiletine", dose: "150-300mg", route: "PO", frequency: "TID", notes: "If beta-blocker fails" },
      ],
      procedures: ["Catheter ablation (for frequent symptomatic PVCs)"],
    },
    electrolytes: {
      check: ["Potassium", "Magnesium", "TSH", "Drug levels"],
      correct: ["K⁺ to 4.0-4.5 mEq/L", "Mg⁺⁺ to >2.0 mg/dL", "Reduce stimulants"],
    },
    monitoring: ["Holter for burden assessment", "Symptom diary", "Echo for structural disease"],
  },
  {
    id: "brugada",
    name: "Brugada Syndrome",
    treatment: {
      acute: [
        "If VT/VF: defibrillation + CPR (ACLS protocol)",
        "Isoproterenol 1-2 mcg/min for electrical storm",
        "Quinidine if isoproterenol unavailable",
        "Avoid sodium channel blockers (flecainide, propafenone)",
        "Treat fever aggressively (triggers VF)",
      ],
      chronic: [
        "ICD for spontaneous Type 1 ECG or symptoms",
        "Avoid fever, sodium channel blockers, tricyclics",
        "Quinidine for recurrent VF or ICD shocks",
        "Family screening (first-degree relatives)",
        "Avoid competitive sports",
      ],
      medications: [
        { drug: "Isoproterenol", dose: "1-2 mcg/min", route: "IV infusion", notes: "For electrical storm" },
        { drug: "Quinidine", dose: "600-1200mg", route: "PO", frequency: "daily", notes: "For VF storm, pregnancy" },
      ],
      procedures: ["ICD implantation", "Ablation (emerging)", "Avoid: ajmaline, flecainide provocation (diagnostic only)"],
    },
    electrolytes: {
      check: ["Potassium", "Magnesium", "Calcium", "Fever"],
      correct: ["K⁺ normal range", "Mg⁺⁺ normal range", "Aggressive fever control"],
    },
    monitoring: ["Continuous telemetry if febrile", "ICD interrogation", "Avoid triggering medications"],
  },
  {
    id: "qtprolong",
    name: "QT Prolongation / Torsades",
    treatment: {
      acute: [
        "For TdP: IV magnesium sulfate 2g over 2-5 min",
        "Repeat magnesium 2g if needed",
        "If bradycardia: increase HR (isoproterenol or pacing)",
        "Stop all QT-prolonging drugs",
        "Correct electrolytes (K⁺, Mg⁺⁺)",
        "If persists: overdrive pacing >70 bpm",
      ],
      chronic: [
        "Avoid QT-prolonging drugs (check CredibleMeds)",
        "Correct electrolytes (K⁺ >4.0, Mg⁺⁺ >2.0)",
        "Beta-blocker for LQT1 (nadolol preferred)",
        "ICD for cardiac arrest survivors or syncope despite beta-blocker",
        "Left cardiac sympathetic denervation for refractory",
      ],
      medications: [
        { drug: "Magnesium sulfate", dose: "2g", route: "IV", notes: "Over 2-5 min for TdP; repeat x1" },
        { drug: "Isoproterenol", dose: "2-10 mcg/min", route: "IV infusion", notes: "If bradycardic and TdP" },
        { drug: "Nadolol", dose: "40-80mg", route: "PO", frequency: "daily", notes: "For congenital LQT" },
      ],
      procedures: ["Temporary pacing (for bradycardic TdP)", "ICD implantation", "Left cardiac sympathetic denervation"],
    },
    electrolytes: {
      check: ["Potassium", "Magnesium", "Calcium", "Drug levels", "TSH"],
      correct: [
        "K⁺ to 4.5-5.0 mEq/L (higher for LQT)",
        "Mg⁺⁺ to >2.0 mg/dL",
        "Discontinue all QT-prolonging drugs",
        "Avoid hypocalcemia",
      ],
    },
    monitoring: ["QTc interval", "K⁺, Mg⁺⁺ levels", "Continuous telemetry", "Drug interactions"],
  },
  {
    id: "wpw",
    name: "Wolff-Parkinson-White",
    treatment: {
      acute: [
        "If AF with WPW: AVOID AV nodal blockers (digoxin, verapamil, beta-blockers)",
        "Use procainamide 20-50mg/min IV (max 17mg/kg)",
        "If unstable: synchronized cardioversion",
        "If narrow QRS SVT: adenosine 6mg → 12mg",
      ],
      chronic: [
        "Catheter ablation (first-line, >95% success)",
        "Avoid AV nodal blockers (may cause VF if AF develops)",
        "Risk stratification with exercise test or EP study",
        "Competitive sports allowed after successful ablation",
      ],
      medications: [
        { drug: "Adenosine", dose: "6mg → 12mg", route: "IV", notes: "Only for narrow QRS SVT" },
        { drug: "Procainamide", dose: "20-50mg/min", route: "IV", notes: "For AF with WPW (max 17mg/kg)" },
        { drug: "Flecainide", dose: "100-200mg", route: "PO", frequency: "BID", notes: "If no structural disease, refused ablation" },
      ],
      procedures: ["Catheter ablation (accessory pathway)", "EP study for risk stratification"],
    },
    electrolytes: {
      check: ["Electrolytes baseline", "Avoid stimulants"],
      correct: ["Maintain normal electrolytes"],
    },
    monitoring: ["Pre-excitation on ECG", "Exercise test (intermittent vs persistent)", "Holter for asymptomatic"],
  },
  {
    id: "avblock",
    name: "AV Block",
    treatment: {
      acute: [
        "1st degree: observation, no treatment",
        "2nd degree Mobitz I: observation, treat if symptomatic",
        "2nd degree Mobitz II: urgent pacing, avoid AV blockers",
        "3rd degree: temporary pacing, cardiology consult",
        "If symptomatic: atropine 0.5mg IV (may repeat, max 3mg)",
        "If atropine ineffective: dopamine or epinephrine infusion",
        "Transcutaneous pacing if IV access delayed",
      ],
      chronic: [
        "Mobitz II/3rd degree: permanent pacemaker",
        "Bifascicular block with syncope: consider pacing",
        "Avoid AV nodal blockers (beta-blockers, CCB, digoxin)",
        "Treat reversible causes (ischemia, drugs, Lyme disease)",
      ],
      medications: [
        { drug: "Atropine", dose: "0.5mg", route: "IV", frequency: "q5min", notes: "Max 3mg; may worsen Mobitz II" },
        { drug: "Dopamine", dose: "2-20 mcg/kg/min", route: "IV infusion", notes: "If atropine ineffective" },
        { drug: "Epinephrine", dose: "2-10 mcg/min", route: "IV infusion", notes: "If dopamine ineffective" },
        { drug: "Isoproterenol", dose: "2-10 mcg/min", route: "IV infusion", notes: "For bradycardia; avoid in ischemia" },
      ],
      procedures: ["Temporary transcutaneous pacing", "Temporary transvenous pacing", "Permanent pacemaker implantation"],
    },
    electrolytes: {
      check: ["Potassium (hyperkalemia)", "Magnesium", "Digoxin level", "Troponin"],
      correct: [
        "K⁺ <5.0 mEq/L",
        "Correct hyperkalemia if present",
        "Discontinue AV-blocking drugs",
        "Treat ischemia",
      ],
    },
    monitoring: ["Continuous ECG", "Blood pressure", "Heart rate", "Symptom diary"],
  },
];

// Electrolyte Abnormality Reference
export interface ElectrolyteAbnormality {
  electrolyte: string;
  arrhythmias: string[];
  ecgFindings: string[];
  treatment: {
    mild: string;
    moderate: string;
    severe: string;
  };
}

export const ELECTROLYTE_ABNORMALITIES: ElectrolyteAbnormality[] = [
  {
    electrolyte: "Hypokalemia (K⁺ <3.5 mEq/L)",
    arrhythmias: ["PVCs", "VT/VF", "Torsades de pointes", "AF", "AV block"],
    ecgFindings: ["T wave flattening/inversion", "U waves", "ST depression", "QT prolongation", "Prominent P waves"],
    treatment: {
      mild: "K⁺ 3.0-3.5: Oral KCl 20-40mEq PO q4-6h",
      moderate: "K⁺ 2.5-3.0: IV KCl 10-20mEq/h (max 40mEq/h, max 200mEq/24h)",
      severe: "K⁺ <2.5: Central IV KCl 20-40mEq/h with continuous monitoring",
    },
  },
  {
    electrolyte: "Hyperkalemia (K⁺ >5.0 mEq/L)",
    arrhythmias: ["Bradycardia", "AV block", "VT/VF", "Asystole", "Sinus arrest"],
    ecgFindings: ["Peaked T waves", "Prolonged PR interval", "Widened QRS", "Loss of P waves", "Sine wave pattern (severe)"],
    treatment: {
      mild: "K⁺ 5.0-5.5: Stop K⁺ sources, loop diuretic, K⁺ binders (Patiromer, SZC)",
      moderate: "K⁺ 5.5-6.5: Calcium gluconate 1-2g IV (cardiac membrane stabilization)",
      severe: "K⁺ >6.5 or ECG changes: Calcium gluconate + insulin/glucose + albuterol nebulized + hemodialysis",
    },
  },
  {
    electrolyte: "Hypomagnesemia (Mg⁺⁺ <1.5 mg/dL)",
    arrhythmias: ["PVCs", "VT/VF", "Torsades de pointes", "AF"],
    ecgFindings: ["Prolonged QT", "T wave flattening", "U waves", "PVCs"],
    treatment: {
      mild: "Mg⁺⁺ 1.0-1.5: Oral Mg oxide 400mg TID",
      moderate: "Mg⁺⁺ 0.5-1.0: IV MgSO₄ 1-2g over 1h",
      severe: "Mg⁺⁺ <0.5: IV MgSO₄ 2g over 10-20min, then infusion",
    },
  },
  {
    electrolyte: "Hypermagnesemia (Mg⁺⁺ >2.5 mg/dL)",
    arrhythmias: ["Bradycardia", "AV block", "Hypotension"],
    ecgFindings: ["Prolonged PR", "Widened QRS", "Prolonged QT"],
    treatment: {
      mild: "Mg⁺⁺ 2.5-4.0: Stop Mg sources, IV fluids",
      moderate: "Mg⁺⁺ 4.0-7.0: IV calcium gluconate 1g + fluids + loop diuretic",
      severe: "Mg⁺⁺ >7.0: Hemodialysis",
    },
  },
  {
    electrolyte: "Hypocalcemia (Ca⁺⁺ <8.5 mg/dL)",
    arrhythmias: ["VT/VF", "Torsades de pointes", "PVCs"],
    ecgFindings: ["Prolonged QT", "T wave inversion", "PVCs"],
    treatment: {
      mild: "Ca⁺⁺ 7.5-8.5: Oral calcium carbonate 500-1500mg TID",
      moderate: "Ca⁺⁺ 7.0-7.5: IV calcium gluconate 1-2g over 30-60min",
      severe: "Ca⁺⁺ <7.0: IV calcium gluconate 1-2g over 10-20min (cardiac arrest: 3g)",
    },
  },
  {
    electrolyte: "Hypercalcemia (Ca⁺⁺ >10.5 mg/dL)",
    arrhythmias: ["Bradycardia", "AV block", "Sinus arrest"],
    ecgFindings: ["Shortened QT", "Widened T wave", "PR prolongation", "Sinus bradycardia"],
    treatment: {
      mild: "Ca⁺⁺ 10.5-12.0: IV fluids, loop diuretic",
      moderate: "Ca⁺⁺ 12.0-14.0: IV fluids + loop diuretic + bisphosphonate (zoledronate 4mg IV)",
      severe: "Ca⁺⁺ >14.0: IV fluids + loop diuretic + calcitonin + dialysis",
    },
  },
];