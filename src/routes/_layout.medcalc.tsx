import { createFileRoute } from "@tanstack/react-router";
import { MedCalcApp } from "@/components/medcalc/MedCalcApp";

export const Route = createFileRoute("/_layout/medcalc")({
  component: MedCalcRoute,
  head: () => ({
    meta: [
      { title: "MedCalc — Sunset Blaze clinical calculators" },
      {
        name: "description",
        content:
          "Warm, offline-first clinical calculators: BMI, BSA, MAP, creatinine clearance, QTc, CHA₂DS₂-VASc. Save results locally.",
      },
      { property: "og:title", content: "MedCalc — Sunset Blaze clinical calculators" },
      {
        property: "og:description",
        content: "Quick clinical math with a calm sunset theme.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function MedCalcRoute() {
  return (
    <div className="mx-auto max-w-xl">
      <MedCalcApp />
    </div>
  );
}
