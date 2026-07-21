import { createFileRoute } from "@tanstack/react-router";

import { WarfarinMiniApp } from "@/components/WarfarinMiniApp";

export const Route = createFileRoute("/_layout/warfarin")({
  head: () => ({
    meta: [
      { title: "Warfarin/INR Monitoring — Dose Adjustment & Bleeding Risk" },
      {
        name: "description",
        content:
          "Warfarin/Acitrom INR dose adjustment algorithm, labile INR detection, and ATRIA bleeding risk score calculator.",
      },
    ],
  }),
  component: WarfarinMiniApp,
});
