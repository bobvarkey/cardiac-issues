import React, { useState, useMemo } from "react";
import { Heart, Droplet, AlertTriangle, CheckCircle, Info, ChevronRight } from "lucide-react";

// CHA₂DS₂-VASc stroke risk percentages (approximate annual risk)
const cha2ds2vascRisks: Record<number, string> = {
  0: "~0.2%",
  1: "~0.6%",
  2: "~2.0%",
  3: "~3.7%",
  4: "~5.9%",
  5: "~9.3%",
  6: "~13.6%",
  7: "~16.5%",
  8: "~19.0%",
  9: "~22.0%",
};

// HAS-BLED bleeding risk percentages (approximate annual major bleeding risk)
const hasbledRisks: Record<number, string> = {
  0: "~1.0%",
  1: "~1.9%",
  2: "~4.0%",
  3: "~6.5%",
  4: "~8.5%",
  5: "~10.0%",
  6: "~12.0%",
  7: "~14.0%",
  8: "~16.0%",
  9: "~18.0%",
};

interface Cha2ds2VascInputs {
  age: string;
  sex: "male" | "female";
  congestiveHf: boolean;
  hypertension: boolean;
  diabetes: boolean;
  strokeTiaSe: boolean;
  vascularDisease: boolean;
}

interface HasBledInputs {
  uncontrolledHtn: boolean;
  abnormalRenal: boolean;
  abnormalLiver: boolean;
  strokeHistory: boolean;
  bleedingHistory: boolean;
  labileInr: boolean;
  ageGt65: boolean;
  drugs: boolean;
  alcoholExcess: boolean;
}

function calculateCha2ds2Vasc(inputs: Cha2ds2VascInputs): { score: number; riskCategory: string; recommendation: string } {
  let score = 0;

  // Age scoring
  const age = parseInt(inputs.age) || 0;
  if (age >= 75) score += 2;
  else if (age >= 65) score += 1;

  // Standard 1-point factors
  if (inputs.congestiveHf) score += 1;
  if (inputs.hypertension) score += 1;
  if (inputs.diabetes) score += 1;
  if (inputs.vascularDisease) score += 1;

  // Stroke/TIA/SE = 2 points
  if (inputs.strokeTiaSe) score += 2;

  // Sex scoring (for women only)
  if (inputs.sex === "female") score += 1;

  // Interpretation (sex-specific)
  let riskCategory: string;
  let recommendation: string;

  if (inputs.sex === "male") {
    if (score === 0) {
      riskCategory = "Low";
      recommendation = "No OAC indicated; annual stroke risk very low.";
    } else if (score === 1) {
      riskCategory = "Intermediate";
      recommendation = "Consider OAC; individualize based on AF burden, risk modifiers, and patient preference.";
    } else {
      riskCategory = "High";
      recommendation = "OAC recommended unless contraindicated.";
    }
  } else {
    // Women: sex-only score of 1 is treated as low risk
    if (score === 1) {
      riskCategory = "Low";
      recommendation = "No OAC; isolated female sex is not an indication for anticoagulation.";
    } else if (score === 2) {
      riskCategory = "Intermediate";
      recommendation = "Consider OAC; individualize based on AF burden and risk factors.";
    } else if (score >= 3) {
      riskCategory = "High";
      recommendation = "OAC recommended unless contraindicated.";
    } else {
      riskCategory = "Low";
      recommendation = "No OAC indicated.";
    }
  }

  return { score, riskCategory, recommendation };
}

function calculateHasBled(inputs: HasBledInputs): { score: number; riskCategory: string; message: string } {
  let score = 0;

  if (inputs.uncontrolledHtn) score += 1;
  if (inputs.abnormalRenal) score += 1;
  if (inputs.abnormalLiver) score += 1;
  if (inputs.strokeHistory) score += 1;
  if (inputs.bleedingHistory) score += 1;
  if (inputs.labileInr) score += 1;
  if (inputs.ageGt65) score += 1;
  if (inputs.drugs) score += 1;
  if (inputs.alcoholExcess) score += 1;

  let riskCategory: string;
  let message: string;

  if (score <= 1) {
    riskCategory = "Low";
    message = "Low 1-year major bleeding risk (~1–3%).";
  } else if (score === 2) {
    riskCategory = "Moderate";
    message = "Moderate 1-year major bleeding risk (~4%).";
  } else {
    riskCategory = "High";
    message = "High 1-year major bleeding risk (~6–12%); address modifiable risk factors.";
  }

  return { score, riskCategory, message };
}

export function ScoresMiniApp() {
  const [activeTab, setActiveTab] = useState<"cha2ds2vasc" | "hasbled">("cha2ds2vasc");

  // CHA₂DS₂-VASc state
  const [chaInputs, setChaInputs] = useState<Cha2ds2VascInputs>({
    age: "",
    sex: "male",
    congestiveHf: false,
    hypertension: false,
    diabetes: false,
    strokeTiaSe: false,
    vascularDisease: false,
  });

  // HAS-BLED state
  const [hasInputs, setHasInputs] = useState<HasBledInputs>({
    uncontrolledHtn: false,
    abnormalRenal: false,
    abnormalLiver: false,
    strokeHistory: false,
    bleedingHistory: false,
    labileInr: false,
    ageGt65: false,
    drugs: false,
    alcoholExcess: false,
  });

  const chaResult = useMemo(() => calculateCha2ds2Vasc(chaInputs), [chaInputs]);
  const hasResult = useMemo(() => calculateHasBled(hasInputs), [hasInputs]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl p-4 md:p-8 space-y-6">
        <header className="rounded-2xl border border-cyan-400/30 bg-slate-900 p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Stroke & Bleeding Risk Scores
              </h1>
              <p className="mt-1 text-slate-400">
                CHA₂DS₂-VASc stroke risk • HAS-BLED bleeding risk
              </p>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("cha2ds2vasc")}
            className={`rounded-full px-4 py-2 border text-sm font-medium transition ${
              activeTab === "cha2ds2vasc"
                ? "bg-cyan-400 text-slate-950 border-cyan-300"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            <Heart className="inline h-4 w-4 mr-1" />
            CHA₂DS₂-VASc
          </button>
          <button
            onClick={() => setActiveTab("hasbled")}
            className={`rounded-full px-4 py-2 border text-sm font-medium transition ${
              activeTab === "hasbled"
                ? "bg-red-400 text-slate-950 border-red-300"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            <Droplet className="inline h-4 w-4 mr-1" />
            HAS-BLED
          </button>
        </div>

        {/* CHA₂DS₂-VASc Tab */}
        {activeTab === "cha2ds2vasc" && (
          <div className="grid gap-6 md:grid-cols-[1fr_280px]">
            {/* Input Form */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <h2 className="text-lg font-semibold">CHA₂DS₂-VASc Inputs</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-sm text-slate-300">Age (years)</span>
                  <input
                    type="number"
                    value={chaInputs.age}
                    onChange={(e) => setChaInputs({ ...chaInputs, age: e.target.value })}
                    placeholder="Enter age"
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 focus:border-cyan-400 focus:outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="block text-sm text-slate-300">Sex</span>
                  <select
                    value={chaInputs.sex}
                    onChange={(e) => setChaInputs({ ...chaInputs, sex: e.target.value as "male" | "female" })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 focus:border-cyan-400 focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </label>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-sm text-slate-400">Risk Factors (each = 1 point, except stroke = 2):</p>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chaInputs.congestiveHf}
                    onChange={(e) => setChaInputs({ ...chaInputs, congestiveHf: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span className="text-sm">Congestive Heart Failure (or LVEF ≤40%)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chaInputs.hypertension}
                    onChange={(e) => setChaInputs({ ...chaInputs, hypertension: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span className="text-sm">Hypertension (history or on treatment)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chaInputs.diabetes}
                    onChange={(e) => setChaInputs({ ...chaInputs, diabetes: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span className="text-sm">Diabetes Mellitus</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chaInputs.strokeTiaSe}
                    onChange={(e) => setChaInputs({ ...chaInputs, strokeTiaSe: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span className="text-sm">Stroke / TIA / Systemic Embolism <span className="text-cyan-400">(2 points)</span></span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chaInputs.vascularDisease}
                    onChange={(e) => setChaInputs({ ...chaInputs, vascularDisease: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span className="text-sm">Vascular Disease (MI, PAD, aortic plaque)</span>
                </label>
              </div>
            </section>

            {/* Results Panel */}
            <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <h2 className="text-lg font-semibold">Result</h2>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-700 text-center">
                <div className="text-5xl font-black text-cyan-400">{chaResult.score}</div>
                <div className="text-sm text-slate-400 mt-1">CHA₂DS₂-VASc Score</div>
              </div>

              <div className={`p-3 rounded-lg ${
                chaResult.riskCategory === "High" ? "bg-red-950/30 border border-red-500/50" :
                chaResult.riskCategory === "Intermediate" ? "bg-amber-950/30 border border-amber-500/50" :
                "bg-green-950/30 border border-green-500/50"
              }`}>
                <div className="flex items-center gap-2">
                  {chaResult.riskCategory === "High" ? (
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  ) : chaResult.riskCategory === "Intermediate" ? (
                    <Info className="h-4 w-4 text-amber-400" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  )}
                  <span className="font-medium">{chaResult.riskCategory} Risk</span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Annual stroke risk: {cha2ds2vascRisks[chaResult.score] || "N/A"}
                </div>
              </div>

              <div className="text-sm text-slate-300">
                {chaResult.recommendation}
              </div>

              <div className="pt-3 border-t border-slate-700 text-xs text-slate-500">
                <Info className="inline h-3 w-3 mr-1" />
                For women, a score of 1 (sex-only) is considered low risk.
              </div>
            </aside>
          </div>
        )}

        {/* HAS-BLED Tab */}
        {activeTab === "hasbled" && (
          <div className="grid gap-6 md:grid-cols-[1fr_280px]">
            {/* Input Form */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <h2 className="text-lg font-semibold">HAS-BLED Inputs</h2>

              <div className="space-y-3">
                <p className="text-sm text-slate-400">Each factor = 1 point:</p>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInputs.uncontrolledHtn}
                    onChange={(e) => setHasInputs({ ...hasInputs, uncontrolledHtn: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-red-400 focus:ring-red-400"
                  />
                  <div>
                    <span className="text-sm font-medium">H</span>
                    <span className="text-sm text-slate-400 ml-1">— Hypertension (uncontrolled, SBP &gt;160)</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInputs.abnormalRenal}
                    onChange={(e) => setHasInputs({ ...hasInputs, abnormalRenal: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-red-400 focus:ring-red-400"
                  />
                  <div>
                    <span className="text-sm font-medium">A</span>
                    <span className="text-sm text-slate-400 ml-1">— Abnormal Renal (dialysis, Cr ≥200 µmol/L)</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInputs.abnormalLiver}
                    onChange={(e) => setHasInputs({ ...hasInputs, abnormalLiver: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-red-400 focus:ring-red-400"
                  />
                  <div>
                    <span className="text-sm font-medium text-red-400">S</span>
                    <span className="text-sm text-slate-400 ml-1">— Abnormal Liver (cirrhosis, bilirubin &gt;2× ULN)</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInputs.strokeHistory}
                    onChange={(e) => setHasInputs({ ...hasInputs, strokeHistory: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-red-400 focus:ring-red-400"
                  />
                  <div>
                    <span className="text-sm font-medium text-red-400">B</span>
                    <span className="text-sm text-slate-400 ml-1">— Stroke History</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInputs.bleedingHistory}
                    onChange={(e) => setHasInputs({ ...hasInputs, bleedingHistory: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-red-400 focus:ring-red-400"
                  />
                  <div>
                    <span className="text-sm font-medium text-red-400">L</span>
                    <span className="text-sm text-slate-400 ml-1">— Bleeding History or Predisposition</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInputs.labileInr}
                    onChange={(e) => setHasInputs({ ...hasInputs, labileInr: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-red-400 focus:ring-red-400"
                  />
                  <div>
                    <span className="text-sm font-medium text-red-400">E</span>
                    <span className="text-sm text-slate-400 ml-1">— Labile INR (TTR &lt;60% on warfarin)</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInputs.ageGt65}
                    onChange={(e) => setHasInputs({ ...hasInputs, ageGt65: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-red-400 focus:ring-red-400"
                  />
                  <div>
                    <span className="text-sm font-medium text-red-400">D</span>
                    <span className="text-sm text-slate-400 ml-1">— Age &gt;65</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInputs.drugs}
                    onChange={(e) => setHasInputs({ ...hasInputs, drugs: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-red-400 focus:ring-red-400"
                  />
                  <div>
                    <span className="text-sm font-medium text-red-400">Drugs</span>
                    <span className="text-sm text-slate-400 ml-1">— Antiplatelets, NSAIDs (1 point for both)</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasInputs.alcoholExcess}
                    onChange={(e) => setHasInputs({ ...hasInputs, alcoholExcess: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-red-400 focus:ring-red-400"
                  />
                  <div>
                    <span className="text-sm font-medium text-red-400">Alcohol</span>
                    <span className="text-sm text-slate-400 ml-1">— Excess use (≥8 drinks/week)</span>
                  </div>
                </label>
              </div>
            </section>

            {/* Results Panel */}
            <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <h2 className="text-lg font-semibold">Result</h2>

              <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-700 text-center">
                <div className="text-5xl font-black text-red-400">{hasResult.score}</div>
                <div className="text-sm text-slate-400 mt-1">HAS-BLED Score</div>
              </div>

              <div className={`p-3 rounded-lg ${
                hasResult.riskCategory === "High" ? "bg-red-950/30 border border-red-500/50" :
                hasResult.riskCategory === "Moderate" ? "bg-amber-950/30 border border-amber-500/50" :
                "bg-green-950/30 border border-green-500/50"
              }`}>
                <div className="flex items-center gap-2">
                  {hasResult.riskCategory === "High" ? (
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                  ) : hasResult.riskCategory === "Moderate" ? (
                    <Info className="h-4 w-4 text-amber-400" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  )}
                  <span className="font-medium">{hasResult.riskCategory} Bleeding Risk</span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Annual major bleed risk: {hasbledRisks[hasResult.score] || "N/A"}
                </div>
              </div>

              <div className="text-sm text-slate-300">
                {hasResult.message}
              </div>

              <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200">
                    <strong>Important:</strong> High HAS-BLED alone is not a reason to withhold OAC. 
                    Use to identify and address modifiable risk factors.
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Combined Output Summary */}
        {(activeTab === "cha2ds2vasc" || activeTab === "hasbled") && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold mb-3">Combined Assessment</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">CHA₂DS₂-VASc</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-cyan-400">{chaResult.score}</span>
                  <span className="text-sm text-slate-400">{chaResult.riskCategory} stroke risk</span>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-700">
                <div className="text-xs text-slate-400 mb-1">HAS-BLED</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-red-400">{hasResult.score}</span>
                  <span className="text-sm text-slate-400">{hasResult.riskCategory} bleeding risk</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Reference */}
        <footer className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-500">
          <p>
            <strong>References:</strong> CHA₂DS₂-VASc (Lip et al., 2010) • HAS-BLED (Pisters et al., 2010) • 
            For educational reference only. Not a substitute for clinical judgment.
          </p>
        </footer>
      </div>
    </div>
  );
}