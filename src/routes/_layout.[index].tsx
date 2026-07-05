import { createFileRoute } from "@tanstack/react-router";

import { HomeProtocols } from "@/components/HomeProtocols";

export const Route = createFileRoute("/_layout/index")({
  head: () => ({
    meta: [
      { title: "CardiacRef — Clinical Cardiac Protocols" },
      {
        name: "description",
        content:
          "Interactive bedside reference for adult cardiac emergencies: Code Blue, tachycardia, bradycardia, atrial fibrillation, and ventricular ectopy.",
      },
      { property: "og:title", content: "CardiacRef — Clinical Cardiac Protocols" },
      {
        property: "og:description",
        content: "Interactive bedside reference for common adult cardiac emergencies.",
      },
    ],
  }),
  component: HomeProtocols,
});