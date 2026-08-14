import { useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Info, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  evaluateECG,
  getDefaultECGInput,
  type ECGInput,
  type ECGResult,
} from "@/lib/ecg-rule-engine";
import { scoreWobbler, type WobblerScore } from "@/lib/wobbler-scoring";
import { ecgTestCases } from "@/lib/ecg-test-cases";

export function ECGRuleEngine() {
  const [showForm, setShowForm] = useState(true);
  const [input, setInput] = useState<ECGInput>(getDefaultECGInput());
  const [result, setResult] = useState<ECGResult | null>(null);
  const [score, setScore] = useState<WobblerScore | null>(null);
  const [activeCase, setActiveCase] = useState<string | null>(null);

  const handleInputChange = (field: keyof ECGInput, value: string | number | boolean) => {
    setInput((prev) => ({ ...prev, [field]: value }));
    setActiveCase(null);
  };

  const handleEvaluate = () => {
    setResult(evaluateECG(input));
    setScore(scoreWobbler(input));
  };

  const loadCase = (id: string) => {
    const tc = ecgTestCases.find((c) => c.id === id);
    if (!tc) return;
    setInput(tc.input);
    setResult(evaluateECG(tc.input));
    setScore(scoreWobbler(tc.input));
    setActiveCase(id);
  };

  const handleReset = () => {
    setInput(getDefaultECGInput());
    setResult(null);
    setScore(null);
    setActiveCase(null);
  };


  return (
    <Card className="border-border/40">
      <Collapsible open={showForm} onOpenChange={setShowForm}>
        <CollapsibleTrigger asChild>
          <button className="w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-muted-foreground" />
                  ECG Rule Engine — Syncope Risk Stratification
                </span>
                {showForm ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </CardTitle>
            </CardHeader>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-2 space-y-4">
            <p className="text-xs text-muted-foreground">
              Enter ECG parameters to evaluate for high-risk features in syncope. Based on ESC/AHA
              guidelines.
            </p>

            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Basic Parameters */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-foreground">Basic Parameters</div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={input.heart_rate || ""}
                    onChange={(e) => handleInputChange("heart_rate", parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background"
                    placeholder="e.g., 72"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Rhythm</label>
                  <select
                    value={input.rhythm}
                    onChange={(e) => handleInputChange("rhythm", e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background"
                  >
                    <option value="sinus">Sinus</option>
                    <option value="afib">Atrial Fibrillation</option>
                    <option value="flutter">Atrial Flutter</option>
                    <option value="junctional">Junctional</option>
                    <option value="paced">Paced</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">QTc (ms)</label>
                  <input
                    type="number"
                    value={input.qtc_ms || ""}
                    onChange={(e) => handleInputChange("qtc_ms", parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background"
                    placeholder="e.g., 440"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">PR Interval (ms)</label>
                  <input
                    type="number"
                    value={input.pr_interval_ms || ""}
                    onChange={(e) =>
                      handleInputChange("pr_interval_ms", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background"
                    placeholder="e.g., 180"
                  />
                </div>
              </div>

              {/* QRS & ST-T */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-foreground">QRS & ST-T Changes</div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">QRS Duration V1 (ms)</label>
                  <input
                    type="number"
                    value={input.qrs_duration_ms_v1 || ""}
                    onChange={(e) =>
                      handleInputChange("qrs_duration_ms_v1", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background"
                    placeholder="e.g., 100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">QRS Duration Global (ms)</label>
                  <input
                    type="number"
                    value={input.qrs_duration_ms_global || ""}
                    onChange={(e) =>
                      handleInputChange("qrs_duration_ms_global", parseInt(e.target.value) || 0)
                    }
                    className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background"
                    placeholder="e.g., 100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">ST Pattern V1-V3</label>
                  <select
                    value={input.st_pattern_v1_v3}
                    onChange={(e) =>
                      handleInputChange(
                        "st_pattern_v1_v3",
                        e.target.value as "normal" | "coved" | "saddleback",
                      )
                    }
                    className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background"
                  >
                    <option value="normal">Normal</option>
                    <option value="coved">Coved (Brugada Type 1)</option>
                    <option value="saddleback">Saddleback (Brugada Type 2)</option>
                  </select>
                  <a href="/images/ecg/brugada-pattern.jpg" target="_blank" className="text-xs text-primary hover:underline ml-1">[View Brugada ECG]</a>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">T Wave V1-V3</label>
                  <select
                    value={input.t_wave_v1_v3}
                    onChange={(e) =>
                      handleInputChange(
                        "t_wave_v1_v3",
                        e.target.value as "upright" | "inverted" | "biphasic",
                      )
                    }
                    className="w-full px-2 py-1.5 text-xs rounded-md border border-border bg-background"
                  >
                    <option value="upright">Upright</option>
                    <option value="inverted">Inverted</option>
                    <option value="biphasic">Biphasic</option>
                  </select>
                </div>
              </div>

              {/* Specific Findings */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-foreground">Specific Findings</div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={input.epsilon_wave_v1_v3}
                      onChange={(e) => handleInputChange("epsilon_wave_v1_v3", e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>Epsilon waves V1-V3 (ARVC) <a href="/images/ecg/epsilon-wave.jpg" target="_blank" className="text-primary hover:underline">[View]</a></span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={input.delta_wave}
                      onChange={(e) => handleInputChange("delta_wave", e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>Delta wave (WPW)</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={input.lvh_voltage}
                      onChange={(e) => handleInputChange("lvh_voltage", e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>LVH voltage criteria</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={input.lbbb}
                      onChange={(e) => handleInputChange("lbbb", e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>LBBB</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={input.rbbb}
                      onChange={(e) => handleInputChange("rbbb", e.target.checked)}
                      className="rounded border-border"
                    />
                    <span>RBBB</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={input.q_waves_infarct_pattern}
                      onChange={(e) =>
                        handleInputChange("q_waves_infarct_pattern", e.target.checked)
                      }
                      className="rounded border-border"
                    />
                    <span>Q waves (infarct pattern)</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={input.early_repol_inferolateral}
                      onChange={(e) =>
                        handleInputChange("early_repol_inferolateral", e.target.checked)
                      }
                      className="rounded border-border"
                    />
                    <span>Early repolarization (inferolateral)</span>
                  </label>
                </div>
              </div>

              {/* High-Risk Features */}
              <div className="space-y-3 md:col-span-2 lg:col-span-1">
                <div className="text-xs font-medium text-foreground">High-Risk Features</div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={input.svt_or_vt_present}
                      onChange={(e) => handleInputChange("svt_or_vt_present", e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-destructive font-medium">SVT or VT present</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={input.high_grade_av_block}
                      onChange={(e) => handleInputChange("high_grade_av_block", e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-destructive font-medium">High-grade AV block</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={input.bradycardia_pauses}
                      onChange={(e) => handleInputChange("bradycardia_pauses", e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-destructive font-medium">Bradycardia/pauses</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={input.wellens_pattern}
                      onChange={(e) => handleInputChange("wellens_pattern", e.target.checked)}
                      className="rounded border-border"
                    />
                    <span className="text-destructive font-medium">
                      Wellens' pattern (biphasic/deep inverted T in V2–V3, pain-free)
                    </span>
                  </label>
                </div>

              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleEvaluate}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Evaluate ECG
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-muted text-foreground hover:bg-muted/80"
              >
                Reset
              </button>
            </div>

            {/* Results */}
            {result && (
              <div
                className={`mt-4 p-4 rounded-lg border ${result.is_high_risk ? "bg-destructive/5 border-destructive/30" : "bg-success/5 border-success/30"}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {result.is_high_risk ? (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  )}
                  <span
                    className={`font-medium ${result.is_high_risk ? "text-destructive" : "text-success"}`}
                  >
                    {result.is_high_risk ? "High-Risk ECG Findings" : "No High-Risk ECG Findings"}
                  </span>
                </div>

                {result.triggered_rules.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-foreground mb-1">Triggered Rules:</div>
                    <div className="flex flex-wrap gap-1">
                      {result.triggered_rules.map((rule) => (
                        <span key={rule} className="text-xs px-2 py-0.5 rounded bg-muted">
                          {rule.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.output_tags.length > 0 && (
                  <div className="mb-3">
                    <div className="text-xs font-medium text-foreground mb-1">Output Tags:</div>
                    <div className="flex flex-wrap gap-1">
                      {result.output_tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-0.5 rounded ${
                            tag === "ecg_high_risk_syncope"
                              ? "bg-destructive/20 text-destructive font-medium"
                              : "bg-muted"
                          }`}
                        >
                          {tag.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-xs font-medium text-foreground mb-1">Interpretation:</div>
                  <ul className="space-y-1">
                    {result.interpretation.map((interp, i) => (
                      <li key={i} className="text-xs">
                        {interp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Clinical Context */}
            <div className="p-3 rounded-lg bg-info/5 border border-info/20">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-info mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium text-foreground mb-1">Clinical Context</div>
                  <p>
                    This rule engine is based on ESC/AHA guidelines for syncope evaluation.
                    High-risk findings warrant urgent cardiac evaluation and may require admission.
                    Always correlate with clinical presentation.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
