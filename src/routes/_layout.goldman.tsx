import { createFileRoute } from "@tanstack/react-router";
import { GoldmanCardiacIndex } from "@/components/GoldmanCardiacIndex";

export const Route = createFileRoute("/_layout/goldman")({
  head: () => ({
    meta: [
      { title: "Goldman Cardiac Risk Index — CardiacRef" },
      {
        name: "description",
        content:
          "Interactive Goldman Cardiac Risk Index for non-cardiac surgery with ECG patterns, anti-arrhythmic drugs, syncope algorithm, and ACLS/BLS protocols.",
      },
    ],
  }),
  component: GoldmanPage,
});

function GoldmanPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <GoldmanCardiacIndex />
    </div>
  );
}
