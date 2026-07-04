import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { arrhythmias } from "@/data/cardiac";

export const Route = createFileRoute("/_layout/rhythms")({
  head: () => ({
    meta: [
      { title: "Rhythm Reference — CardiacRef" },
      {
        name: "description",
        content:
          "Catalog of common cardiac arrhythmias with ECG features, categories, and clinical notes.",
      },
      { property: "og:title", content: "Rhythm Reference — CardiacRef" },
      {
        property: "og:description",
        content: "Common cardiac arrhythmias with ECG features and clinical notes.",
      },
    ],
  }),
  component: RhythmsPage,
});

function RhythmsPage() {
  const categories = Array.from(new Set(arrhythmias.map((a) => a.category)));
  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Home
      </Link>

      <header className="space-y-2 border-b border-border pb-6">
        <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
          Reference · ECG features
        </div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Common arrhythmias</h1>
        <p className="text-muted-foreground">
          Quick ECG feature guide organized by clinical category.
        </p>
      </header>

      <div className="space-y-8">
        {categories.map((cat) => (
          <section key={cat} className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              {cat}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {arrhythmias
                .filter((a) => a.category === cat)
                .map((a) => (
                  <article key={a.id} className="surface-panel p-4">
                    <h3 className="text-sm font-semibold">{a.name}</h3>
                    <dl className="mt-3 space-y-1.5">
                      {Object.entries(a.features).map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3 text-xs">
                          <dt className="text-muted-foreground">{k}</dt>
                          <dd className="text-right font-mono">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    {a.notes && (
                      <ul className="mt-3 space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
                        {a.notes.map((n) => (
                          <li key={n}>· {n}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
