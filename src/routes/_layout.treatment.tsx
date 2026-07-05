import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { TreatmentMiniApp } from "@/components/TreatmentMiniApp";

const searchSchema = z.object({
  drug: z.string().optional(),
});

export const Route = createFileRoute("/_layout/treatment")({
  validateSearch: searchSchema,
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
