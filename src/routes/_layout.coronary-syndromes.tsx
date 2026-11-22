import { createFileRoute } from "@tanstack/react-router";
import { Heart, AlertTriangle } from "lucide-react";
import { LightboxImage } from "@/components/ImageLightbox";
import comparisonImage from "@/assets/anoca-minoca-inoca-comparison.jpeg.asset.json";

export const Route = createFileRoute("/_layout/coronary-syndromes")({
  head: () => ({
    meta: [
      { title: "ANOCA, MINOCA & INOCA — CardiacRef" },
      { name: "description", content: "Compare angina, myocardial infarction and ischemia with non-obstructive coronary arteries, with an illustrated reference and clinical distinctions." },
      { property: "og:title", content: "ANOCA, MINOCA & INOCA — CardiacRef" },
      { property: "og:description", content: "An illustrated comparison of non-obstructive coronary syndromes and their important clinical distinctions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoronarySyndromes,
});

const syndromes = [
  { name: "ANOCA", fullName: "Angina with non-obstructive coronary arteries", detail: "Angina symptoms with no obstructive coronary artery disease. Objective ischemia may or may not be demonstrated; microvascular dysfunction and coronary spasm are possible mechanisms." },
  { name: "MINOCA", fullName: "Myocardial infarction with non-obstructive coronary arteries", detail: "An acute myocardial infarction meeting MI criteria, with no coronary stenosis ≥50% and no overt alternative explanation. It is a working diagnosis requiring investigation of the underlying cause." },
  { name: "INOCA", fullName: "Ischemia with non-obstructive coronary arteries", detail: "Objective evidence of myocardial ischemia without obstructive coronary artery disease. Coronary microvascular dysfunction and vasospasm are common mechanisms; angina may be present or absent." },
];

function CoronarySyndromes() {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-primary"><Heart className="h-4 w-4" /> Coronary syndromes</div>
        <h1 className="text-3xl font-semibold">ANOCA, MINOCA & INOCA</h1>
        <p className="max-w-3xl text-muted-foreground">Angina, infarction and ischemia can occur without obstructive coronary artery disease. These terms describe different clinical presentations.</p>
      </header>

      <section aria-labelledby="comparison-heading" className="space-y-4">
        <h2 id="comparison-heading">Illustrated comparison</h2>
        <div className="max-w-3xl">
          <LightboxImage src={comparisonImage.url} alt="ANOCA, MINOCA and INOCA comparison infographic" caption="Uploaded reference infographic. See the clinical clarification below for limitations in its overlap and differential diagnosis statements." />
        </div>
      </section>

      <aside aria-labelledby="clarification-heading" className="space-y-3 border-l-2 border-warn bg-warn/5 p-4">
        <h2 id="clarification-heading" className="flex items-center gap-2 text-lg"><AlertTriangle className="h-5 w-5 shrink-0 text-warn" /> Clinical clarification</h2>
        <p className="text-sm leading-relaxed">ANOCA and INOCA overlap, but ANOCA is not universally a subset of INOCA: angina does not always have demonstrated ischemia. Myocarditis and Takotsubo syndrome can mimic MINOCA, but are excluded from the final MINOCA diagnosis once identified. INOCA does not inevitably progress to MINOCA.</p>
        <p className="text-sm leading-relaxed">Non-obstructive coronary arteries do not rule out an emergency. New or ongoing chest pain, breathlessness, syncope or suspected acute MI requires urgent clinical assessment.</p>
      </aside>

      <section aria-labelledby="definitions-heading" className="space-y-4">
        <h2 id="definitions-heading">Key distinctions</h2>
        <dl className="divide-y divide-border">
          {syndromes.map((syndrome) => (
            <div key={syndrome.name} className="grid gap-3 py-5 md:grid-cols-[15rem_1fr]">
              <dt><span className="font-semibold text-primary">{syndrome.name}</span><span className="mt-1 block text-sm text-muted-foreground">{syndrome.fullName}</span></dt>
              <dd className="text-sm leading-relaxed lg:text-base">{syndrome.detail}</dd>
            </div>
          ))}
        </dl>
      </section>
      <footer className="border-t border-border pt-4 text-xs text-muted-foreground">Educational reference only. Definitions follow the 2024 ESC chronic coronary syndrome guideline and the AHA scientific statement on MINOCA (2019).</footer>
    </article>
  );
}