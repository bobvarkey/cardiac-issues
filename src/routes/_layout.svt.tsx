import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Zap, AlertTriangle, CheckCircle2, BookOpen } from "lucide-react";
import heroImg from "@/assets/svt-adenosine-12mg-hero.jpeg.asset.json";
import studyImg from "@/assets/svt-adenosine-12mg-study.jpeg.asset.json";

export const Route = createFileRoute("/_layout/svt")({
  head: () => ({
    meta: [
      { title: "Supraventricular Tachycardia (SVT) — Adenosine Dosing & Evidence" },
      {
        name: "description",
        content:
          "SVT management: vagal maneuvers, adenosine dosing (6 mg vs 12 mg first-dose evidence), and when to cardiovert. Includes 2026 propensity-matched ED study.",
      },
      { property: "og:title", content: "SVT — Adenosine 12 mg First-Dose Evidence" },
      {
        property: "og:description",
        content:
          "83.1% vs 52.1% first-dose SVT conversion with 12 mg vs 6 mg adenosine (OR 4.12, NNT ≈ 4).",
      },
      { property: "og:image", content: heroImg.url },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: heroImg.url },
    ],
  }),
  component: SVTPage,
});

function SVTPage() {
  return (
    <div className="space-y-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Home
      </Link>

      <header className="space-y-3 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-xs text-primary">
          <Zap className="h-3.5 w-3.5" />
          <span className="font-mono uppercase tracking-wider">Tachyarrhythmia · Narrow QRS</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Supraventricular Tachycardia (SVT)
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Regular narrow-complex tachycardia, typically AVNRT or AVRT. Assess stability first;
          unstable patients get synchronized cardioversion. Stable patients get vagal maneuvers →
          adenosine → AV nodal blocker.
        </p>
      </header>

      {/* Acute algorithm */}
      <section className="surface-panel space-y-4">
        <h2 className="text-lg font-semibold">Acute management</h2>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="font-mono text-xs text-primary">1.</span>
            <span>
              <strong>Assess stability</strong> — hypotension, shock, altered mental status,
              ischemic chest pain, pulmonary edema → <strong>synchronized cardioversion</strong>{" "}
              50–100 J biphasic.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs text-primary">2.</span>
            <span>
              <strong>Vagal maneuvers</strong> — modified Valsalva (REVERT trial: ~43% success) or
              carotid sinus massage.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs text-primary">3.</span>
            <span>
              <strong>Adenosine</strong> rapid IV push through a proximal (antecubital) line with
              20 mL saline flush; continuous ECG monitoring. Traditional stepwise: 6 mg → 12 mg →
              12 mg. See evidence below for a 12 mg first-dose strategy.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs text-primary">4.</span>
            <span>
              <strong>If adenosine fails</strong> — diltiazem 0.25 mg/kg IV over 2 min, or
              metoprolol 2.5–5 mg IV. Avoid AV nodal blockers if pre-excitation suspected.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-xs text-primary">5.</span>
            <span>
              <strong>Refractory / recurrent</strong> — expert consult; consider cardioversion,
              procainamide, or ibutilide.
            </span>
          </li>
        </ol>
      </section>

      {/* Featured evidence */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider text-primary">
            Featured evidence · 2026
          </span>
        </div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Skip the 6 mg dose — go straight to 12 mg?
        </h2>

        <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated">
          <img
            src={heroImg.url}
            alt="Infographic: Initial 12 mg adenosine vs 6 mg for SVT — 83.1% vs 52.1% first-dose conversion, OR 4.12."
            className="w-full"
            loading="lazy"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              First-dose conversion
            </div>
            <div className="mt-1 text-2xl font-semibold text-primary">83.1% vs 52.1%</div>
            <div className="text-xs text-muted-foreground">12 mg vs 6 mg initial adenosine</div>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Propensity-matched OR
            </div>
            <div className="mt-1 text-2xl font-semibold text-primary">4.12</div>
            <div className="text-xs text-muted-foreground">95% CI 1.85–9.14</div>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Number needed to treat
            </div>
            <div className="mt-1 text-2xl font-semibold text-primary">≈ 4</div>
            <div className="text-xs text-muted-foreground">95% CI 2.5–8.3</div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-elevated p-5 space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Key takeaway
          </h3>
          <p className="text-sm text-muted-foreground">
            In hemodynamically stable adults with AVNRT/AVRT-confirmed SVT, starting with{" "}
            <strong>12 mg adenosine</strong> significantly improved first-dose sinus rhythm
            conversion vs the traditional 6 mg (83.1% vs 52.1%; OR 4.12, 95% CI 1.85–9.14){" "}
            <em>without</em> an increase in adverse effects, and with numerically lower ED SVT
            recurrence (1.4% vs 9.9%).
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>· Adverse effects (chest tightness, flushing, dyspnea) — similar between groups.</li>
            <li>· Prolonged asystole &gt; 3 s: 1.4% in each group. AV block: 0% in each group.</li>
            <li>
              · Still avoid in pre-excited AF/WPW, severe reactive airway disease, and 2°/3° AV
              block without pacing.
            </li>
          </ul>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated">
          <img
            src={studyImg.url}
            alt="Study summary: Prospective observational ED study, 142 patients, 12 mg vs 6 mg adenosine, primary and secondary outcomes."
            className="w-full"
            loading="lazy"
          />
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-amber-500" />
            <div>
              <strong>Practical note:</strong> This is a single-center prospective observational
              study with propensity matching (n = 142, matched cohort 104). Guidelines still list
              6 mg as the standard first dose. Consider a 12 mg first dose in adults where prior
              6 mg has failed or clinical context (large body habitus, distal IV, central-line
              administration considerations) predicts low first-dose success — with informed
              shared decision-making.
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface-elevated p-4 text-sm">
          <div className="flex items-start gap-2">
            <BookOpen className="mt-0.5 h-4 w-4 flex-none text-primary" />
            <div>
              <div className="font-medium">Source</div>
              <div className="text-muted-foreground">
                Sert ET, Kokulu K, Yürük O, Akar EH, Topuz MA. Initial 12 mg vs 6 mg adenosine for
                supraventricular tachycardia in the emergency department.{" "}
                <em>Academic Emergency Medicine.</em> 2026;33:e70309.{" "}
                <a
                  href="https://doi.org/10.1111/acem.70309"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  doi:10.1111/acem.70309
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link
          to="/treatment"
          search={{ drug: "Adenosine" }}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Open adenosine dosing calculator →
        </Link>
        <Link
          to="/protocol/$id"
          params={{ id: "tachycardia" }}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-4 py-2 text-sm font-medium hover:border-primary/40"
        >
          Full tachycardia protocol
        </Link>
      </section>
    </div>
  );
}
