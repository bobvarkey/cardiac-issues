import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { algorithms } from "@/data/cardiac";
import { protocolFaqs } from "@/data/protocol-faqs";
import { AlgorithmView } from "@/components/AlgorithmView";

const SITE = "https://cardiac-issues.lovable.app";

export const Route = createFileRoute("/_layout/protocol/$id")({
  loader: ({ params }) => {
    const algo = algorithms.find((a) => a.id === params.id);
    if (!algo) throw notFound();
    const faqs = protocolFaqs[algo.id] ?? [];
    return { algo, faqs };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Protocol not found" }, { name: "robots", content: "noindex" }],
      };
    }
    const { algo, faqs } = loaderData;
    const url = `${SITE}/protocol/${params.id}`;
    const title = `${algo.name} — Algorithm, Steps & FAQ`;
    const description = `${algo.summary} Step-by-step clinician reference with dosing, decision points, and common questions.`;
    const scripts: { type: string; children: string }[] = [];
    if (faqs.length) {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      });
    }
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts,
    };
  },
  notFoundComponent: () => (
    <div className="py-16 text-center text-muted-foreground">Protocol not found.</div>
  ),
  component: ProtocolPage,
});

function ProtocolPage() {
  const { algo, faqs } = Route.useLoaderData();
  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> All protocols
      </Link>

      <header className="space-y-2 border-b border-border pb-6">
        {algo.context && (
          <div className="font-mono text-[10px] uppercase tracking-wider text-primary">
            {algo.context}
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{algo.name}</h1>
        <p className="text-muted-foreground">{algo.summary}</p>
      </header>

      <AlgorithmView algo={algo} />

      {faqs.length > 0 && (
        <section className="space-y-4 border-t border-border pt-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold tracking-tight">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f: { q: string; a: string }) => (
              <details
                key={f.q}
                className="group rounded-lg border border-border bg-surface/60 p-4 open:bg-surface"
              >
                <summary className="cursor-pointer list-none text-sm font-medium text-foreground marker:hidden">
                  <span className="mr-2 text-primary group-open:hidden">+</span>
                  <span className="mr-2 hidden text-primary group-open:inline">−</span>
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Educational reference only. Follow local protocols and clinical judgment.
          </p>
        </section>
      )}
    </div>
  );
}
