import { HeartPulse, Pill, ShieldAlert, BookOpen, ExternalLink } from "lucide-react";

export function CCADMiniApp() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">
            Chronic Coronary Artery Disease
          </span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">CCAD — evidence & management</h1>
        <p className="max-w-2xl text-muted-foreground">
          Secondary prevention pillars for chronic coronary artery disease, including anti-inflammatory
          therapy with low-dose colchicine (LoDoCo2).
        </p>
      </section>

      {/* LoDoCo2 highlight */}
      <section className="surface-panel space-y-5 border-primary/30">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
                Key trial · LoDoCo2 · NEJM 2020
              </div>
              <h2 className="mt-1 text-xl font-semibold">
                Colchicine 0.5 mg daily in chronic coronary disease
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Multicenter, double-blind, randomized, placebo-controlled trial in 5,522 patients with
                chronic coronary disease. Low-dose colchicine reduced the composite of cardiovascular
                death, spontaneous MI, ischemic stroke, or ischemia-driven coronary revascularization.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
              Colchicine 0.5 mg/day · n = 2,762
            </div>
            <div className="mt-2 text-3xl font-semibold">6.8%</div>
            <div className="text-xs text-muted-foreground">primary composite endpoint</div>
          </div>
          <div className="rounded-xl border border-border bg-surface-elevated/40 p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Placebo · n = 2,760
            </div>
            <div className="mt-2 text-3xl font-semibold">9.6%</div>
            <div className="text-xs text-muted-foreground">primary composite endpoint</div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-elevated/40 p-3 text-sm">
          <span className="font-mono text-xs uppercase tracking-wider text-primary">Effect</span>{" "}
          HR 0.69 (95% CI 0.57–0.83), P &lt; 0.001 — ~31% relative risk reduction in major
          cardiovascular events.
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border p-3 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <HeartPulse className="h-4 w-4 text-primary" /> Who to consider
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Established chronic coronary disease on standard secondary prevention</li>
              <li>Stable ≥ 6 months after acute event or revascularization</li>
              <li>eGFR &gt; 50 mL/min and no significant hepatic disease</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border p-3 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4 text-destructive" /> Cautions
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Avoid with strong CYP3A4 / P-gp inhibitors (clarithromycin, ketoconazole)</li>
              <li>Severe renal or hepatic impairment</li>
              <li>Non-cardiovascular death numerically higher (0.7 vs 0.5 events/100 pt-yr)</li>
              <li>GI intolerance is the most common reason for discontinuation</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
          <span className="font-semibold">Bottom line:</span> In patients with chronic coronary
          disease already on guideline-directed therapy, adding colchicine 0.5 mg daily lowers the
          risk of cardiovascular events. Weigh against a small signal of increased non-cardiovascular
          mortality and drug-interaction risk.
        </div>

        <a
          href="https://www.nejm.org/doi/full/10.1056/NEJMoa2021372"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-primary hover:underline"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Nidorf SM et al., NEJM 2020 · 10.1056/NEJMoa2021372
          <ExternalLink className="h-3 w-3" />
        </a>
      </section>
    </div>
  );
}
