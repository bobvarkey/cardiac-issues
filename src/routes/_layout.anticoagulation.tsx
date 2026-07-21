import { createFileRoute } from "@tanstack/react-router";

import { AnticoagulationMiniApp } from "@/components/AnticoagulationMiniApp";

export const Route = createFileRoute("/_layout/anticoagulation")({
  head: () => ({
    meta: [
      { title: "Anticoagulation Guidelines — DOACs, VTE, AF, Stroke" },
      {
        name: "description",
        content:
          "Clinical decision support for DOAC dosing, VTE treatment, AF anticoagulation, stroke prevention, and special populations.",
      },
    ],
  }),
  component: AnticoagulationMiniApp,
});
