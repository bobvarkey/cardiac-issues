import { useState } from "react";
import { Brain, ChevronDown, ChevronUp, AlertTriangle, Activity, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function SyncopeAlgorithm() {
  const [showAlgorithm, setShowAlgorithm] = useState(true);
  const [showRedFlags, setShowRedFlags] = useState(true);
  const [showECGFindings, setShowECGFindings] = useState(true);
  const [showClinicalPearls, setShowClinicalPearls] = useState(true);

  return (
    <div className="space-y-4">
      {/* Main Algorithm Flowchart */}
      <Card className="border-border/40">
        <Collapsible open={showAlgorithm} onOpenChange={setShowAlgorithm}>
          <CollapsibleTrigger asChild>
            <button className="w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-muted-foreground" />
                    Syncope — A Simple Diagnostic Approach
                  </span>
                  {showAlgorithm ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-2 space-y-3">
              <p className="text-xs text-muted-foreground">
                Diagnostic algorithm based on the flowchart: Was there complete loss of
                consciousness with spontaneous recovery?
              </p>

              {/* Start Node */}
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
                <div className="font-medium text-sm">PATIENT PRESENTS WITH SYNCOPE</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Complete loss of consciousness with spontaneous recovery?
                </div>
              </div>

              {/* Branch: NO - Other Causes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-medium">
                      NO
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      Not complete LOC
                    </span>
                  </div>
                  <div className="text-xs font-medium text-foreground mb-1">
                    Consider Other Causes:
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-0.5 ml-2">
                    <li>• Seizure</li>
                    <li>• Hypoglycemia</li>
                    <li>• TIA (Transient Ischemic Attack)</li>
                    <li>• Psychogenic (Pseudoseizure)</li>
                  </ul>
                </div>

                {/* Branch: YES - True Syncope */}
                <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success font-medium">
                      YES
                    </span>
                    <span className="text-xs font-medium text-success">TRUE SYNCOPE</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Proceed to ECG + Vitals evaluation
                  </div>
                </div>
              </div>

              {/* Step 1: Check ECG + Vitals */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold">
                    1
                  </span>
                  <span className="font-medium text-sm">Check ECG + Vitals</span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">Evaluate for RED FLAGS:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-background/50">
                    <div className="text-xs font-medium text-destructive mb-1">
                      Cardiac Red Flags
                    </div>
                    <ul className="text-xs space-y-0.5">
                      <li>• Abnormal ECG</li>
                      <li>• Exertional syncope</li>
                      <li>• Family history of sudden death</li>
                      <li>• Known structural heart disease</li>
                      <li>• Palpitations before syncope</li>
                    </ul>
                  </div>
                  <div className="p-2 rounded bg-background/50">
                    <div className="text-xs font-medium text-destructive mb-1">
                      ECG Findings to Check
                    </div>
                    <ul className="text-xs space-y-0.5">
                      <li>• QT prolongation (LQTS)</li>
                      <li>• Brugada pattern (V1-V3)</li>
                      <li>• Epsilon waves (ARVC)</li>
                      <li>• LVH, Q waves (HCM)</li>
                      <li>• AV block, BBB, WPW</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Red Flags Decision */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Red Flags = YES */}
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-medium">
                      Red Flags = YES
                    </span>
                  </div>
                  <div className="text-sm font-bold text-destructive mb-1">CARDIAC SYNCOPE</div>
                  <div className="text-xs text-muted-foreground mb-2">(Highest Risk)</div>
                  <div className="text-xs font-medium text-foreground mb-1">Causes:</div>
                  <ul className="text-xs text-muted-foreground space-y-0.5 ml-2">
                    <li>• Arrhythmias (VT, VF, brady)</li>
                    <li>• Structural heart disease</li>
                    <li>• Outflow obstruction (AS, HCM)</li>
                    <li>• Ischemia</li>
                    <li>• Pulmonary embolism</li>
                  </ul>
                  <div className="mt-2 p-2 rounded bg-background/50">
                    <div className="text-xs font-medium text-primary mb-1">Management</div>
                    <ul className="text-xs space-y-0.5">
                      <li>• Admit for monitoring</li>
                      <li>• Echo, consider EP study</li>
                      <li>• Treat underlying cause</li>
                      <li>• ICD if indicated</li>
                    </ul>
                  </div>
                </div>

                {/* Red Flags = NO */}
                <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning font-medium">
                      Red Flags = NO
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Measure Orthostatic Blood Pressure
                  </div>

                  {/* Orthostatic Decision */}
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {/* Orthostatic = YES */}
                    <div className="p-2 rounded bg-success/5 border border-success/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-success/20 text-success font-medium">
                          BP Drop ≥20 SBP or ≥10 DBP
                        </span>
                      </div>
                      <div className="text-xs font-bold text-success">ORTHOSTATIC SYNCOPE</div>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        <li>• Dehydration</li>
                        <li>• Blood loss</li>
                        <li>• Medications</li>
                        <li>• Autonomic dysfunction (Parkinson, DM)</li>
                      </ul>
                      <div className="text-xs mt-1 text-primary">
                        → Volume expansion, adjust meds
                      </div>
                    </div>

                    {/* Orthostatic = NO */}
                    <div className="p-2 rounded bg-muted/30 border border-border/30">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted font-medium">
                          No BP Drop
                        </span>
                        <span className="text-xs text-muted-foreground">
                          → Evaluate for triggers
                        </span>
                      </div>

                      {/* Trigger Decision */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="p-2 rounded bg-success/5 border border-success/20">
                          <div className="text-xs font-medium text-success mb-1">
                            Trigger Present
                          </div>
                          <ul className="text-xs text-muted-foreground space-y-0.5">
                            <li>• Pain</li>
                            <li>• Fear / Emotional stress</li>
                            <li>• Prolonged standing</li>
                            <li>• Heat exposure</li>
                            <li>• Nausea / Sweating</li>
                          </ul>
                          <div className="text-xs font-bold text-success mt-1">
                            → VASOVAGAL SYNCOPE
                          </div>
                          <div className="text-xs text-muted-foreground">(Most Common)</div>
                          <div className="text-xs mt-1 text-primary">
                            → Reassurance, avoid triggers
                          </div>
                        </div>

                        <div className="p-2 rounded bg-muted/30 border border-border/30">
                          <div className="text-xs font-medium text-muted-foreground mb-1">
                            No Trigger
                          </div>
                          <div className="text-xs font-bold text-foreground mt-1">
                            NEUROLOGICAL / UNEXPLAINED
                          </div>
                          <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                            <li>• Consider neurological causes</li>
                            <li>• Further workup needed</li>
                            <li>• Holter, event monitor</li>
                            <li>• Tilt table test</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Table */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="text-xs font-medium text-foreground mb-2">
                  Diagnostic Pathway Summary
                </div>
                <div className="overflow-x-auto">
                  <table className="text-xs w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-1 px-2">Pathway</th>
                        <th className="text-left py-1 px-2">Key Criteria</th>
                        <th className="text-left py-1 px-2">Diagnosis</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/50">
                        <td className="py-1 px-2">1</td>
                        <td className="py-1 px-2">No complete LOC</td>
                        <td className="py-1 px-2">
                          Rule out seizure, hypoglycemia, TIA, psychogenic
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-1 px-2">2A</td>
                        <td className="py-1 px-2">LOC + Red flags present</td>
                        <td className="py-1 px-2 text-destructive font-medium">
                          Cardiac syncope (highest risk)
                        </td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-1 px-2">2B</td>
                        <td className="py-1 px-2">LOC + No red flags + Orthostatic drop</td>
                        <td className="py-1 px-2 text-success">Orthostatic syncope</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-1 px-2">2C</td>
                        <td className="py-1 px-2">LOC + No red flags + No drop + Trigger</td>
                        <td className="py-1 px-2 text-success">Vasovagal syncope</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-2">2D</td>
                        <td className="py-1 px-2">LOC + No red flags + No drop + No trigger</td>
                        <td className="py-1 px-2">Neurological / Unexplained</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Red Flags Detailed */}
      <Card className="border-border/40">
        <Collapsible open={showRedFlags} onOpenChange={setShowRedFlags}>
          <CollapsibleTrigger asChild>
            <button className="w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                    Red Flags for Cardiac Syncope
                  </span>
                  {showRedFlags ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-2 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="text-sm font-medium text-destructive mb-2">History Red Flags</div>
                  <ul className="text-xs space-y-1">
                    <li>
                      • <strong>Syncope during exertion</strong> — cardiac until proven otherwise
                    </li>
                    <li>
                      • <strong>Palpitations before syncope</strong> — arrhythmia
                    </li>
                    <li>
                      • <strong>Family history of SCD &lt;50 years</strong> — channelopathy, HCM
                    </li>
                    <li>
                      • <strong>Known structural heart disease</strong> — HCM, ARVC, DCM
                    </li>
                    <li>
                      • <strong>Prior MI or heart failure</strong> — VT risk
                    </li>
                    <li>
                      • <strong>Sudden onset, no prodrome</strong> — arrhythmia
                    </li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="text-sm font-medium text-destructive mb-2">ECG Red Flags</div>
                  <ul className="text-xs space-y-1">
                    <li>
                      • <strong>QTc &gt;500ms</strong> — LQTS, drug-induced
                    </li>
                    <li>
                      • <strong>Brugada pattern</strong> — coved ST elevation V1-V3
                    </li>
                    <li>
                      • <strong>Epsilon waves</strong> — ARVC
                    </li>
                    <li>
                      • <strong>LBBB with discordant T waves</strong> — HCM
                    </li>
                    <li>
                      • <strong>Pre-excitation (delta wave)</strong> — WPW
                    </li>
                    <li>
                      • <strong>High-grade AV block</strong> — conduction disease
                    </li>
                    <li>
                      • <strong>Pathologic Q waves</strong> — prior MI
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                <div className="text-sm font-medium text-warning mb-2">
                  High-Risk Features Requiring Admission
                </div>
                <ul className="text-xs space-y-1">
                  <li>• Age &gt;60 with syncope and no clear cause</li>
                  <li>• Abnormal ECG</li>
                  <li>• Known structural heart disease or heart failure</li>
                  <li>• Exertional syncope</li>
                  <li>• Family history of SCD</li>
                  <li>• Recurrent syncope with injury</li>
                  <li>• Syncope with trauma (e.g., car accident)</li>
                </ul>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* ECG Findings */}
      <Card className="border-border/40">
        <Collapsible open={showECGFindings} onOpenChange={setShowECGFindings}>
          <CollapsibleTrigger asChild>
            <button className="w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    ECG Patterns in Syncope
                  </span>
                  {showECGFindings ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-2 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="text-sm font-medium text-primary mb-2">Channelopathies</div>
                  <ul className="text-xs space-y-1">
                    <li>
                      <strong>Long QT:</strong> QTc &gt;450ms (men), &gt;460ms (women)
                    </li>
                    <li>
                      <strong>Brugada:</strong> Type 1 coved ST elevation V1-V3
                    </li>
                    <li>
                      <strong>CPVT:</strong> Normal resting ECG, VT with exercise
                    </li>
                    <li>
                      <strong>Short QT:</strong> QTc &lt;360ms, peaked T waves
                    </li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="text-sm font-medium text-primary mb-2">Cardiomyopathies</div>
                  <ul className="text-xs space-y-1">
                    <li>
                      <strong>HCM:</strong> LVH, Q waves, LBBB with discordant T
                    </li>
                    <li>
                      <strong>ARVC:</strong> Epsilon waves, T wave inversions V1-V3
                    </li>
                    <li>
                      <strong>DCM:</strong> LBBB, low voltage, nonspecific ST-T
                    </li>
                    <li>
                      <strong>Myocarditis:</strong> ST changes, arrhythmias
                    </li>
                  </ul>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="text-sm font-medium text-primary mb-2">Conduction Disease</div>
                  <ul className="text-xs space-y-1">
                    <li>
                      <strong>High-grade AV block:</strong> No P-QRS relationship
                    </li>
                    <li>
                      <strong>Bundle branch block:</strong> Wide QRS, typical morphology
                    </li>
                    <li>
                      <strong>Bi/Trifascicular block:</strong> RBBB + LAHB/LPHB
                    </li>
                    <li>
                      <strong>Alternating BBB:</strong> Very high risk
                    </li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className="text-sm font-medium text-primary mb-2">Pre-excitation</div>
                  <ul className="text-xs space-y-1">
                    <li>
                      <strong>WPW:</strong> Short PR, delta wave, wide QRS
                    </li>
                    <li>
                      <strong>LGL:</strong> Short PR, no delta wave
                    </li>
                    <li>
                      <strong>Concealed pathway:</strong> Normal resting ECG
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Clinical Pearls */}
      <Card className="border-border/40">
        <Collapsible open={showClinicalPearls} onOpenChange={setShowClinicalPearls}>
          <CollapsibleTrigger asChild>
            <button className="w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    Clinical Pearls
                  </span>
                  {showClinicalPearls ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </CardTitle>
              </CardHeader>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-2 space-y-3">
              <div className="p-3 rounded bg-primary/5 border border-primary/20 space-y-2">
                <div className="text-xs">
                  <strong className="text-primary">• Syncope vs Seizure:</strong>{" "}
                  <span className="text-muted-foreground">
                    Syncope = rapid recovery (&lt;1 min), no postictal; Seizure = postictal
                    confusion, tongue bite, incontinence
                  </span>
                </div>
                <div className="text-xs">
                  <strong className="text-primary">• Exertional syncope:</strong>{" "}
                  <span className="text-muted-foreground">
                    Always cardiac until proven otherwise — echo, consider HCM, AS, VT
                  </span>
                </div>
                <div className="text-xs">
                  <strong className="text-primary">• Young athlete:</strong>{" "}
                  <span className="text-muted-foreground">
                    Screen for HCM, ARVC, Brugada, CPVT — may need sports restriction
                  </span>
                </div>
                <div className="text-xs">
                  <strong className="text-primary">• Normal ECG:</strong>{" "}
                  <span className="text-muted-foreground">
                    Does not exclude channelopathy — CPVT, Brugada may need provocation testing
                  </span>
                </div>
                <div className="text-xs">
                  <strong className="text-primary">• Orthostatic BP:</strong>{" "}
                  <span className="text-muted-foreground">
                    Measure supine, then after 3 minutes standing; ≥20 mmHg SBP drop is diagnostic
                  </span>
                </div>
                <div className="text-xs">
                  <strong className="text-primary">• Vasovagal:</strong>{" "}
                  <span className="text-muted-foreground">
                    Prodrome (nausea, sweating, warmth) + trigger = classic presentation
                  </span>
                </div>
                <div className="text-xs">
                  <strong className="text-primary">• Cardiac syncope:</strong>{" "}
                  <span className="text-muted-foreground">
                    No warning, sudden onset, may occur supine, often in high-risk patients
                  </span>
                </div>
                <div className="text-xs">
                  <strong className="text-primary">• Workup:</strong>{" "}
                  <span className="text-muted-foreground">
                    ECG (mandatory), echo if structural disease suspected, Holter/event monitor,
                    tilt table if recurrent and unexplained
                  </span>
                </div>
              </div>

              {/* Risk Stratification */}
              <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                <div className="text-sm font-medium text-foreground mb-2">
                  Risk Stratification (EGSYS Score)
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Higher score = higher risk of cardiac syncope
                </div>
                <ul className="text-xs space-y-1">
                  <li>
                    • <strong>Palpitations before syncope</strong> +3
                  </li>
                  <li>
                    • <strong>Abnormal ECG and/or heart disease</strong> +3
                  </li>
                  <li>
                    • <strong>Syncope during effort</strong> +2
                  </li>
                  <li>
                    • <strong>Syncope while supine</strong> +2
                  </li>
                  <li>
                    • <strong>Autonomic prodrome (nausea, warmth)</strong> −1
                  </li>
                  <li>
                    • <strong>Predisposing factors (pain, fear)</strong> −1
                  </li>
                </ul>
                <div className="text-xs mt-2 text-primary">
                  Score ≥3: High risk — admit for cardiac workup
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}
