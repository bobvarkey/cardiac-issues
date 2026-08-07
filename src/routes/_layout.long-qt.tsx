import { createFileRoute } from "@tanstack/react-router";

import { LightboxImage } from "@/components/ImageLightbox";
import longQtMorphology from "@/assets/long-qt-morphology.png.asset.json";

export const Route = createFileRoute("/_layout/long-qt")({
  head: () => ({
    meta: [
      { title: "Long QT Syndrome Morphology — LQT1, LQT2, LQT3 T-Wave Patterns" },
      {
        name: "description",
        content:
          "Recognise LQT1 (Mount Fuji broad-base T wave), LQT2 (Bactrian camel double hump) and LQT3 (teepee, long ST narrow T) morphology, with triggers, QTc thresholds and management.",
      },
      { property: "og:title", content: "Long QT Syndrome Morphology — LQT1/2/3" },
      {
        property: "og:description",
        content:
          "Mount Fuji, Bactrian camel and teepee T-wave patterns for LQT1, LQT2 and LQT3, with triggers and management.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://cardiac-issues.lovable.app/long-qt" }],
  }),
  component: LongQtPage,
});

const SUBTYPES = [
  {
    id: "LQT1",
    mnemonic: "Mount Fuji",
    gene: "KCNQ1 (IKs loss of function)",
    leads: "Best seen in V5–V6",
    morphology: "Broad-based, smooth T wave with a wide symmetrical slope.",
    trigger: "Exercise — especially swimming",
    management: "Beta-blockers (nadolol/propranolol); avoid competitive swimming unsupervised.",
    accent: "from-violet-500 to-purple-600",
  },
  {
    id: "LQT2",
    mnemonic: "Bactrian camel",
    gene: "KCNH2 / hERG (IKr loss of function)",
    leads: "Best seen in V2–V3",
    morphology: "Low-amplitude, notched / double-hump (bifid) T wave.",
    trigger: "Emotion, sudden loud noise (alarm clock, phone), postpartum",
    management:
      "Beta-blockers, keep K⁺ >4.0 mmol/L, remove alarms/startle triggers, avoid QT-prolonging drugs.",
    accent: "from-amber-500 to-orange-600",
  },
  {
    id: "LQT3",
    mnemonic: "Teepee",
    gene: "SCN5A (late INa gain of function)",
    leads: "Best seen in V5–V6",
    morphology: "Long isoelectric ST segment then a late, narrow-based peaked T wave.",
    trigger: "Rest / sleep, bradycardia",
    management:
      "Beta-blockers less protective; mexiletine (late Na⁺ block), pacing for pause-dependence, low ICD threshold.",
    accent: "from-pink-500 to-rose-600",
  },
];

function LongQtPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Electrophysiology · Channelopathy</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Long QT syndrome morphology</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Three classic T-wave shapes separate the common congenital LQTS subtypes. QTc ≥480 ms is
          diagnostic in the absence of secondary causes; QTc ≥500 ms marks high torsades risk.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-3">
        {SUBTYPES.map((s) => (
          <article key={s.id} className="surface-panel space-y-3 p-4">
            <div
              className={`inline-flex rounded-md bg-gradient-to-r ${s.accent} px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground`}
            >
              {s.mnemonic}
            </div>
            <h2 className="text-xl font-semibold tracking-tight">{s.id}</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  T-wave morphology
                </dt>
                <dd>{s.morphology}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Leads</dt>
                <dd>{s.leads}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Gene</dt>
                <dd>{s.gene}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Typical trigger
                </dt>
                <dd>{s.trigger}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  Management
                </dt>
                <dd>{s.management}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Morphology reference figure</h2>
        <LightboxImage
          src={longQtMorphology.url}
          alt="Long QT syndrome morphology infographic: LQT1 Mount Fuji broad-base T wave in V5/V6, LQT2 Bactrian camel double-hump T wave in V2/V3, LQT3 teepee long ST with narrow-base T wave in V5/V6"
          caption="LQT1 Mount Fuji · LQT2 Bactrian camel · LQT3 teepee — click to expand."
          className="mx-auto max-w-3xl"
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">QT-prolonging drugs & safer alternatives</h2>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Curated by class. Risk tiers follow CredibleMeds: <strong>Known risk</strong> of torsades,
          <strong> possible risk</strong>, or <strong>conditional risk</strong> (only with overdose,
          hypokalaemia, or interacting inhibitors). Always check the combination, not just the drug.
        </p>

        <div className="grid gap-4 lg:grid-cols-2">
          {QT_DRUGS.map((g) => (
            <article key={g.group} className="surface-panel space-y-3 p-4">
              <h3 className="text-base font-semibold tracking-tight">{g.group}</h3>
              <ul className="space-y-2 text-sm">
                {g.drugs.map((d) => (
                  <li key={d.name} className="space-y-1 border-b border-border/60 pb-2 last:border-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{d.name}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          d.risk === "Known"
                            ? "bg-destructive/15 text-destructive"
                            : d.risk === "Possible"
                              ? "bg-amber-500/15 text-amber-500"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {d.risk} risk
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Safer alternative: </span>
                      {d.alt}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Caution: </span>
                      {d.note}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="surface-panel space-y-2 p-4">
          <h3 className="text-base font-semibold tracking-tight">Common contraindications & red flags</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Congenital LQTS, prior torsades, or unexplained syncope on a QT-prolonging agent.</li>
            <li>Baseline QTc ≥500 ms, or an increase of ≥60 ms from baseline after starting a drug.</li>
            <li>Uncorrected hypokalaemia, hypomagnesaemia or hypocalcaemia — correct before dosing.</li>
            <li>
              Two or more QT-prolonging drugs together, or one plus a CYP3A4/2D6 inhibitor
              (azoles, macrolides, ritonavir, grapefruit) that raises drug levels.
            </li>
            <li>Bradycardia, high-grade AV block, or pause-dependent arrhythmia (pause-triggered TdP).</li>
            <li>Hepatic or renal impairment reducing clearance; also female sex, age &gt;65, HFrEF, recent cardioversion from AF.</li>
            <li>Diuretic-induced electrolyte loss combined with any listed agent.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">ECG approach to syncope syndromes</h2>
        <LightboxImage
          src={ecgSyncope.url}
          alt="Approach to ECGs in syncope syndromes: BE WHAT QT PiE mnemonic covering Brugada, electrolytes, WPW, HOCM, ARVD, trifascicular block, long/short QT and PE"
          caption="BE WHAT QT PiE — the eight syncope syndromes to exclude on ECG."
          className="mx-auto max-w-3xl"
        />
      </section>

      <section className="surface-panel space-y-2 p-4">
        <h2 className="text-lg font-semibold tracking-tight">Practical notes</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Measure QTc in lead II or V5 with Bazett at HR 60–100; use Fridericia at extremes.</li>
          <li>
            Exclude secondary causes: QT-prolonging drugs, hypokalaemia, hypomagnesaemia,
            hypocalcaemia, bradycardia, hypothermia.
          </li>
          <li>Torsades risk rises sharply at QTc ≥500 ms or with T-wave alternans.</li>
          <li>Acute torsades: magnesium 2 g IV, correct K⁺ to 4.5–5.0, overdrive pace, defibrillate if unstable.</li>
        </ul>
      </section>
    </div>
  );
}
