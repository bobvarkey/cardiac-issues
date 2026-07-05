import { createFileRoute } from "@tanstack/react-router";

import { AntiarrhythmicsChart } from "@/components/AntiarrhythmicsChart";

export const Route = createFileRoute("/_layout/antiarrhythmics")({
  head: () => ({
    meta: [
      { title: "Anti-arrhythmic drugs — Classification & Mnemonics" },
      {
        name: "description",
        content:
          "Vaughan-Williams classification of anti-arrhythmic drugs with memory mnemonics. Tap a drug to jump into the dosing calculator.",
      },
      {
        property: "og:title",
        content: "Anti-arrhythmic drugs — Classification & Mnemonics",
      },
      {
        property: "og:description",
        content:
          "Vaughan-Williams classification with mnemonics. Tap a drug to preselect it in the live dosing calculator.",
      },
    ],
  }),
  component: AntiarrhythmicsChart,
});
