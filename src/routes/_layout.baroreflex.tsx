import { createFileRoute } from "@tanstack/react-router";

import { BaroreflexFailureAssessment } from "@/components/BaroreflexFailureAssessment";

export const Route = createFileRoute("/_layout/baroreflex")({
  head: () => ({
    meta: [
      { title: "Baroreflex Failure — Four Presentations" },
      {
        name: "description",
        content:
          "Document baroreflex failure phenotype patterns and a BP/HR diary based on Ketch et al., Circulation 2002.",
      },
    ],
  }),
  component: BaroreflexPage,
});

function BaroreflexPage() {
  return (
    <div className="space-y-6">
      <BaroreflexFailureAssessment />
    </div>
  );
}
