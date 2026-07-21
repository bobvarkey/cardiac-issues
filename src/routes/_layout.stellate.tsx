import { createFileRoute } from "@tanstack/react-router";

import { StellateGanglionBlock } from "@/components/StellateGanglionBlock";

export const Route = createFileRoute("/_layout/stellate")({
  head: () => ({
    meta: [
      { title: "Stellate Ganglion Block for VT/VF Storm — CardiacRef" },
      {
        name: "description",
        content:
          "Ultrasound-guided stellate ganglion block for refractory VT/VF electrical storm: anatomy, medication dosing, complications, and evidence.",
      },
      {
        property: "og:title",
        content: "Stellate Ganglion Block for VT/VF Storm — CardiacRef",
      },
      {
        property: "og:description",
        content:
          "Rescue sympathetic blockade for refractory ventricular arrhythmia storm: step-by-step procedure, ultrasound landmarks, and dosing.",
      },
      { property: "og:type", content: "article" },
    ],
  }),
  component: StellateGanglionBlock,
});
