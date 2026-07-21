import { createFileRoute } from "@tanstack/react-router";
import { SyncopeTriageApp } from "@/components/SyncopeTriageApp";

export const Route = createFileRoute("/_layout/syncope-triage")({
  component: SyncopeTriagePage,
});

function SyncopeTriagePage() {
  return (
    <div className="space-y-6">
      <SyncopeTriageApp />
    </div>
  );
}
