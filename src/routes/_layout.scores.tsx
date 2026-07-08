import { createFileRoute } from "@tanstack/react-router";

import { ScoresMiniApp } from "@/components/ScoresMiniApp";

export const Route = createFileRoute("/_layout/scores")({
  head: () => ({
    meta: [
      { title: "Stroke & Bleeding Risk Scores — CHA₂DS₂-VASc, HAS-BLED" },
      {
        name: "description",
        content:
          "Calculate CHA₂DS₂-VASc stroke risk and HAS-BLED bleeding risk scores for atrial fibrillation patients.",
      },
    ],
  }),
  component: ScoresMiniApp,
});