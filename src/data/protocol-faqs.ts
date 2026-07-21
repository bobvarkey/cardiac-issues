// Per-protocol FAQs for SEO (FAQPage schema) + on-page clinical Q&A.
// Educational use only.

export type FAQ = { q: string; a: string };

export const protocolFaqs: Record<string, FAQ[]> = {
  "code-blue": [
    {
      q: "What is the ACLS algorithm for cardiac arrest?",
      a: "Start high-quality CPR (100–120/min, ≥5 cm depth), attach a defibrillator, and check the rhythm every 2 minutes. Shock VF/pulseless VT; give epinephrine 1 mg IV/IO every 3–5 minutes and treat reversible causes (Hs and Ts). Add amiodarone 300 mg (then 150 mg) or lidocaine for refractory VF/pVT.",
    },
    {
      q: "When do you give epinephrine in a code blue?",
      a: "In non-shockable rhythms (asystole/PEA), give epinephrine 1 mg IV/IO as soon as access is available. In shockable rhythms, give it after the second defibrillation. Repeat every 3–5 minutes throughout the arrest.",
    },
    {
      q: "What are the Hs and Ts of cardiac arrest?",
      a: "Hypovolemia, Hypoxia, Hydrogen ion (acidosis), Hypo-/Hyperkalemia, Hypothermia, Tension pneumothorax, Tamponade (cardiac), Toxins, Thrombosis (pulmonary), and Thrombosis (coronary).",
    },
    {
      q: "What energy is used for defibrillation in adult VF?",
      a: "Biphasic defibrillators: use the manufacturer-recommended dose (typically 120–200 J) for the first shock, then equal or higher for subsequent shocks. Monophasic: 360 J.",
    },
  ],
  tachycardia: [
    {
      q: "What is the ACLS tachycardia algorithm?",
      a: "Assess for instability (hypotension, altered mental status, ischemic chest pain, shock, acute heart failure). If unstable with a pulse, perform synchronized cardioversion. If stable, obtain a 12-lead ECG and treat based on QRS width and regularity.",
    },
    {
      q: "When is synchronized cardioversion indicated?",
      a: "For unstable tachyarrhythmias with a pulse. Typical initial biphasic doses: narrow regular 50–100 J, narrow irregular (AF) 120–200 J, wide regular (monomorphic VT) 100 J, wide irregular (polymorphic VT) — use unsynchronized defibrillation doses.",
    },
    {
      q: "How do you treat stable SVT?",
      a: "Try vagal maneuvers first. If unsuccessful, give adenosine 6 mg rapid IV push followed by a saline flush; a second dose of 12 mg may follow. If refractory, consider beta-blockers or non-dihydropyridine calcium channel blockers, or expert consultation.",
    },
  ],
  bradycardia: [
    {
      q: "When is bradycardia symptomatic and requires treatment?",
      a: "Treat when heart rate <50/min causes hypotension, altered mental status, signs of shock, ischemic chest discomfort, or acute heart failure. Asymptomatic sinus bradycardia usually needs monitoring and cause identification only.",
    },
    {
      q: "What is the first-line drug for symptomatic bradycardia?",
      a: "Atropine 1 mg IV, repeated every 3–5 minutes up to a maximum of 3 mg. If ineffective, start transcutaneous pacing and/or a dopamine (5–20 mcg/kg/min) or epinephrine (2–10 mcg/min) infusion, and obtain expert consultation.",
    },
    {
      q: "Does atropine work for high-degree AV block?",
      a: "Atropine is often ineffective in Mobitz II or third-degree AV block because the block is below the AV node. Move quickly to transcutaneous pacing and prepare for transvenous pacing while giving chronotropic infusions.",
    },
  ],
  "atrial-fibrillation": [
    {
      q: "When should unstable atrial fibrillation be cardioverted?",
      a: "Immediately, if AF is causing hypotension, ischemic chest pain, altered mental status, shock, or acute heart failure. Use synchronized cardioversion at 120–200 J biphasic; escalate energy for repeat attempts.",
    },
    {
      q: "Rate control vs rhythm control in acute AF — which do I choose?",
      a: "For most stable AF ≥48 h or unknown duration, prioritize rate control (beta-blocker or non-dihydropyridine CCB) plus anticoagulation. For clearly recent AF <48 h, either rate or early rhythm control (electrical or pharmacologic) is reasonable based on symptoms and patient preference.",
    },
    {
      q: "When do you start anticoagulation for AF?",
      a: "Use CHA₂DS₂-VASc to guide long-term anticoagulation. Start a DOAC or warfarin for intermediate/high risk. Around cardioversion of AF ≥48 h or unknown duration, ensure ≥3 weeks of anticoagulation or a TEE-guided strategy first, then continue ≥4 weeks after.",
    },
  ],
  pvc: [
    {
      q: "When are PVCs dangerous?",
      a: "PVCs are concerning when the burden is high (typically >10–15% on Holter), when couplets, triplets, or non-sustained VT are present, when there is structural or ischemic heart disease, or when there is a family history of sudden cardiac death.",
    },
    {
      q: "What is the treatment for symptomatic PVCs without structural heart disease?",
      a: "Reassurance, reduction of caffeine/alcohol/stimulants, correction of electrolytes, and a beta-blocker for bothersome palpitations. Consider ambulatory monitoring to quantify burden and follow up if symptoms persist.",
    },
    {
      q: "When should PVCs be referred for catheter ablation?",
      a: "Refer to electrophysiology when PVC burden is high (>10–15%), when PVC-induced cardiomyopathy is suspected, or when symptoms persist despite medical therapy. Ablation is often highly effective for monomorphic PVCs from a single focus.",
    },
  ],
};
