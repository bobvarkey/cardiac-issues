import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { algorithms } from "@/data/cardiac";
import { AlgorithmView } from "@/components/AlgorithmView";

export const Route = createFileRoute("/_layout/protocol/$id")({
  loader: ({ params }) => {
    const algo = algorithms.find((a) => a.id === params.id);
    if (!algo) throw notFound();
    return { algo };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.algo.name} — CardiacRef` },
          { name: "description", content: loaderData.algo.summary },
          { property: "og:title", content: `${loaderData.algo.name} — CardiacRef` },
          { property: "og:description", content: loaderData.algo.summary },
        ]
      : [{ title: "Protocol not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="py-16 text-center text-muted-foreground">Protocol not found.</div>
  ),
  component: ProtocolPage,
});

function ProtocolPage() {
  const { algo } = Route.useLoaderData();
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
    </div>
  );
}
