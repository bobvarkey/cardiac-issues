// Treatment Algorithm Data for Cardiac Conditions
// Source: ACLS/clinical guidelines. For educational use only.

export type TreatmentModule = {
  id: string;
  type: "treatment_algorithm" | "treatment_reference";
  name: string;
  context?: {
    setting?: string;
    population?: string;
  };
  inputs?: Record<string, string | string[] | boolean>;
  steps: TreatmentStep[];
};

export type TreatmentStep = {
  id: string;
  label: string;
  actions?: string[];
  branch_on?: string | string[];
  branches?: Record<string, string>;
  criteria?: Record<string, string | number | boolean>;
  parameters?: Record<string, string | number>;
  rate_control_options?: string[];
  rhythm_control_options?: string[];
};

export type ArrhythmiaTreatment = {
  rhythm_id: string;
  name: string;
  category: string;
  treatment?: {
    if_asymptomatic?: string[];
    if_symptomatic_or_unstable?: string[];
    stable?: string[];
    unstable?: string[];
    any_instability?: string[];
  };
  treatment_reference?: string;
};

export const treatmentModules: TreatmentModule[] = [
  {
    id: "af_treatment",
    type: "treatment_algorithm",
    name: "Treatment of Atrial Fibrillation / Flutter (Acute)",
    context: {
      setting: "acute_inpatient_or_ed",
      population: "adult",
    },
    inputs: {
      heart_rate_bpm: "numeric",
      blood_pressure: "numeric",
      signs_of_instability: [
        "hypotension",
        "altered_mental_status",
        "signs_of_shock",
        "ischemic_chest_discomfort",
        "acute_heart_failure",
      ],
      af_duration_hours: "numeric_or_unknown",
      chads2_vasc_score: "numeric",
      valvular_af: "boolean",
      structural_heart_disease: "boolean",
    },
    steps: [
      {
        id: "af_treat_initial",
        label: "Initial Assessment",
        actions: [
          "confirm_af_or_afl_on_ecg",
          "assess_hemodynamic_stability",
          "obtain_vitals_and_12_lead_ecg",
        ],
      },
      {
        id: "af_treat_stability_check",
        label: "Is the Patient Unstable?",
        branch_on: "signs_of_instability",
        branches: {
          present: "af_treat_unstable",
          absent: "af_treat_stable",
        },
      },
      {
        id: "af_treat_unstable",
        label: "Unstable AF/AFL – Immediate Cardioversion",
        actions: [
          "provide_oxygen_and_support_airway",
          "establish_iv_access",
          "prepare_synchronized_cardioversion",
          "consider_short_acting_sedation_if_feasible",
        ],
        parameters: {
          initial_energy_biphasic_j: "120-200",
          repeat_energy_strategy: "increase_stepwise_if_no_conversion",
        },
      },
      {
        id: "af_treat_stable",
        label: "Stable AF/AFL – Rate vs Rhythm Strategy",
        branch_on: "af_duration_hours",
        branches: {
          less_than_48: "af_treat_short_duration",
          greater_equal_48_or_unknown: "af_treat_long_duration",
        },
      },
      {
        id: "af_treat_short_duration",
        label: "AF < 48 h or Clearly Recent",
        actions: [
          "decide_between_rate_control_and_early_rhythm_control",
          "if_rate_control_start_beta_blocker_or_non_dhp_ccb_unless_contraindicated",
          "if_rhythm_control_plan_pharmacologic_or_electrical_cardioversion",
          "initiate_heparin_or_oral_anticoagulant_per_stroke_risk",
        ],
        rate_control_options: ["metoprolol_iv_or_po", "diltiazem_iv_or_po", "verapamil_iv_or_po"],
        rhythm_control_options: [
          "electrical_cardioversion",
          "amiodarone_or_other_antiarrhythmic_per_local_protocol",
        ],
      },
      {
        id: "af_treat_long_duration",
        label: "AF ≥ 48 h or Unknown Duration",
        actions: [
          "prioritize_rate_control_with_beta_blocker_or_non_dhp_ccb",
          "start_oral_anticoagulation_based_on_chads2_vasc_and_valvular_status",
          "plan_delayed_cardioversion_after_adequate_anticoagulation_or_TEE_guided_strategy",
          "manage_contributing_conditions_sepsis_thyrotoxicosis_etc",
        ],
      },
      {
        id: "af_treat_anticoagulation",
        label: "Anticoagulation for Stroke Prevention",
        branch_on: "chads2_vasc_score",
        branches: {
          low_risk: "af_treat_anticoagulation_low_risk",
          intermediate_high_risk: "af_treat_anticoagulation_high_risk",
        },
      },
      {
        id: "af_treat_anticoagulation_low_risk",
        label: "Low Stroke Risk",
        actions: [
          "consider_no_anticoagulation_or_antiplatelet_per_local_guidance",
          "reassess_risk_periodically",
        ],
      },
      {
        id: "af_treat_anticoagulation_high_risk",
        label: "Intermediate/High Stroke Risk",
        actions: [
          "start_full_dose_oral_anticoagulant_DOAC_or_warfarin_per_local_protocol",
          "educate_patient_on_bleeding_risk_and_adherence",
        ],
      },
      {
        id: "af_treat_follow_up",
        label: "Follow-up",
        actions: [
          "document_rate_or_rhythm_strategy",
          "arrange_cardiology_follow_up",
          "optimize_risk_factor_management",
          "review_anticoagulation_long_term_plan",
        ],
      },
    ],
  },
  {
    id: "ventricular_ectopy_treatment",
    type: "treatment_algorithm",
    name: "Treatment of PVCs / Ventricular Ectopy",
    context: {
      setting: "outpatient_or_inpatient",
      population: "adult",
    },
    inputs: {
      symptoms: ["none", "palpitations", "presyncope", "syncope", "chest_pain", "dyspnea"],
      known_structural_heart_disease: "boolean",
      ischemic_heart_disease: "boolean",
      pvc_burden_percent_on_holter: "numeric",
      couplets_triplets_or_nsvt: "boolean",
      family_history_sudden_cardiac_death: "boolean",
      electrolyte_abnormalities: "boolean",
      stimulant_or_drug_use: [
        "caffeine",
        "alcohol_binge",
        "beta_agonists",
        "decongestants",
        "cocaine",
        "amphetamines",
      ],
    },
    steps: [
      {
        id: "pvc_treat_initial",
        label: "Initial Assessment",
        actions: [
          "confirm_pvc_or_ventricular_ectopy_on_ecg_or_monitor",
          "quantify_pvc_burden_if_possible",
          "assess_symptoms_and_vitals",
        ],
      },
      {
        id: "pvc_treat_risk_stratification",
        label: "Risk Stratification",
        branch_on: [
          "known_structural_heart_disease",
          "ischemic_heart_disease",
          "pvc_burden_percent_on_holter",
          "couplets_triplets_or_nsvt",
          "family_history_sudden_cardiac_death",
        ],
        branches: {
          low_risk_profile: "pvc_treat_low_risk",
          higher_risk_or_structural_disease: "pvc_treat_high_risk",
        },
      },
      {
        id: "pvc_treat_low_risk",
        label: "Low-Risk PVCs",
        criteria: {
          no_structural_heart_disease: true,
          pvc_burden_percent_on_holter_max: 10,
          no_couplets_triplets_or_nsvt: true,
          no_concerning_family_history: true,
        },
        actions: [
          "reassure_patient_if_asymptomatic_or_mildly_symptomatic",
          "advise_reduction_of_caffeine_alcohol_and_other_stimulants",
          "correct_electrolyte_abnormalities_if_present",
          "consider_beta_blocker_for_bothersome_palpitations",
          "plan_periodic_follow_up_ecg_or_holter_if_needed",
        ],
      },
      {
        id: "pvc_treat_high_risk",
        label: "PVCs with Structural Disease or High-Risk Features",
        criteria: {
          any_structural_or_ischemic_disease: true,
          or_pvc_burden_percent_on_holter_high: true,
          or_couplets_triplets_or_nsvt: true,
          or_concerning_family_history: true,
        },
        actions: [
          "refer_to_cardiology_or_electrophysiology",
          "obtain_echocardiography_and_ischemia_evaluation",
          "optimize_heart_failure_or_ischemic_therapy_if_present",
          "start_beta_blocker_unless_contraindicated",
          "consider_antiarrhythmic_or_catheter_ablation_in_selected_cases",
        ],
      },
      {
        id: "pvc_treat_underlying",
        label: "Treat Underlying Factors",
        actions: [
          "correct_hypokalemia_or_hypomagnesemia",
          "manage_thyroid_dysfunction",
          "reduce_or_discontinue_offending_medications_or_stimulants",
          "address_hypertension_and_other_cardiovascular_risk_factors",
        ],
      },
      {
        id: "pvc_treat_follow_up",
        label: "Follow-up",
        actions: [
          "document_risk_category_and_treatment_plan",
          "arrange_follow_up_with_primary_or_cardiology",
          "monitor_left_ventricular_function_if_pvc_burden_high",
          "educate_patient_on_warning_symptoms_needing_urgent_care",
        ],
      },
    ],
  },
];

export const commonArrhythmiaTreatments: ArrhythmiaTreatment[] = [
  {
    rhythm_id: "sinus_bradycardia",
    name: "Sinus Bradycardia",
    category: "bradycardia",
    treatment: {
      if_asymptomatic: [
        "observe_and_identify_cause",
        "review_medications_beta_blockers_ccb_digoxin",
        "correct_hypoxia_and_electrolytes",
      ],
      if_symptomatic_or_unstable: [
        "oxygen_and_monitor",
        "establish_iv_access",
        "administer_atropine_1mg_iv_every_3-5min_max_3mg",
        "consider_dopamine_infusion_5-20_mcg_per_kg_min",
        "consider_epinephrine_infusion_2-10_mcg_min",
        "prepare_transcutaneous_pacing",
        "seek_expert_consultation",
      ],
    },
  },
  {
    rhythm_id: "svt",
    name: "Supraventricular Tachycardia",
    category: "tachycardia_narrow_regular",
    treatment: {
      stable: [
        "attempt_vagal_maneuvers",
        "give_adenosine_6mg_rapid_iv_push_followed_by_flush",
        "if_no_response_consider_adenosine_12mg",
        "consider_beta_blocker_or_non_dhp_ccb",
        "seek_expert_consultation_if_refractory",
      ],
      unstable: [
        "provide_oxygen_and_support_airway",
        "prepare_synchronized_cardioversion_50-100j",
        "consider_sedation_if_time_allows",
      ],
    },
  },
  {
    rhythm_id: "atrial_fibrillation",
    name: "Atrial Fibrillation",
    category: "atrial_arrhythmia",
    treatment_reference: "af_treatment",
  },
  {
    rhythm_id: "atrial_flutter",
    name: "Atrial Flutter",
    category: "atrial_arrhythmia",
    treatment_reference: "af_treatment",
  },
  {
    rhythm_id: "monomorphic_vt",
    name: "Monomorphic Ventricular Tachycardia with Pulse",
    category: "wide_complex_tachycardia",
    treatment: {
      stable: [
        "obtain_expert_consultation",
        "consider_antiarrhythmic_infusion_amiodarone_or_procainamide_or_sotalol",
        "prepare_for_synchronized_cardioversion_if_condition_worsens",
      ],
      unstable: [
        "provide_oxygen_and_support_airway",
        "prepare_synchronized_cardioversion_100-200j",
        "consider_sedation_if_time_allows",
      ],
    },
  },
  {
    rhythm_id: "polymorphic_vt_torsades",
    name: "Polymorphic VT / Torsades",
    category: "wide_complex_tachycardia",
    treatment: {
      any_instability: [
        "deliver_unsynchronized_shock",
        "administer_magnesium_sulfate_iv",
        "consider_overdrive_pacing_or_isoproterenol_if_brady_related",
        "avoid_qt_prolonging_drugs",
      ],
    },
  },
  {
    rhythm_id: "ventricular_fibrillation",
    name: "Ventricular Fibrillation",
    category: "cardiac_arrest_rhythm",
    treatment_reference: "code_blue_adult_cardiac_arrest_shockable_path",
  },
  {
    rhythm_id: "pea",
    name: "Pulseless Electrical Activity",
    category: "cardiac_arrest_rhythm",
    treatment_reference: "code_blue_adult_cardiac_arrest_nonshockable_path",
  },
  {
    rhythm_id: "asystole",
    name: "Asystole",
    category: "cardiac_arrest_rhythm",
    treatment_reference: "code_blue_adult_cardiac_arrest_nonshockable_path",
  },
  {
    rhythm_id: "pvc",
    name: "Premature Ventricular Complexes",
    category: "ventricular_ectopy",
    treatment_reference: "ventricular_ectopy_treatment",
  },
];
