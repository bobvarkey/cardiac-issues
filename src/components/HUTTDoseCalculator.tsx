import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";

type DrugKey = "gtn" | "iso" | "phen";

const DRUGS: { key: DrugKey; label: string; subtitle: string }[] = [
  { key: "gtn", label: "Nitroglycerin (GTN)", subtitle: "SL spray — provocation" },
  { key: "iso", label: "Isoproterenol", subtitle: "IV infusion — β-agonist" },
  { key: "phen", label: "Phenylephrine", subtitle: "Bolus / infusion — rescue" },
];

type Status = "ok" | "warn" | "bad";

function StatusPill({ status, children }: { status: Status; children: React.ReactNode }) {
  const styles: Record<Status, string> = {
    ok: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warn: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    bad: "border-destructive/40 bg-destructive/10 text-destructive",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${styles[status]}`}
    >
      {children}
    </span>
  );
}

function Row({
  label,
  value,
  status,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  status?: Status;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-border bg-background/40 px-3 py-2">
      <div className="min-w-0">
        <div className="text-[11px] uppercase text-muted-foreground">{label}</div>
        <div className="font-mono text-sm mt-0.5 break-words">{value}</div>
        {hint && <div className="text-[11px] text-muted-foreground mt-0.5">{hint}</div>}
      </div>
      {status && <StatusPill status={status}>{status === "ok" ? "In range" : status === "warn" ? "Check" : "Out of range"}</StatusPill>}
    </div>
  );
}

function NumInput({
  value,
  onChange,
  step = "1",
  min,
  suffix,
}: {
  value: string;
  onChange: (v: string) => void;
  step?: string;
  min?: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border bg-background/60 px-2 py-1.5 text-sm focus-within:ring-1 focus-within:ring-primary">
      <input
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent outline-none font-mono"
      />
      {suffix && <span className="text-xs text-muted-foreground shrink-0">{suffix}</span>}
    </div>
  );
}

function classify(v: number, low: number, high: number, hardHigh?: number): Status {
  if (isNaN(v) || v <= 0) return "warn";
  if (v < low || (hardHigh ? v > hardHigh : v > high)) return "bad";
  if (v > high) return "warn";
  return "ok";
}

export function HUTTDoseCalculator() {
  const [drug, setDrug] = useState<DrugKey>("gtn");
  const [weight, setWeight] = useState("70");
  const wt = parseFloat(weight);

  // GTN
  const [gtnDose, setGtnDose] = useState("400"); // mcg

  // Iso
  const [isoRate, setIsoRate] = useState("1"); // mcg/min
  const [isoConc, setIsoConc] = useState("4"); // mcg/mL (default 1 mg / 250 mL D5W)

  // Phen
  const [phenBolus, setPhenBolus] = useState("100"); // mcg
  const [phenInf, setPhenInf] = useState("0.5"); // mcg/kg/min
  const [phenConc, setPhenConc] = useState("100"); // mcg/mL

  const gtn = useMemo(() => {
    const d = parseFloat(gtnDose);
    return { dose: d, status: classify(d, 300, 400) };
  }, [gtnDose]);

  const iso = useMemo(() => {
    const rate = parseFloat(isoRate);
    const conc = parseFloat(isoConc);
    const mlh = conc > 0 ? (rate / conc) * 60 : NaN;
    return { rate, conc, mlh, status: classify(rate, 1, 3) };
  }, [isoRate, isoConc]);

  const phen = useMemo(() => {
    const b = parseFloat(phenBolus);
    const inf = parseFloat(phenInf);
    const conc = parseFloat(phenConc);
    const mcgMin = inf * (isNaN(wt) ? 0 : wt);
    const mlh = conc > 0 ? (mcgMin / conc) * 60 : NaN;
    return {
      bolus: b,
      bolusMl: conc > 0 ? b / conc : NaN,
      inf,
      conc,
      mcgMin,
      mlh,
      bolusStatus: classify(b, 50, 200),
      infStatus: classify(inf, 0.15, 0.75, 1.4),
    };
  }, [phenBolus, phenInf, phenConc, wt]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {DRUGS.map((d) => (
          <button
            key={d.key}
            onClick={() => setDrug(d.key)}
            className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
              drug === d.key
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-surface/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="font-semibold text-sm">{d.label}</div>
            <div className="text-[11px] opacity-80">{d.subtitle}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs">
          <span className="text-muted-foreground">Patient weight</span>
          <NumInput value={weight} onChange={setWeight} step="1" min="1" suffix="kg" />
        </label>
      </div>

      {drug === "gtn" && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs">
              <span className="text-muted-foreground">Sublingual dose</span>
              <NumInput value={gtnDose} onChange={setGtnDose} step="50" min="0" suffix="mcg" />
            </label>
          </div>
          <Row
            label="Selected dose"
            value={`${isFinite(gtn.dose) ? gtn.dose : "—"} mcg SL, single dose`}
            status={gtn.status}
            hint="Recommended: 300–400 mcg SL (1 metered spray or 0.3 mg tablet). Do not repeat."
          />
        </div>
      )}

      {drug === "iso" && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs">
              <span className="text-muted-foreground">Target rate</span>
              <NumInput value={isoRate} onChange={setIsoRate} step="0.5" min="0" suffix="mcg/min" />
            </label>
            <label className="text-xs">
              <span className="text-muted-foreground">Bag concentration</span>
              <NumInput value={isoConc} onChange={setIsoConc} step="1" min="0.1" suffix="mcg/mL" />
            </label>
          </div>
          <Row
            label="Infusion rate"
            value={`${isFinite(iso.mlh) ? iso.mlh.toFixed(1) : "—"} mL/h`}
            status={iso.status}
            hint="Recommended: 1 → 3 mcg/min, titrate by 0.5–1 mcg/min every 5 min to HR + 20–25%."
          />
          <div className="rounded-md border border-border bg-background/40 px-3 py-2 text-xs text-muted-foreground">
            Standard mix: <span className="font-mono">1 mg in 250 mL D5W → 4 mcg/mL</span>. At 4 mcg/mL, 1 mcg/min ≈ 15 mL/h; 3 mcg/min ≈ 45 mL/h.
          </div>
        </div>
      )}

      {drug === "phen" && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs">
              <span className="text-muted-foreground">Bolus dose</span>
              <NumInput value={phenBolus} onChange={setPhenBolus} step="25" min="0" suffix="mcg" />
            </label>
            <label className="text-xs">
              <span className="text-muted-foreground">Infusion (optional)</span>
              <NumInput value={phenInf} onChange={setPhenInf} step="0.1" min="0" suffix="mcg/kg/min" />
            </label>
            <label className="text-xs">
              <span className="text-muted-foreground">Concentration</span>
              <NumInput value={phenConc} onChange={setPhenConc} step="10" min="1" suffix="mcg/mL" />
            </label>
          </div>
          <Row
            label="Bolus"
            value={`${isFinite(phen.bolus) ? phen.bolus : "—"} mcg (${
              isFinite(phen.bolusMl) ? phen.bolusMl.toFixed(2) : "—"
            } mL at ${phen.conc || "—"} mcg/mL)`}
            status={phen.bolusStatus}
            hint="Recommended bolus: 50–200 mcg IV q10–15 min PRN."
          />
          <Row
            label="Infusion rate"
            value={`${isFinite(phen.mcgMin) ? phen.mcgMin.toFixed(1) : "—"} mcg/min · ${
              isFinite(phen.mlh) ? phen.mlh.toFixed(1) : "—"
            } mL/h`}
            status={phen.infStatus}
            hint={`Typical: 0.15–0.75 mcg/kg/min, titrate to MAP ≥ 65. At 70 kg × 0.5 mcg/kg/min = 35 mcg/min ≈ 21 mL/h at 100 mcg/mL.`}
          />
          <div className="rounded-md border border-border bg-background/40 px-3 py-2 text-xs text-muted-foreground">
            Standard mix: <span className="font-mono">10 mg in 100 mL NS → 100 mcg/mL</span>. Watch for reflex bradycardia — atropine ready.
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        <Calculator className="inline h-3 w-3 mr-1 -mt-0.5" />
        Confirmation tool only — always verify against your institution's protocol and pump library before administration.
      </p>
    </div>
  );
}
