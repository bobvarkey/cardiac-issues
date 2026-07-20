import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckSquare,
  ChevronDown,
  Download,
  FileText,
  Pause,
  Play,
  Plus,
  Printer,
  RotateCcw,
  ShieldCheck,
  Timer,
  Trash2,
} from "lucide-react";

type ProtocolType = "standard" | "italian";

type Phase = {
  id: string;
  label: string;
  targetSec: number;
};

const PHASES: Record<ProtocolType, Phase[]> = {
  standard: [
    { id: "supine", label: "Supine rest", targetSec: 10 * 60 },
    { id: "tilt", label: "Passive tilt 60–70°", targetSec: 45 * 60 },
    { id: "recovery", label: "Recovery (supine)", targetSec: 5 * 60 },
  ],
  italian: [
    { id: "supine", label: "Supine rest", targetSec: 10 * 60 },
    { id: "tilt", label: "Passive tilt 70°", targetSec: 20 * 60 },
    { id: "ntg", label: "SL Nitroglycerin 400 µg", targetSec: 20 * 60 },
    { id: "recovery", label: "Recovery (supine)", targetSec: 5 * 60 },
  ],
};

type Vital = {
  id: string;
  t: number; // seconds since start
  phaseId: string;
  hr: string;
  sbp: string;
  dbp: string;
  symptoms: string;
};

type Interp =
  | "non-diagnostic"
  | "reflex-vasodepressor"
  | "reflex-cardioinhibitory"
  | "reflex-mixed"
  | "orthostatic-hypotension"
  | "delayed-oh"
  | "pots";

const INTERP_LABEL: Record<Interp, string> = {
  "non-diagnostic": "Non-diagnostic",
  "reflex-vasodepressor": "Reflex syncope — vasodepressor (VASIS 3)",
  "reflex-cardioinhibitory": "Reflex syncope — cardioinhibitory (VASIS 2A/2B)",
  "reflex-mixed": "Reflex syncope — mixed (VASIS 1)",
  "orthostatic-hypotension": "Classical orthostatic hypotension",
  "delayed-oh": "Delayed orthostatic hypotension",
  pots: "POTS (ΔHR ≥30 bpm without hypotension)",
};

type ChecklistCategory = {
  id: string;
  title: string;
  items: { id: string; label: string; required?: boolean }[];
};

const CHECKLIST: ChecklistCategory[] = [
  {
    id: "equipment",
    title: "Equipment",
    items: [
      { id: "eq-tilt", label: "Tilt table verified, footboard secured, straps intact", required: true },
      { id: "eq-emerg", label: "Crash cart & defibrillator at bedside, checked", required: true },
      { id: "eq-suction", label: "Suction + O₂ + BVM available", required: true },
      { id: "eq-meds", label: "Rescue meds drawn: atropine 1 mg, NS 500 mL", required: true },
      { id: "eq-ntg", label: "SL nitroglycerin available (Italian / provocation)" },
    ],
  },
  {
    id: "monitoring",
    title: "Monitoring",
    items: [
      { id: "mon-ecg", label: "Continuous 3- or 5-lead ECG attached, quality verified", required: true },
      { id: "mon-bp", label: "Beat-to-beat BP (Finapres/Nexfin) or automated cuff q1 min", required: true },
      { id: "mon-spo2", label: "SpO₂ probe on and reading", required: true },
      { id: "mon-recorder", label: "Rhythm strip recording enabled" },
    ],
  },
  {
    id: "baseline",
    title: "Baseline vitals (supine ≥ 5 min)",
    items: [
      { id: "bl-hr", label: "Baseline HR recorded", required: true },
      { id: "bl-bp", label: "Baseline BP recorded (both arms first visit)", required: true },
      { id: "bl-rhythm", label: "Baseline rhythm documented (sinus / other)", required: true },
      { id: "bl-symptoms", label: "Baseline symptoms noted" },
    ],
  },
  {
    id: "access",
    title: "IV access",
    items: [
      { id: "iv-line", label: "Patent 18–20 G peripheral IV, flushes freely", required: true },
      { id: "iv-fluid", label: "NS carrier at TKO or capped saline-lock", required: true },
    ],
  },
  {
    id: "safety",
    title: "Safety & consent",
    items: [
      { id: "sf-consent", label: "Informed consent obtained & documented", required: true },
      { id: "sf-npo", label: "NPO ≥ 2 h confirmed", required: true },
      { id: "sf-meds", label: "Vasoactive meds reviewed / held as appropriate", required: true },
      { id: "sf-contra", label: "Contraindications screened (severe AS, HOCM, PDE5 <24 h, recent MI)", required: true },
      { id: "sf-pdstaff", label: "Trained clinician present throughout study", required: true },
      { id: "sf-pregnancy", label: "Pregnancy status considered (if applicable)" },
    ],
  },
];

const ALL_REQUIRED_IDS = CHECKLIST.flatMap((c) =>
  c.items.filter((i) => i.required).map((i) => i.id),
);

type State = {
  protocol: ProtocolType;
  phaseIdx: number;
  running: boolean;
  elapsed: number; // seconds
  lastTick: number | null; // epoch ms when running started/resumed
  vitals: Vital[];
  symptomsReproduced: boolean;
  typicalSymptoms: string;
  impression: string;
  interpretation: Interp;
  patientId: string;
  checklist: Record<string, boolean>;
  checklistOverride: boolean;
};

const STORAGE_KEY = "hutt.miniapp.v2";

const DEFAULT_STATE: State = {
  protocol: "standard",
  phaseIdx: 0,
  running: false,
  elapsed: 0,
  lastTick: null,
  vitals: [],
  symptomsReproduced: false,
  typicalSymptoms: "",
  impression: "",
  interpretation: "non-diagnostic",
  patientId: "",
  checklist: {},
  checklistOverride: false,
};

function loadState(): State {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as State;
    // If timer was running when tab closed, add drift then pause.
    if (parsed.running && parsed.lastTick) {
      const drift = Math.max(0, Math.floor((Date.now() - parsed.lastTick) / 1000));
      parsed.elapsed += drift;
      parsed.running = false;
      parsed.lastTick = null;
    }
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function HUTTMiniApp() {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [draft, setDraft] = useState<{ hr: string; sbp: string; dbp: string; symptoms: string }>({
    hr: "",
    sbp: "",
    dbp: "",
    symptoms: "",
  });
  const rafRef = useRef<number | null>(null);
  const tickRef = useRef<number>(0);

  // hydrate
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  // ticking
  useEffect(() => {
    if (!state.running) return;
    let raf: number;
    const step = () => {
      const now = Date.now();
      if (now - tickRef.current >= 1000) {
        tickRef.current = now;
        setState((s) => (s.running ? { ...s, elapsed: s.elapsed + 1 } : s));
      }
      raf = window.requestAnimationFrame(step);
    };
    tickRef.current = Date.now();
    raf = window.requestAnimationFrame(step);
    rafRef.current = raf;
    return () => window.cancelAnimationFrame(raf);
  }, [state.running]);

  const phases = PHASES[state.protocol];
  const currentPhase = phases[Math.min(state.phaseIdx, phases.length - 1)];
  const phaseTarget = currentPhase.targetSec;

  function update<K extends keyof State>(patch: Pick<State, K> | Partial<State>) {
    setState((s) => ({ ...s, ...patch }));
  }

  function toggleProtocol(p: ProtocolType) {
    if (p === state.protocol) return;
    update({ protocol: p, phaseIdx: 0 });
  }

  const missingRequired = ALL_REQUIRED_IDS.filter((id) => !state.checklist[id]);
  const canStart = state.checklistOverride || missingRequired.length === 0;

  function startPause() {
    if (!state.running && !canStart) return;
    update({ running: !state.running, lastTick: !state.running ? Date.now() : null });
  }

  function toggleCheck(id: string) {
    update({ checklist: { ...state.checklist, [id]: !state.checklist[id] } });
  }

  function checkAll() {
    const next: Record<string, boolean> = { ...state.checklist };
    CHECKLIST.forEach((c) => c.items.forEach((i) => (next[i.id] = true)));
    update({ checklist: next });
  }

  function clearChecks() {
    update({ checklist: {}, checklistOverride: false });
  }

  function reset() {
    update({
      running: false,
      elapsed: 0,
      phaseIdx: 0,
      lastTick: null,
      vitals: [],
      checklist: {},
      checklistOverride: false,
    });
  }

  function nextPhase() {
    if (state.phaseIdx < phases.length - 1) {
      update({ phaseIdx: state.phaseIdx + 1 });
    }
  }

  function addVital() {
    if (!draft.hr && !draft.sbp && !draft.dbp && !draft.symptoms.trim()) return;
    const v: Vital = {
      id: Math.random().toString(36).slice(2, 9),
      t: state.elapsed,
      phaseId: currentPhase.id,
      hr: draft.hr,
      sbp: draft.sbp,
      dbp: draft.dbp,
      symptoms: draft.symptoms.trim(),
    };
    update({ vitals: [...state.vitals, v] });
    setDraft({ hr: "", sbp: "", dbp: "", symptoms: "" });
  }

  function removeVital(id: string) {
    update({ vitals: state.vitals.filter((v) => v.id !== id) });
  }

  const derived = useMemo(() => {
    const baseline = state.vitals.filter((v) => v.phaseId === "supine");
    const upright = state.vitals.filter((v) => v.phaseId !== "supine" && v.phaseId !== "recovery");
    const bHR = baseline.at(-1)?.hr || "";
    const bBP =
      baseline.at(-1) && (baseline.at(-1)!.sbp || baseline.at(-1)!.dbp)
        ? `${baseline.at(-1)!.sbp || "?"}/${baseline.at(-1)!.dbp || "?"}`
        : "";
    const uHR = upright.at(-1)?.hr || "";
    const uBP =
      upright.at(-1) && (upright.at(-1)!.sbp || upright.at(-1)!.dbp)
        ? `${upright.at(-1)!.sbp || "?"}/${upright.at(-1)!.dbp || "?"}`
        : "";
    return { bHR, bBP, uHR, uBP };
  }, [state.vitals]);

  const emrNote = useMemo(() => {
    const protoLabel = state.protocol === "standard" ? "Standard (Westminster)" : "Italian";
    const lines: string[] = [];
    lines.push(`HEAD-UP TILT TABLE TEST — ${protoLabel} Protocol`);
    lines.push(`Date: ${new Date().toLocaleString()}`);
    if (state.patientId) lines.push(`Patient / Study ID: ${state.patientId}`);
    lines.push(`Total study time: ${fmt(state.elapsed)}`);
    lines.push("");
    lines.push("PROTOCOL");
    if (state.protocol === "standard") {
      lines.push("  Passive tilt 60–70° × 20 min; if negative, SL GTN 400 mcg × 15–20 min.");
    } else {
      lines.push("  Passive tilt 60° × 20 min; if negative, SL GTN 300–400 mcg × 15 min.");
    }
    lines.push("");
    lines.push("PHASES");
    phases.forEach((p, i) => {
      const mark = i < state.phaseIdx ? "[x]" : i === state.phaseIdx ? "[>]" : "[ ]";
      lines.push(`  ${mark} ${p.label} (target ${Math.round(p.targetSec / 60)} min)`);
    });
    lines.push("");
    lines.push("PRE-TEST CHECKLIST");
    CHECKLIST.forEach((c) => {
      lines.push(`  ${c.title}`);
      c.items.forEach((i) => {
        const mark = state.checklist[i.id] ? "[x]" : "[ ]";
        const req = i.required ? " *" : "";
        lines.push(`    ${mark} ${i.label}${req}`);
      });
    });
    if (state.checklistOverride && missingRequired.length > 0) {
      lines.push(`  (Overridden — ${missingRequired.length} required items not ticked)`);
    }
    lines.push("");
    lines.push("FINDINGS");
    lines.push(`  Symptoms reproduced: ${state.symptomsReproduced ? "Yes" : "No"}`);
    if (state.typicalSymptoms.trim()) lines.push(`  Typical symptoms: ${state.typicalSymptoms.trim()}`);
    lines.push(`  Baseline HR/BP: ${derived.bHR || "—"} bpm / ${derived.bBP || "—"} mmHg`);
    lines.push(`  Upright HR/BP:  ${derived.uHR || "—"} bpm / ${derived.uBP || "—"} mmHg`);
    lines.push("");
    if (state.vitals.length) {
      lines.push("VITALS LOG");
      state.vitals.forEach((v) => {
        const bp = v.sbp || v.dbp ? `${v.sbp || "?"}/${v.dbp || "?"}` : "—";
        lines.push(
          `  [${fmt(v.t)} ${v.phaseId}] HR ${v.hr || "—"} BP ${bp}${
            v.symptoms ? ` — ${v.symptoms}` : ""
          }`,
        );
      });
      lines.push("");
    }
    if (state.impression.trim()) {
      lines.push("IMPRESSION");
      lines.push(`  ${state.impression.trim()}`);
      lines.push("");
    }
    lines.push(`INTERPRETATION: ${INTERP_LABEL[state.interpretation]}`);
    return lines.join("\n");
  }, [state, phases, derived, missingRequired.length]);

  function exportTxt() {
    const blob = new Blob([emrNote], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `HUTT-${state.protocol}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportPdf() {
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return;
    const rows = state.vitals
      .map(
        (v) => `
        <tr>
          <td>${fmt(v.t)}</td>
          <td>${v.phaseId}</td>
          <td>${v.hr || "—"}</td>
          <td>${(v.sbp || v.dbp) ? `${v.sbp || "?"}/${v.dbp || "?"}` : "—"}</td>
          <td>${escapeHtml(v.symptoms) || "—"}</td>
        </tr>`,
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>HUTT Report</title>
      <style>
        *{box-sizing:border-box}
        body{font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;max-width:780px;margin:24px auto;padding:0 20px}
        h1{font-size:20px;margin:0 0 4px}
        h2{font-size:14px;margin:20px 0 6px;color:#444;text-transform:uppercase;letter-spacing:.06em}
        .muted{color:#666;font-size:12px}
        table{width:100%;border-collapse:collapse;margin-top:6px;font-size:12px}
        th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
        th{background:#f5f5f7}
        pre{white-space:pre-wrap;font:12px/1.5 ui-monospace,Menlo,monospace;background:#f7f7f9;padding:12px;border-radius:6px}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        @media print { body{margin:0} }
      </style></head><body>
      <h1>Head-Up Tilt Table Test</h1>
      <div class="muted">${state.protocol === "standard" ? "Standard" : "Italian"} protocol · Study time ${fmt(state.elapsed)}${state.patientId ? ` · ID ${escapeHtml(state.patientId)}` : ""}</div>
      <h2>Summary</h2>
      <div class="grid">
        <div><b>Symptoms reproduced:</b> ${state.symptomsReproduced ? "Yes" : "No"}</div>
        <div><b>Interpretation:</b> ${escapeHtml(INTERP_LABEL[state.interpretation])}</div>
        <div><b>Baseline HR/BP:</b> ${derived.bHR || "—"} / ${derived.bBP || "—"}</div>
        <div><b>Upright HR/BP:</b> ${derived.uHR || "—"} / ${derived.uBP || "—"}</div>
      </div>
      ${state.typicalSymptoms.trim() ? `<h2>Typical symptoms</h2><div>${escapeHtml(state.typicalSymptoms)}</div>` : ""}
      <h2>Vitals log</h2>
      ${state.vitals.length ? `<table><thead><tr><th>t</th><th>Phase</th><th>HR</th><th>BP</th><th>Symptoms</th></tr></thead><tbody>${rows}</tbody></table>` : `<div class="muted">No entries.</div>`}
      ${state.impression.trim() ? `<h2>Impression</h2><div>${escapeHtml(state.impression)}</div>` : ""}
      <h2>EMR note</h2>
      <pre>${escapeHtml(emrNote)}</pre>
      <script>window.onload=()=>setTimeout(()=>window.print(),150)</script>
      </body></html>`;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  return (
    <section className="surface-panel space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">HUTT — Head-Up Tilt Table</h2>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
              Auto-saved
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Phase timer, vitals log, findings, and EMR note. Toggle between Standard and Italian
            (NTG-potentiated) protocols.
          </p>
        </div>
        <div className="inline-flex rounded-lg border border-border p-0.5">
          {(["standard", "italian"] as ProtocolType[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => toggleProtocol(p)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                state.protocol === p
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "standard" ? "Standard" : "Italian"}
            </button>
          ))}
        </div>
      </div>

      {/* Pre-test checklist */}
      <ChecklistPanel
        checklist={state.checklist}
        override={state.checklistOverride}
        onToggle={toggleCheck}
        onCheckAll={checkAll}
        onClear={clearChecks}
        onOverride={(v) => update({ checklistOverride: v })}
        missing={missingRequired.length}
        canStart={canStart}
        started={state.elapsed > 0 || state.running}
      />

      {/* Timer + phase */}
      <div className="grid gap-4 md:grid-cols-[1fr_auto]" data-tour="hutt-timer">
        <div className="rounded-xl border border-border bg-surface/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Phase {state.phaseIdx + 1} of {phases.length}
              </div>
              <div className="mt-0.5 text-base font-semibold">{currentPhase.label}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-3xl tabular-nums">{fmt(state.elapsed)}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                target {Math.round(phaseTarget / 60)} min
              </div>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(100, (state.elapsed / phaseTarget) * 100)}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={startPause}
              disabled={!state.running && !canStart}
              title={!canStart ? `Complete ${missingRequired.length} required checklist item(s) first` : ""}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {state.running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {state.running ? "Pause" : "Start"}
            </button>
            <button
              type="button"
              onClick={nextPhase}
              disabled={state.phaseIdx >= phases.length - 1}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface disabled:opacity-40"
            >
              <Timer className="h-3.5 w-3.5" />
              Next phase
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/40 p-4 md:w-64">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Study / Patient ID
          </div>
          <input
            value={state.patientId}
            onChange={(e) => update({ patientId: e.target.value })}
            placeholder="Optional"
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.symptomsReproduced}
              onChange={(e) => update({ symptomsReproduced: e.target.checked })}
            />
            Symptoms reproduced
          </label>
        </div>
      </div>

      {/* Vitals entry */}
      <div data-tour="hutt-vitals">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Vitals log</h3>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {state.vitals.length} entries
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
          <input
            value={draft.hr}
            onChange={(e) => setDraft((d) => ({ ...d, hr: e.target.value }))}
            placeholder="HR"
            inputMode="numeric"
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
          <input
            value={draft.sbp}
            onChange={(e) => setDraft((d) => ({ ...d, sbp: e.target.value }))}
            placeholder="SBP"
            inputMode="numeric"
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
          <input
            value={draft.dbp}
            onChange={(e) => setDraft((d) => ({ ...d, dbp: e.target.value }))}
            placeholder="DBP"
            inputMode="numeric"
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
          <input
            value={draft.symptoms}
            onChange={(e) => setDraft((d) => ({ ...d, symptoms: e.target.value }))}
            placeholder="Symptoms / notes"
            className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
          <button
            type="button"
            onClick={addVital}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-3.5 w-3.5" /> Log
          </button>
        </div>

        {state.vitals.length > 0 && (
          <div className="mt-3 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-surface/60 text-muted-foreground">
                <tr>
                  <th className="px-2 py-1.5 text-left font-mono uppercase tracking-wider">t</th>
                  <th className="px-2 py-1.5 text-left font-mono uppercase tracking-wider">Phase</th>
                  <th className="px-2 py-1.5 text-left font-mono uppercase tracking-wider">HR</th>
                  <th className="px-2 py-1.5 text-left font-mono uppercase tracking-wider">BP</th>
                  <th className="px-2 py-1.5 text-left font-mono uppercase tracking-wider">
                    Symptoms
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {state.vitals.map((v) => (
                  <tr key={v.id} className="border-t border-border">
                    <td className="px-2 py-1.5 font-mono tabular-nums">{fmt(v.t)}</td>
                    <td className="px-2 py-1.5">{v.phaseId}</td>
                    <td className="px-2 py-1.5">{v.hr || "—"}</td>
                    <td className="px-2 py-1.5">
                      {v.sbp || v.dbp ? `${v.sbp || "?"}/${v.dbp || "?"}` : "—"}
                    </td>
                    <td className="px-2 py-1.5">{v.symptoms || "—"}</td>
                    <td className="px-2 py-1.5 text-right">
                      <button
                        type="button"
                        onClick={() => removeVital(v.id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Findings */}
      <div className="grid gap-3 md:grid-cols-2" data-tour="hutt-findings">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Typical symptoms
          </label>
          <textarea
            value={state.typicalSymptoms}
            onChange={(e) => update({ typicalSymptoms: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Impression
          </label>
          <textarea
            value={state.impression}
            onChange={(e) => update({ impression: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Interpretation
        </label>
        <select
          value={state.interpretation}
          onChange={(e) => update({ interpretation: e.target.value as Interp })}
          className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        >
          {(Object.keys(INTERP_LABEL) as Interp[]).map((k) => (
            <option key={k} value={k}>
              {INTERP_LABEL[k]}
            </option>
          ))}
        </select>
      </div>

      {/* Collapsible EMR note */}
      <div className="rounded-xl border border-border" data-tour="hutt-export">
        <button
          type="button"
          onClick={() => setNoteOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            Interpretation & EMR note
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${noteOpen ? "" : "-rotate-90"}`}
          />
        </button>
        {noteOpen && (
          <div className="border-t border-border p-4">
            <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-md bg-surface/60 p-3 font-mono text-xs">
              {emrNote}
            </pre>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={exportTxt}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface"
              >
                <Download className="h-3.5 w-3.5" /> Export .txt
              </button>
              <button
                type="button"
                onClick={exportPdf}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                <Printer className="h-3.5 w-3.5" /> Export PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(emrNote);
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ChecklistPanel({
  checklist,
  override,
  onToggle,
  onCheckAll,
  onClear,
  onOverride,
  missing,
  canStart,
  started,
}: {
  checklist: Record<string, boolean>;
  override: boolean;
  onToggle: (id: string) => void;
  onCheckAll: () => void;
  onClear: () => void;
  onOverride: (v: boolean) => void;
  missing: number;
  canStart: boolean;
  started: boolean;
}) {
  const [open, setOpen] = useState(true);
  const total = CHECKLIST.reduce((n, c) => n + c.items.length, 0);
  const done = Object.values(checklist).filter(Boolean).length;
  return (
    <div className="rounded-xl border border-border bg-surface/40" data-tour="hutt-checklist">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <ShieldCheck className={`h-4 w-4 ${canStart ? "text-emerald-500" : "text-amber-500"}`} />
          Pre-test checklist
          <span className="rounded-full bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {done}/{total}
          </span>
          {!canStart && !started && (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              {missing} required missing — timer locked
            </span>
          )}
          {canStart && !started && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              Ready to start
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <div className="space-y-4 border-t border-border p-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {CHECKLIST.map((cat) => (
              <div key={cat.id} className="rounded-lg border border-border bg-background/40 p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {cat.title}
                </div>
                <ul className="space-y-1.5">
                  {cat.items.map((item) => {
                    const checked = !!checklist[item.id];
                    return (
                      <li key={item.id}>
                        <label className="flex cursor-pointer items-start gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => onToggle(item.id)}
                            className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          />
                          <span className={checked ? "text-muted-foreground line-through" : ""}>
                            {item.label}
                            {item.required && (
                              <span className="ml-1 text-[10px] font-semibold text-amber-500">
                                *required
                              </span>
                            )}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <button
              type="button"
              onClick={onCheckAll}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              Check all
            </button>
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              Clear
            </button>
            <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={override}
                onChange={(e) => onOverride(e.target.checked)}
              />
              Override & start anyway
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
