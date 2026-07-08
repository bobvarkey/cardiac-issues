import React, { useState, useMemo } from "react";
import { Pill, AlertTriangle, CheckCircle, Info, ChevronRight, Activity, Droplet } from "lucide-react";

// ATRIA bleeding risk percentages (approximate annual major bleeding risk)
const atriaRisks: Record<string, string> = {
  low: "~0.4–1.5%/year",
  intermediate: "~2.5%/year",
  high: "~5–10%/year",
};

interface INRReading {
  date: string;
  value: number;
}

interface WarfarinInputs {
  currentINR: string;
  targetLow: string;
  targetHigh: string;
  weeklyDose: string;
  bleedingSymptoms: boolean;
  thromboticEvent: boolean;
  interactingDrug: boolean;
  recentINRs: INRReading[];
}

interface ATRIAInputs {
  anemia: boolean;
  severeRenalDisease: boolean;
  ageGe75: boolean;
  priorBleeding: boolean;
  hypertension: boolean;
}

function calculateINRAdjustment(inputs: WarfarinInputs): {
  band: string;
  action: string;
  newWeeklyDose: string;
  doseChange: number;
  omitDoses: number;
  nextINRDays: number;
  hold: boolean;
  vitaminK: boolean;
  emergency: boolean;
} {
  const inr = parseFloat(inputs.currentINR) || 0;
  const targetLow = parseFloat(inputs.targetLow) || 2.0;
  const targetHigh = parseFloat(inputs.targetHigh) || 3.0;
  const weeklyDose = parseFloat(inputs.weeklyDose) || 0;

  // Emergency situations
  if (inputs.thromboticEvent) {
    return {
      band: "Acute Thrombotic Event",
      action: "Refer to acute thrombosis protocol — algorithm not applicable",
      newWeeklyDose: inputs.weeklyDose,
      doseChange: 0,
      omitDoses: 0,
      nextINRDays: 0,
      hold: false,
      vitaminK: false,
      emergency: true,
    };
  }

  if (inputs.bleedingSymptoms) {
    return {
      band: "Active Bleeding",
      action: "Follow bleeding management protocol — hold warfarin, consider vitamin K, PCC/FFP if major bleed",
      newWeeklyDose: inputs.weeklyDose,
      doseChange: 0,
      omitDoses: 999,
      nextINRDays: 0,
      hold: true,
      vitaminK: true,
      emergency: true,
    };
  }

  // INR band determination
  if (inr < 1.5) {
    return {
      band: "Very Low (<1.5)",
      action: "Increase weekly dose by 10–20%; consider loading if new to warfarin",
      newWeeklyDose: (weeklyDose * 1.15).toFixed(0),
      doseChange: 15,
      omitDoses: 0,
      nextINRDays: 7,
      hold: false,
      vitaminK: false,
      emergency: false,
    };
  }

  if (inr >= 1.5 && inr < targetLow) {
    return {
      band: "Slightly Low",
      action: "Increase weekly dose by 5–10%",
      newWeeklyDose: (weeklyDose * 1.075).toFixed(0),
      doseChange: 7.5,
      omitDoses: 0,
      nextINRDays: 7,
      hold: false,
      vitaminK: false,
      emergency: false,
    };
  }

  if (inr >= targetLow && inr <= targetHigh) {
    return {
      band: "In Range",
      action: "No dose change needed",
      newWeeklyDose: inputs.weeklyDose,
      doseChange: 0,
      omitDoses: 0,
      nextINRDays: 14,
      hold: false,
      vitaminK: false,
      emergency: false,
    };
  }

  if (inr > targetHigh && inr <= 3.5) {
    return {
      band: "Slightly High",
      action: "Reduce weekly dose by 5–10%; consider omitting next dose if trending up",
      newWeeklyDose: (weeklyDose * 0.925).toFixed(0),
      doseChange: -7.5,
      omitDoses: 1,
      nextINRDays: 7,
      hold: false,
      vitaminK: false,
      emergency: false,
    };
  }

  if (inr > 3.5 && inr <= 5.0) {
    return {
      band: "Moderately High",
      action: "Omit 1–2 doses; resume at 10–20% lower dose when INR <3.5",
      newWeeklyDose: (weeklyDose * 0.85).toFixed(0),
      doseChange: -15,
      omitDoses: 2,
      nextINRDays: 5,
      hold: false,
      vitaminK: false,
      emergency: false,
    };
  }

  if (inr > 5.0 && inr <= 9.0) {
    return {
      band: "Very High",
      action: "Hold warfarin; consider low-dose vitamin K (1–2.5mg orally); resume at 15–25% lower dose",
      newWeeklyDose: (weeklyDose * 0.80).toFixed(0),
      doseChange: -20,
      omitDoses: 999,
      nextINRDays: 2,
      hold: true,
      vitaminK: true,
      emergency: false,
    };
  }

  // INR > 9.0
  return {
    band: "Extremely High (>9.0)",
    action: "Emergency: Hold warfarin, give vitamin K 2.5–5mg orally/IV; consider PCC/FFP if bleeding; urgent referral",
    newWeeklyDose: inputs.weeklyDose,
    doseChange: 0,
    omitDoses: 999,
    nextINRDays: 1,
    hold: true,
    vitaminK: true,
    emergency: true,
  };
}

function calculateLabileINR(readings: INRReading[], targetLow: number, targetHigh: number): {
  isLabile: boolean;
  proportionInRange: number;
  totalReadings: number;
  recommendations: string[];
} {
  if (readings.length < 4) {
    return {
      isLabile: false,
      proportionInRange: 0,
      totalReadings: readings.length,
      recommendations: ["Insufficient data — need at least 4 INR readings to assess stability"],
    };
  }

  const inRange = readings.filter((r) => r.value >= targetLow && r.value <= targetHigh).length;
  const proportion = inRange / readings.length;
  const isLabile = proportion < 0.6;

  const recommendations: string[] = [];
  if (isLabile) {
    recommendations.push("Increase INR checks to every 1–2 weeks until stable");
    recommendations.push("Assess adherence, diet (vitamin K intake), and alcohol use");
    recommendations.push("Review all interacting medications (antibiotics, amiodarone, etc.)");
    recommendations.push("Standardize weekly dosing with a fixed calendar schedule");
    recommendations.push("Consider referral to anticoagulation clinic or patient self-management");
    recommendations.push("If persistent and CHA₂DS₂-VASc high, evaluate DOAC switch");
  }

  return {
    isLabile,
    proportionInRange: Math.round(proportion * 100),
    totalReadings: readings.length,
    recommendations,
  };
}

function calculateATRIA(inputs: ATRIAInputs): {
  score: number;
  riskCategory: string;
  message: string;
} {
  let score = 0;

  if (inputs.anemia) score += 3;
  if (inputs.severeRenalDisease) score += 3;
  if (inputs.ageGe75) score += 2;
  if (inputs.priorBleeding) score += 1;
  if (inputs.hypertension) score += 1;

  let riskCategory: string;
  let message: string;

  if (score <= 3) {
    riskCategory = "Low";
    message = "Low 1-year major bleeding risk (~0.4–1.5%/year)";
  } else if (score === 4) {
    riskCategory = "Intermediate";
    message = "Intermediate 1-year major bleeding risk (~2.5%/year)";
  } else {
    riskCategory = "High";
    message = "High 1-year major bleeding risk (~5–10%/year); address modifiable factors and monitor closely";
  }

  return { score, riskCategory, message };
}

export function WarfarinMiniApp() {
  const [activeTab, setActiveTab] = useState<"inr" | "labile" | "atria">("inr");

  // INR adjustment inputs
  const [inrInputs, setINRInputs] = useState<WarfarinInputs>({
    currentINR: "",
    targetLow: "2.0",
    targetHigh: "3.0",
    weeklyDose: "",
    bleedingSymptoms: false,
    thromboticEvent: false,
    interactingDrug: false,
    recentINRs: [],
  });

  // ATRIA inputs
  const [atriaInputs, setATRIAInputs] = useState<ATRIAInputs>({
    anemia: false,
    severeRenalDisease: false,
    ageGe75: false,
    priorBleeding: false,
    hypertension: false,
  });

  // Labile INR inputs
  const [newINRValue, setNewINRValue] = useState("");

  const inrResult = useMemo(() => calculateINRAdjustment(inrInputs), [inrInputs]);
  const labileResult = useMemo(
    () => calculateLabileINR(inrInputs.recentINRs, parseFloat(inrInputs.targetLow), parseFloat(inrInputs.targetHigh)),
    [inrInputs.recentINRs, inrInputs.targetLow, inrInputs.targetHigh]
  );
  const atriaResult = useMemo(() => calculateATRIA(atriaInputs), [atriaInputs]);

  const addINRReading = () => {
    const value = parseFloat(newINRValue);
    if (value > 0) {
      setINRInputs({
        ...inrInputs,
        recentINRs: [
          ...inrInputs.recentINRs,
          { date: new Date().toISOString().split("T")[0], value },
        ],
      });
      setNewINRValue("");
    }
  };

  const clearINRReadings = () => {
    setINRInputs({ ...inrInputs, recentINRs: [] });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl p-4 md:p-8 space-y-6">
        <header className="rounded-2xl border border-cyan-400/30 bg-slate-900 p-5 shadow-xl">
          <div className="flex items-center gap-3">
            <Pill className="h-8 w-8 text-cyan-400" />
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Warfarin/INR Monitoring
              </h1>
              <p className="mt-1 text-slate-400">
                Dose adjustment • Labile INR • ATRIA bleeding risk
              </p>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("inr")}
            className={`rounded-full px-4 py-2 border text-sm font-medium transition ${
              activeTab === "inr"
                ? "bg-cyan-400 text-slate-950 border-cyan-300"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            <Activity className="inline h-4 w-4 mr-1" />
            INR Adjustment
          </button>
          <button
            onClick={() => setActiveTab("labile")}
            className={`rounded-full px-4 py-2 border text-sm font-medium transition ${
              activeTab === "labile"
                ? "bg-amber-400 text-slate-950 border-amber-300"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            <AlertTriangle className="inline h-4 w-4 mr-1" />
            Labile INR
          </button>
          <button
            onClick={() => setActiveTab("atria")}
            className={`rounded-full px-4 py-2 border text-sm font-medium transition ${
              activeTab === "atria"
                ? "bg-red-400 text-slate-950 border-red-300"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            <Droplet className="inline h-4 w-4 mr-1" />
            ATRIA Score
          </button>
        </div>

        {/* INR Adjustment Tab */}
        {activeTab === "inr" && (
          <div className="grid gap-6 md:grid-cols-[1fr_280px]">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <h2 className="text-lg font-semibold">INR Dose Adjustment</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-sm text-slate-300">Current INR</span>
                  <input
                    type="number"
                    step="0.1"
                    value={inrInputs.currentINR}
                    onChange={(e) => setINRInputs({ ...inrInputs, currentINR: e.target.value })}
                    placeholder="e.g., 2.5"
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 focus:border-cyan-400 focus:outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="block text-sm text-slate-300">Weekly Dose (mg)</span>
                  <input
                    type="number"
                    value={inrInputs.weeklyDose}
                    onChange={(e) => setINRInputs({ ...inrInputs, weeklyDose: e.target.value })}
                    placeholder="e.g., 35"
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 focus:border-cyan-400 focus:outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-sm text-slate-300">Target INR Low</span>
                  <input
                    type="number"
                    step="0.1"
                    value={inrInputs.targetLow}
                    onChange={(e) => setINRInputs({ ...inrInputs, targetLow: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 focus:border-cyan-400 focus:outline-none"
                  />
                </label>

                <label className="space-y-2">
                  <span className="block text-sm text-slate-300">Target INR High</span>
                  <input
                    type="number"
                    step="0.1"
                    value={inrInputs.targetHigh}
                    onChange={(e) => setINRInputs({ ...inrInputs, targetHigh: e.target.value })}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 focus:border-cyan-400 focus:outline-none"
                  />
                </label>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-sm text-slate-400">Clinical Flags:</p>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inrInputs.bleedingSymptoms}
                    onChange={(e) => setINRInputs({ ...inrInputs, bleedingSymptoms: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-red-400 focus:ring-red-400"
                  />
                  <span className="text-sm">Active bleeding symptoms</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inrInputs.thromboticEvent}
                    onChange={(e) => setINRInputs({ ...inrInputs, thromboticEvent: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-red-400 focus:ring-red-400"
                  />
                  <span className="text-sm">Acute thrombotic event</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inrInputs.interactingDrug}
                    onChange={(e) => setINRInputs({ ...inrInputs, interactingDrug: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-amber-400 focus:ring-amber-400"
                  />
                  <span className="text-sm">Interacting drug started/stopped</span>
                </label>
              </div>
            </section>

            {/* Results Panel */}
            <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <h2 className="text-lg font-semibold">Result</h2>

              <div className={`p-4 rounded-xl ${
                inrResult.emergency ? "bg-red-950/50 border border-red-500/50" :
                inrResult.hold ? "bg-amber-950/50 border border-amber-500/50" :
                inrResult.doseChange === 0 ? "bg-green-950/50 border border-green-500/50" :
                "bg-slate-950/50 border border-slate-700"
              }`}>
                <div className="text-sm text-slate-400 mb-1">INR Band</div>
                <div className="text-xl font-bold">{inrResult.band}</div>
              </div>

              {inrResult.emergency && (
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/50">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <div className="text-sm text-red-200">{inrResult.action}</div>
                  </div>
                </div>
              )}

              {!inrResult.emergency && (
                <>
                  <div className="text-sm text-slate-300">{inrResult.action}</div>

                  {inrInputs.weeklyDose && (
                    <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-700">
                      <div className="text-xs text-slate-400">New Weekly Dose</div>
                      <div className="text-xl font-bold text-cyan-400">
                        {inrResult.newWeeklyDose} mg
                        {inrResult.doseChange !== 0 && (
                          <span className="text-sm text-slate-400 ml-2">
                            ({inrResult.doseChange > 0 ? "+" : ""}{inrResult.doseChange.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {inrResult.omitDoses > 0 && !inrResult.hold && (
                    <div className="text-sm text-amber-200">
                      <AlertTriangle className="inline h-4 w-4 mr-1" />
                      Omit {inrResult.omitDoses} dose{inrResult.omitDoses > 1 ? "s" : ""} before resuming
                    </div>
                  )}

                  {inrResult.hold && (
                    <div className="text-sm text-amber-200">
                      <AlertTriangle className="inline h-4 w-4 mr-1" />
                      Hold warfarin until INR returns to range
                    </div>
                  )}

                  {inrResult.vitaminK && (
                    <div className="text-sm text-amber-200">
                      Consider low-dose vitamin K (1–2.5mg orally)
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-700">
                    <div className="text-xs text-slate-400">Next INR Check</div>
                    <div className="text-lg font-medium">In {inrResult.nextINRDays} day{inrResult.nextINRDays !== 1 ? "s" : ""}</div>
                  </div>
                </>
              )}
            </aside>
          </div>
        )}

        {/* Labile INR Tab */}
        {activeTab === "labile" && (
          <div className="grid gap-6 md:grid-cols-[1fr_280px]">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <h2 className="text-lg font-semibold">Labile INR Assessment</h2>
              <p className="text-sm text-slate-400">
                Enter recent INR readings to assess time in therapeutic range (TTR).
              </p>

              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={newINRValue}
                  onChange={(e) => setNewINRValue(e.target.value)}
                  placeholder="INR value"
                  className="flex-1 rounded-xl bg-slate-950 border border-slate-700 p-3 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  onClick={addINRReading}
                  className="rounded-xl bg-cyan-400 text-slate-950 px-4 py-2 font-medium hover:bg-cyan-300"
                >
                  Add
                </button>
              </div>

              {inrInputs.recentINRs.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">Recent Readings ({inrInputs.recentINRs.length})</span>
                    <button
                      onClick={clearINRReadings}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {inrInputs.recentINRs.map((r, i) => (
                      <div
                        key={i}
                        className={`px-3 py-1 rounded-full text-sm ${
                          r.value >= parseFloat(inrInputs.targetLow) && r.value <= parseFloat(inrInputs.targetHigh)
                            ? "bg-green-950/50 border border-green-500/50 text-green-200"
                            : "bg-red-950/50 border border-red-500/50 text-red-200"
                        }`}
                      >
                        {r.value}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-700 text-xs text-slate-400">
                <Info className="inline h-3 w-3 mr-1" />
                Labile INR is defined as TTR &lt;60% (proportion of readings in target range &lt;0.6).
                Affects HAS-BLED score and may indicate need for DOAC evaluation.
              </div>
            </section>

            <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <h2 className="text-lg font-semibold">TTR Assessment</h2>

              <div className={`p-4 rounded-xl ${
                labileResult.isLabile ? "bg-amber-950/50 border border-amber-500/50" : "bg-green-950/50 border border-green-500/50"
              }`}>
                <div className="text-sm text-slate-400 mb-1">Readings in Range</div>
                <div className="text-3xl font-bold">
                  {labileResult.totalReadings > 0 ? `${labileResult.proportionInRange}%` : "--"}
                </div>
                <div className="text-sm mt-1">
                  {labileResult.totalReadings < 4 ? (
                    <span className="text-slate-400">Need ≥4 readings</span>
                  ) : labileResult.isLabile ? (
                    <span className="text-amber-300">Labile INR detected</span>
                  ) : (
                    <span className="text-green-300">Stable INR</span>
                  )}
                </div>
              </div>

              {labileResult.recommendations.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-amber-300">Recommendations:</div>
                  <ul className="space-y-1">
                    {labileResult.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <ChevronRight className="h-3 w-3 mt-0.5 text-amber-400 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* ATRIA Tab */}
        {activeTab === "atria" && (
          <div className="grid gap-6 md:grid-cols-[1fr_280px]">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <h2 className="text-lg font-semibold">ATRIA Bleeding Risk Score</h2>
              <p className="text-sm text-slate-400">
                Estimates major bleeding risk in AF patients on warfarin.
              </p>

              <div className="space-y-3">
                <p className="text-sm text-slate-300">Each factor scores points:</p>

                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg bg-slate-950/50 border border-slate-700">
                  <div>
                    <span className="font-medium">Anemia</span>
                    <span className="text-sm text-slate-400 ml-2">(Hb &lt;13/12 or history)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-red-400 font-bold">+3</span>
                    <input
                      type="checkbox"
                      checked={atriaInputs.anemia}
                      onChange={(e) => setATRIAInputs({ ...atriaInputs, anemia: e.target.checked })}
                      className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-red-400 focus:ring-red-400"
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg bg-slate-950/50 border border-slate-700">
                  <div>
                    <span className="font-medium">Severe Renal Disease</span>
                    <span className="text-sm text-slate-400 ml-2">(eGFR &lt;30 or dialysis)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-red-400 font-bold">+3</span>
                    <input
                      type="checkbox"
                      checked={atriaInputs.severeRenalDisease}
                      onChange={(e) => setATRIAInputs({ ...atriaInputs, severeRenalDisease: e.target.checked })}
                      className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-red-400 focus:ring-red-400"
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg bg-slate-950/50 border border-slate-700">
                  <div>
                    <span className="font-medium">Age ≥75</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold">+2</span>
                    <input
                      type="checkbox"
                      checked={atriaInputs.ageGe75}
                      onChange={(e) => setATRIAInputs({ ...atriaInputs, ageGe75: e.target.checked })}
                      className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-amber-400 focus:ring-amber-400"
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg bg-slate-950/50 border border-slate-700">
                  <div>
                    <span className="font-medium">Prior Bleeding</span>
                    <span className="text-sm text-slate-400 ml-2">(any major bleed)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold">+1</span>
                    <input
                      type="checkbox"
                      checked={atriaInputs.priorBleeding}
                      onChange={(e) => setATRIAInputs({ ...atriaInputs, priorBleeding: e.target.checked })}
                      className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-amber-400 focus:ring-amber-400"
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer p-3 rounded-lg bg-slate-950/50 border border-slate-700">
                  <div>
                    <span className="font-medium">Hypertension</span>
                    <span className="text-sm text-slate-400 ml-2">(history)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold">+1</span>
                    <input
                      type="checkbox"
                      checked={atriaInputs.hypertension}
                      onChange={(e) => setATRIAInputs({ ...atriaInputs, hypertension: e.target.checked })}
                      className="h-5 w-5 rounded border-slate-600 bg-slate-950 text-amber-400 focus:ring-amber-400"
                    />
                  </div>
                </label>
              </div>
            </section>

            <aside className="rounded-2xl border border-slate-800 bg-slate-900 p-5 space-y-4">
              <h2 className="text-lg font-semibold">Result</h2>

              <div className={`p-4 rounded-xl ${
                atriaResult.riskCategory === "High" ? "bg-red-950/50 border border-red-500/50" :
                atriaResult.riskCategory === "Intermediate" ? "bg-amber-950/50 border border-amber-500/50" :
                "bg-green-950/50 border border-green-500/50"
              }`}>
                <div className="text-sm text-slate-400 mb-1">ATRIA Score</div>
                <div className="text-5xl font-black">{atriaResult.score}</div>
                <div className="text-sm mt-1">
                  <span className={
                    atriaResult.riskCategory === "High" ? "text-red-300" :
                    atriaResult.riskCategory === "Intermediate" ? "text-amber-300" :
                    "text-green-300"
                  }>
                    {atriaResult.riskCategory} Risk
                  </span>
                </div>
              </div>

              <div className="text-sm text-slate-300">{atriaResult.message}</div>

              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-700">
                <div className="text-xs text-slate-400 mb-2">Annual Major Bleed Risk</div>
                <div className="text-sm">
                  Low (0–3): ~0.4–1.5%<br/>
                  Intermediate (4): ~2.5%<br/>
                  High (≥5): ~5–10%
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Reference */}
        <footer className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-xs text-slate-500">
          <p>
            <strong>References:</strong> Warfarin dose adjustment (ACCP guidelines, community protocols) • 
            Labile INR (TTR &lt;60%) • ATRIA (Pisters et al., 2011) • 
            For educational reference only. Not a substitute for clinical judgment.
          </p>
        </footer>
      </div>
    </div>
  );
}