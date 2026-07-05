import { createFileRoute } from "@tanstack/react-router";

import { TreatmentMiniApp } from "@/components/TreatmentMiniApp";

export const Route = createFileRoute("/_layout/treatment")({
  head: () => ({
    meta: [
      { title: "Treatment Mini App — AF / VT / VF" },
      {
        name: "description",
        content:
          "Stability-first treatment recommendations and weight-based dosing for atrial fibrillation, ventricular tachycardia, and ventricular fibrillation.",
      },
    ],
  }),
  component: TreatmentMiniApp,
});
