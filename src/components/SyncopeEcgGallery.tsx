import { useState } from "react";
import { Images } from "lucide-react";

import { LightboxImage } from "@/components/ImageLightbox";
import ecgSyncopeSyndromes from "@/assets/ecg-syncope-syndromes.jpeg.asset.json";
import wellensSyndrome from "@/assets/wellens-syndrome-ecg.png.asset.json";
import wobblerEcgSyncope from "@/assets/wobbler-ecg-syncope.png.asset.json";
import wobblerWellensCombined from "@/assets/wobbler-wellens-combined.jpeg.asset.json";
import longQtMorphology from "@/assets/long-qt-morphology.png.asset.json";

type GalleryItem = {
  id: string;
  title: string;
  caption: string;
  src: string;
};

const GALLERY: GalleryItem[] = [
  {
    id: "syndromes",
    title: "Syncope ECG syndromes",
    caption:
      "Overview of the inherited and acquired ECG syndromes that cause arrhythmic syncope.",
    src: ecgSyncopeSyndromes.url,
  },
  {
    id: "wobbler",
    title: "WOBBLER mnemonic",
    caption:
      "WOBBLER: WPW · Obstructed AV · Brugada · Bifascicular block · Left ventricular hypertrophy · Epsilon wave · Repolarisation (QT).",
    src: wobblerEcgSyncope.url,
  },
  {
    id: "wobbler-wellens",
    title: "WOBBLER + Wellens",
    caption: "Combined red-flag reference card for ECG assessment after syncope.",
    src: wobblerWellensCombined.url,
  },
  {
    id: "wellens",
    title: "Wellens pattern",
    caption:
      "Biphasic or deeply inverted T waves in V2–V3 in a pain-free patient — critical LAD stenosis.",
    src: wellensSyndrome.url,
  },
  {
    id: "long-qt",
    title: "Long QT morphology",
    caption: "LQT1 broad-based T, LQT2 low-amplitude notched T, LQT3 late-appearing T.",
    src: longQtMorphology.url,
  },
  {
    id: "brugada",
    title: "Brugada type 1",
    caption: "Coved ST elevation ≥2 mm with inverted T wave in V1–V2.",
    src: "/images/ecg/brugada-pattern.jpg",
  },
  {
    id: "epsilon",
    title: "Epsilon wave (ARVC)",
    caption: "Terminal notch at the end of the QRS in V1–V3, seen in ARVC.",
    src: "/images/ecg/epsilon-wave.jpg",
  },
];

export function SyncopeEcgGallery() {
  const [activeId, setActiveId] = useState(GALLERY[0].id);
  const active = GALLERY.find((g) => g.id === activeId) ?? GALLERY[0];

  return (
    <section className="space-y-4">
      <h3 className="flex items-center gap-2 text-base font-bold lg:text-lg">
        <Images className="h-5 w-5 text-primary" />
        Syncope ECG pattern gallery
      </h3>

      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div
          className="flex gap-3 overflow-x-auto pb-2 lg:max-h-[520px] lg:flex-col lg:overflow-y-auto lg:pb-0 lg:pr-1"
          role="tablist"
          aria-label="Syncope ECG patterns"
        >
          {GALLERY.map((item) => {
            const isActive = item.id === active.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveId(item.id)}
                className={`w-36 shrink-0 overflow-hidden rounded-lg border text-left transition lg:w-full ${
                  isActive
                    ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                    : "border-border/60 bg-background hover:border-border"
                }`}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  loading="lazy"
                  className="h-20 w-full object-cover"
                />
                <span className="block px-2 py-1.5 text-[11px] font-semibold leading-snug">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        <div className="min-w-0">
          <LightboxImage
            key={active.id}
            src={active.src}
            alt={active.title}
            caption={active.caption}
          />
        </div>
      </div>
    </section>
  );
}
