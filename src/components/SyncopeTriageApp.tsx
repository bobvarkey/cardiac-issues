import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  HeartPulse,
  Activity,
  ThermometerSun,
  ClipboardList,
  Download,
  Printer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ECGRuleEngine } from "@/components/ECGRuleEngine";

type Input = {
  trueSyncope: boolean;
  ecg: {
    abnormal: boolean;
    ischemia: boolean;
    bradycardia: boolean;
    tachycardia: boolean;
    qtProlonged: boolean;
    preexcitation: boolean;
    brugadaPattern: boolean;
    afib: boolean;
    avBlock: boolean;
  };
  redFlags: {
    exertional: boolean;
    familyHistorySuddenDeath: boolean;
    structuralHeartDisease: boolean;
    palpitationsBeforeSyncope: boolean;
    syncopeSupine: boolean;
    chestPain: boolean;
    dyspnea: boolean;
  };
  orthostatic: {
    supineSBP: number;
    standingSBP: number;
    supineDBP: number;
    standingDBP: number;
  };
  trigger: {
    pain: boolean;
    emotion: boolean;
    prolongedStanding: boolean;
    heatExposure: boolean;
    nauseaSweating: boolean;
    postMicturition: boolean;
  };
};

type Result = {
  category: "cardiac" | "orthostatic" | "vasovagal" | "unexplained" | "not_syncope";
  badge: string;
  reason: string;
  advice: string[];
};

const initial: Input = {
  trueSyncope: true,
  ecg: {
    abnormal: false,
    ischemia: false,
    bradycardia: false,
    tachycardia: false,
    qtProlonged: false,
    preexcitation: false,
    brugadaPattern: false,
    afib: false,
    avBlock: false,
  },
  redFlags: {
    exertional: false,
    familyHistorySuddenDeath: false,
    structuralHeartDisease: false,
    palpitationsBeforeSyncope: false,
    syncopeSupine: false,
    chestPain: false,
    dyspnea: false,
  },
  orthostatic: {
    supineSBP: 120,
    standingSBP: 118,
    supineDBP: 80,
    standingDBP: 78,
  },
  trigger: {
    pain: false,
    emotion: false,
    prolongedStanding: false,
    heatExposure: false,
    nauseaSweating: false,
    postMicturition: false,
  },
};

function get(obj: any, path: string): boolean {
  const [g, k] = path.split(".");
  return obj[g]?.[k] ?? false;
}

function classify(i: Input): Result {
  if (!i.trueSyncope) {
    return {
      category: "not_syncope",
      badge: "Not syncope",
      reason: "Event does not fit true syncope.",
      advice: ["Consider seizure, hypoglycemia, TIA, psychogenic TLOC, or intoxication."],
    };
  }

  const ecgRed =
    i.ecg.abnormal ||
    i.ecg.ischemia ||
    i.ecg.bradycardia ||
    i.ecg.tachycardia ||
    i.ecg.qtProlonged ||
    i.ecg.preexcitation ||
    i.ecg.brugadaPattern ||
    i.ecg.afib ||
    i.ecg.avBlock;

  const red =
    ecgRed ||
    i.redFlags.exertional ||
    i.redFlags.familyHistorySuddenDeath ||
    i.redFlags.structuralHeartDisease ||
    i.redFlags.palpitationsBeforeSyncope ||
    i.redFlags.syncopeSupine ||
    i.redFlags.chestPain ||
    i.redFlags.dyspnea;

  if (red) {
    return {
      category: "cardiac",
      badge: "High risk",
      reason: "Cardiac red flag or abnormal ECG present.",
      advice: [
        "Urgent cardiology/ED evaluation.",
        "12-lead ECG review and monitoring.",
        "Echo / telemetry / troponin as indicated.",
      ],
    };
  }

  const sbp = i.orthostatic.supineSBP - i.orthostatic.standingSBP;
  const dbp = i.orthostatic.supineDBP - i.orthostatic.standingDBP;

  if (sbp >= 20 || dbp >= 10) {
    return {
      category: "orthostatic",
      badge: "Orthostatic",
      reason: `BP drop meets criteria (${sbp}/${dbp} mmHg).`,
      advice: [
        "Check hydration, bleeding, and medications.",
        "Repeat standing BP within 3 minutes.",
        "Consider autonomic dysfunction if recurrent.",
      ],
    };
  }

  const trig =
    i.trigger.pain ||
    i.trigger.emotion ||
    i.trigger.prolongedStanding ||
    i.trigger.heatExposure ||
    i.trigger.nauseaSweating ||
    i.trigger.postMicturition;

  if (trig) {
    return {
      category: "vasovagal",
      badge: "Reflex",
      reason: "Trigger/prodrome pattern suggests vasovagal syncope.",
      advice: [
        "Education and trigger avoidance.",
        "Counterpressure maneuvers.",
        "Hydration and salt if appropriate.",
      ],
    };
  }

  return {
    category: "unexplained",
    badge: "Indeterminate",
    reason: "No red flags, orthostasis, or clear reflex trigger.",
    advice: ["Targeted follow-up with history, ECG, and selective tests."],
  };
}

export function SyncopeTriageApp() {
  const [i, setI] = useState<Input>(initial);
  const r = useMemo(() => classify(i), [i]);

  const tone =
    r.category === "cardiac"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : r.category === "orthostatic"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : r.category === "vasovagal"
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-slate-50 text-slate-700 border-slate-200";

  const set = (path: string, v: boolean) =>
    setI((p) => {
      const n = structuredClone(p) as Input;
      const [g, k] = path.split(".");
      (n as any)[g][k] = v;
      return n;
    });

  const setNum = (k: keyof Input["orthostatic"], v: number) =>
    setI((p) => ({ ...p, orthostatic: { ...p.orthostatic, [k]: v } }));

  const copy = async () => {
    const txt = `Syncope: ${r.category}\nReason: ${r.reason}\nAdvice:\n- ${r.advice.join("\n- ")}`;
    await navigator.clipboard.writeText(txt);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-[28px] bg-slate-950 p-6 text-white shadow-lg md:p-8">
        <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-[0.22em] text-slate-200">
          SYNCOPE TRIAGE
        </div>
        <h1 className="mt-4 text-3xl font-bold md:text-5xl">Fast triage for true syncope</h1>
        <p className="mt-3 max-w-3xl text-slate-300">
          Use this at the bedside to screen for cardiac risk, orthostatic hypotension, and vasovagal
          features in a few taps.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Presentation Panel */}
        <Card className="border-border/40 lg:col-span-5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList size={18} />
              Presentation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={i.trueSyncope}
                onChange={(e) => setI((p) => ({ ...p, trueSyncope: e.target.checked }))}
                className="rounded border-slate-300"
              />
              <span className="font-medium">True syncope with spontaneous recovery</span>
            </label>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertTriangle size={16} />
                Cardiac red flags
              </div>
              <div className="grid gap-1.5 pl-6">
                {[
                  ["redFlags.exertional", "Exertional syncope"],
                  ["redFlags.familyHistorySuddenDeath", "Family history sudden death"],
                  ["redFlags.structuralHeartDisease", "Known structural heart disease"],
                  ["redFlags.palpitationsBeforeSyncope", "Palpitations before syncope"],
                  ["redFlags.syncopeSupine", "Syncope while supine"],
                  ["redFlags.chestPain", "Chest pain"],
                  ["redFlags.dyspnea", "Dyspnea"],
                ].map(([k, l]) => (
                  <label key={k} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={get(i, k)}
                      onChange={(e) => set(k, e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span>{l}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orthostatic BP Panel */}
        <Card className="border-border/40 lg:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity size={18} />
              Orthostatic BP
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["supineSBP", "Supine SBP"],
                ["standingSBP", "Standing SBP"],
                ["supineDBP", "Supine DBP"],
                ["standingDBP", "Standing DBP"],
              ].map(([k, l]) => (
                <div key={k}>
                  <label className="text-xs text-muted-foreground">{l}</label>
                  <input
                    type="number"
                    value={i.orthostatic[k as keyof Input["orthostatic"]]}
                    onChange={(e) =>
                      setNum(k as keyof Input["orthostatic"], parseInt(e.target.value) || 0)
                    }
                    className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-warning">
                <ThermometerSun size={16} />
                Triggers / prodrome
              </div>
              <div className="grid gap-1.5 pl-6">
                {[
                  ["trigger.pain", "Pain"],
                  ["trigger.emotion", "Emotion / fear"],
                  ["trigger.prolongedStanding", "Prolonged standing"],
                  ["trigger.heatExposure", "Heat exposure"],
                  ["trigger.nauseaSweating", "Nausea / sweating"],
                  ["trigger.postMicturition", "Post-micturition"],
                ].map(([k, l]) => (
                  <label key={k} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={get(i, k)}
                      onChange={(e) => set(k, e.target.checked)}
                      className="rounded border-slate-300"
                    />
                    <span>{l}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ECG Checklist Panel */}
        <Card className="border-border/40 lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <HeartPulse size={18} />
              ECG checklist
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 space-y-2">
            {[
              ["ecg.abnormal", "Abnormal ECG"],
              ["ecg.ischemia", "Ischemic changes"],
              ["ecg.bradycardia", "Bradycardia"],
              ["ecg.tachycardia", "Tachycardia"],
              ["ecg.qtProlonged", "QT prolongation"],
              ["ecg.preexcitation", "Pre-excitation"],
              ["ecg.brugadaPattern", "Brugada pattern"],
              ["ecg.afib", "Atrial fibrillation"],
              ["ecg.avBlock", "AV block"],
            ].map(([k, l]) => (
              <label key={k} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={get(i, k)}
                  onChange={(e) => set(k, e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span>{l}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Result Panel */}
      <div className={`rounded-3xl border p-5 shadow-lg ${tone}`}>
        <div className="text-xs font-semibold uppercase tracking-[0.22em]">Disposition</div>
        <div className="mt-2 text-3xl font-bold capitalize">{r.badge}</div>
        <div className="mt-2 text-sm">{r.reason}</div>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
          {r.advice.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
        <div className="mt-5 flex gap-2">
          <button
            onClick={copy}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Download size={16} />
            Copy
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>

      {/* ECG Rule Engine */}
      <ECGRuleEngine />
    </div>
  );
}
