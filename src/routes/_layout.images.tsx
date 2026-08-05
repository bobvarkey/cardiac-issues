import { createFileRoute } from "@tanstack/react-router";

import { LightboxImage } from "@/components/ImageLightbox";
import coronaryAnatomy from "@/assets/coronary-anatomy.jpeg.asset.json";
import ctCalciumScore from "@/assets/ct-calcium-score.jpeg.asset.json";
import longQtMorphology from "@/assets/long-qt-morphology.png.asset.json";
import periopBloodThinners from "@/assets/periop-blood-thinners.jpeg.asset.json";
import stellateSono from "@/assets/stellate-ganglion-sonoanatomy.jpeg.asset.json";
import stellateUs from "@/assets/stellate-ganglion-ultrasound.jpeg.asset.json";
import svtHero from "@/assets/svt-adenosine-12mg-hero.jpeg.asset.json";
import svtStudy from "@/assets/svt-adenosine-12mg-study.jpeg.asset.json";
import wallLeadsArtery from "@/assets/wall-leads-artery.jpeg.asset.json";

export const Route = createFileRoute("/_layout/images")({
  head: () => ({
    meta: [
      { title: "Cardiac Image Library — Coronary Anatomy, ECG & Protocol Figures" },
      {
        name: "description",
        content:
          "Browse and expand cardiology reference images: coronary anatomy, ECG infarct localisation, CT calcium score, adenosine in SVT, stellate ganglion sonoanatomy and periop blood thinners.",
      },
      { property: "og:title", content: "Cardiac Image Library" },
      {
        property: "og:description",
        content:
          "Click-to-expand cardiology reference figures: coronary anatomy, infarct localisation, CAC scoring and procedural ultrasound.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ImagesPage,
});

const GROUPS = [
  {
    title: "Coronary anatomy & infarct localisation",
    images: [
      {
        src: coronaryAnatomy.url,
        alt: "Coronary artery anatomy diagram showing LMCA, LAD with septal perforators and diagonals, circumflex with OM1 and OM2, ramus intermedius, LIMA, and RCA branches",
        caption: "Coronary tree — LMCA (LAD, circumflex, ramus) and RCA branches.",
      },
      {
        src: wallLeadsArtery.url,
        alt: "Wall, leads and artery table for ECG infarct localisation",
        caption: "Wall · Leads · Artery — territory mapping for ECG infarct localisation.",
      },
    ],
  },
  {
    title: "Chronic coronary disease",
    images: [
      {
        src: ctCalciumScore.url,
        alt: "CT calcium score infographic with Agatston interpretation and limitations",
        caption: "CT calcium score — Agatston interpretation and clinical use.",
      },
    ],
  },
  {
    title: "SVT & adenosine",
    images: [
      {
        src: svtHero.url,
        alt: "Adenosine 12 mg versus 6 mg first dose in SVT summary figure",
        caption: "Adenosine first-dose 12 mg vs 6 mg in SVT.",
      },
      {
        src: svtStudy.url,
        alt: "Study data comparing adenosine 12 mg and 6 mg for SVT cardioversion",
        caption: "Study data — cardioversion rates by first dose.",
      },
    ],
  },
  {
    title: "Stellate ganglion block",
    images: [
      {
        src: stellateSono.url,
        alt: "Stellate ganglion sonoanatomy showing C6 level landmarks",
        caption: "Stellate ganglion sonoanatomy.",
      },
      {
        src: stellateUs.url,
        alt: "Ultrasound image of the stellate ganglion block approach",
        caption: "Ultrasound-guided approach.",
      },
    ],
  },
  {
    title: "Periprocedural anticoagulation",
    images: [
      {
        src: periopBloodThinners.url,
        alt: "Infographic showing when blood thinners should be stopped before major surgery",
        caption: "Blood thinners — preoperative stop times.",
      },
    ],
  },
];

function ImagesPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Image library</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Cardiac image library</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Every reference figure in one place. Click any image to expand it full screen.
        </p>
      </header>

      {GROUPS.map((group) => (
        <section key={group.title} className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">{group.title}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {group.images.map((img) => (
              <LightboxImage key={img.src} {...img} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
