import { ChecklistItem, ChecklistResult } from "./syncope-checklist-types";

export const SYNCOPE_ECG_CHECKLIST_DATA = {
  toolName: "Syncope ECG High-Risk Checklist",
  version: "1.0",
  purpose: "Clinical decision-support checklist for ECG abnormalities associated with potentially arrhythmic, ischemic, structural, or thromboembolic syncope.",
  scoring: {
    type: "additive_nonvalidated",
    range: {
      minimum: 0,
      maximum: 25
    },
    interpretation: [
      {
        min: 0,
        max: 0,
        label: "No listed high-risk pattern detected",
        action: "Continue standard syncope assessment; a normal ECG does not exclude serious disease."
      },
      {
        min: 1,
        max: 2,
        label: "Abnormal ECG feature",
        action: "Review clinical context, drugs, electrolytes, family history, and arrange appropriate cardiac evaluation."
      },
      {
        min: 3,
        max: 4,
        label: "High-risk ECG phenotype",
        action: "Consider monitored evaluation and urgent cardiology/electrophysiology review."
      },
      {
        min: 5,
        max: 25,
        label: "Multiple high-risk ECG abnormalities",
        action: "Urgent monitored cardiac assessment and targeted workup."
      }
    ]
  },
  items: [
    {
      id: "wellens_pattern",
      label: "Wellens pattern",
      category: "ischemia",
      criteria: [
        "Recent anginal chest pain, now pain-free",
        "Biphasic T waves in V2-V3",
        "OR deeply symmetric T-wave inversion in V2-V3, possibly extending V1-V6",
        "No pathologic precordial Q waves",
        "Preserved R-wave progression",
        "No significant ST elevation; ST shift less than 1 mm",
        "Normal or minimally elevated cardiac biomarkers when available"
      ],
      score: 3,
      urgentOverride: true,
      action: "Treat as possible critical LAD ischemia; urgent ACS/cardiologist assessment. Avoid exercise stress testing until specialist review."
    },
    {
      id: "wpw_preexcitation",
      label: "WPW / ventricular pre-excitation",
      category: "pre_excitation",
      criteria: [
        "PR interval less than 120 ms",
        "Delta wave present",
        "QRS duration greater than 110-120 ms",
        "Secondary ST-T changes may be present"
      ],
      score: 2,
      urgentOverrideConditions: [
        "Pre-excited atrial fibrillation",
        "Rapid irregular wide-complex tachycardia",
        "Exertional syncope",
        "Family history of sudden cardiac death"
      ],
      action: "Cardiology/electrophysiology assessment; urgent evaluation if override condition is present."
    },
    {
      id: "first_degree_av_block",
      label: "Increased PR interval / first-degree AV block",
      category: "conduction",
      criteria: [
        "PR interval greater than 200 ms"
      ],
      score: 1,
      modifierCriteria: [
        "Marked first-degree AV block: PR interval greater than 300 ms",
        "Associated bundle-branch block",
        "Associated syncope, bradycardia, or AV-nodal-blocking drugs"
      ],
      action: "Review drugs and conduction disease; isolated mild first-degree AV block is usually not sufficient to explain syncope."
    },
    {
      id: "av_block_high_grade",
      label: "Obstructed AV conduction / high-grade AV block",
      category: "conduction",
      criteria: [
        "Mobitz I: progressive PR prolongation followed by non-conducted P wave",
        "Mobitz II: fixed PR interval with intermittent non-conducted P wave",
        "2:1 AV block",
        "Advanced second-degree AV block",
        "Complete AV block: AV dissociation with escape rhythm"
      ],
      score: 3,
      urgentOverrideConditions: [
        "Mobitz II AV block",
        "2:1 or advanced second-degree AV block",
        "Complete AV block",
        "Symptomatic bradycardia"
      ],
      action: "Urgent monitored assessment and cardiology review; assess pacing requirement."
    },
    {
      id: "brugada_type_1",
      label: "Brugada Type 1 pattern",
      category: "channelopathy",
      criteria: [
        "Coved ST-segment elevation at least 2 mm",
        "Right precordial leads V1-V2, sometimes V3",
        "Descending ST segment followed by inverted T wave",
        "Consider high right-precordial lead placement if suspicion remains"
      ],
      score: 3,
      urgentOverride: true,
      action: "Urgent cardiology/electrophysiology assessment in unexplained syncope; exclude fever, electrolyte disturbance, and sodium-channel-blocking drug effects."
    },
    {
      id: "bifascicular_block",
      label: "Bifascicular block",
      category: "conduction",
      criteria: [
        "RBBB plus left anterior fascicular block",
        "OR RBBB plus left posterior fascicular block",
        "OR left bundle branch block / major intraventricular conduction disease"
      ],
      score: 2,
      urgentOverrideCondition: "Unexplained syncope with bifascicular block",
      action: "Evaluate for intermittent high-grade AV block; urgent cardiology/rhythm assessment."
    },
    {
      id: "lvh_pressure_overload",
      label: "LVH / pressure-overload phenotype",
      category: "structural",
      criteria: [
        "Sokolow-Lyon: S in V1 plus R in V5 or V6 at least 35 mm",
        "OR R wave in aVL at least 11 mm",
        "OR Cornell voltage: R in aVL plus S in V3 greater than 28 mm in men or greater than 20 mm in women",
        "Lateral ST depression/T-wave inversion may indicate LVH strain"
      ],
      score: 2,
      clinicalCorrelates: [
        "Aortic stenosis",
        "Hypertension",
        "Hypertrophic cardiomyopathy"
      ],
      action: "ECG cannot establish aortic stenosis; obtain echocardiography if murmur, exertional syncope, or structural-heart-disease suspicion."
    },
    {
      id: "hcm_hocm_phenotype",
      label: "HCM/HOCM ECG phenotype",
      category: "structural",
      criteria: [
        "LVH voltage",
        "Narrow, deep dagger-like Q waves in inferior and/or lateral leads",
        "Left atrial enlargement",
        "Diffuse or giant T-wave inversion, particularly in apical HCM",
        "ST-T repolarization abnormalities"
      ],
      score: 2,
      urgentOverrideCondition: "Exertional syncope, supine syncope, ventricular arrhythmia, or family history of HCM/sudden death",
      action: "Urgent echocardiography and cardiology assessment when clinical concern exists."
    },
    {
      id: "epsilon_wave_arvc",
      label: "Epsilon wave / ARVC phenotype",
      category: "arrhythmogenic_cardiomyopathy",
      criteria: [
        "Low-amplitude signal after QRS and before T wave in V1-V3",
        "T-wave inversion in V1-V3 beyond expected age/context",
        "Prolonged terminal activation or fragmented QRS in right precordial leads",
        "Ventricular ectopy or VT with left bundle branch block morphology"
      ],
      score: 3,
      urgentOverrideCondition: "Unexplained syncope with ARVC phenotype or ventricular arrhythmia",
      action: "Urgent cardiology/electrophysiology evaluation; consider echo, cardiac MRI, ambulatory rhythm monitoring, and family assessment."
    },
    {
      id: "long_qtc",
      label: "Long QTc",
      category: "repolarization",
      criteria: [
        "QTc 480 ms or greater is clearly abnormal",
        "QTc 500 ms or greater has higher torsades risk",
        "Review for QT-prolonging medicines and hypokalemia, hypomagnesemia, hypocalcemia"
      ],
      score: 3,
      urgentOverrideCondition: "QTc at least 500 ms with syncope, ventricular ectopy, or torsades de pointes",
      action: "Urgently correct reversible causes, stop avoidable QT-prolonging drugs, monitor rhythm, and involve cardiology."
    },
    {
      id: "short_qtc",
      label: "Short QTc",
      category: "repolarization",
      criteria: [
        "QTc 330 ms or less strongly supports short-QT syndrome",
        "QTc less than 360 ms is suspicious in appropriate clinical and family context"
      ],
      score: 2,
      urgentOverrideCondition: "Unexplained syncope plus very short QTc or family history of sudden death",
      action: "Cardiology/electrophysiology evaluation for possible inherited channelopathy."
    },
    {
      id: "pulmonary_embolism_rv_strain",
      label: "Pulmonary embolism / RV-strain pattern",
      category: "thromboembolic",
      criteria: [
        "Sinus tachycardia",
        "New right bundle branch block",
        "Right-axis deviation",
        "S1Q3T3 pattern",
        "Anterior T-wave inversion in V1-V4",
        "Right atrial enlargement or tall R wave in V1"
      ],
      score: 2,
      urgentOverrideCondition: "Syncope with hypotension, hypoxemia, dyspnea, chest pain, or RV-strain ECG pattern",
      action: "ECG is not diagnostic; assess for pulmonary embolism using clinical probability, D-dimer when appropriate, imaging, and echocardiography in unstable patients."
    }
  ],
  globalUrgentOverride: {
    triggers: [
      "Sustained VT, polymorphic VT, torsades de pointes, ventricular fibrillation",
      "Complete heart block, Mobitz II, 2:1 AV block, advanced second-degree AV block with symptoms",
      "Definite acute ischemic/STEMI pattern or suspected Wellens syndrome",
      "Type 1 Brugada pattern with unexplained syncope",
      "QTc at least 500 ms with syncope or ventricular arrhythmia",
      "Bifascicular block with unexplained syncope",
      "WPW with pre-excited AF or rapid irregular wide-complex tachycardia",
      "ARVC phenotype with syncope or ventricular arrhythmia"
    ],
    output: {
      urgent: true,
      riskLevel: "high",
      recommendedRoute: "urgent_monitored_cardiac_assessment"
    }
  }
};

export function calculateChecklistResult(selectedIds: string[], overrideTriggers: string[]): ChecklistResult {
  const selectedItems = SYNCOPE_ECG_CHECKLIST_DATA.items.filter(item => selectedIds.includes(item.id));
  const score = selectedItems.reduce((sum, item) => sum + item.score, 0);

  let isUrgent = overrideTriggers.length > 0;
  const triggeredOverrides: string[] = [...overrideTriggers];

  selectedItems.forEach(item => {
    if (item.urgentOverride) {
      isUrgent = true;
      triggeredOverrides.push(`Urgent Override: ${item.label}`);
    }
  });

  const interpretation = SYNCOPE_ECG_CHECKLIST_DATA.scoring.interpretation.find(
    i => score >= i.min && score <= i.max
  ) || SYNCOPE_ECG_CHECKLIST_DATA.scoring.interpretation[0];

  return {
    score,
    isUrgent,
    label: interpretation.label,
    action: interpretation.action,
    triggeredOverrides
  };
}
