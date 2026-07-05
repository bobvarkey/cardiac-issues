import { createFileRoute } from "@tanstack/react-router";
import { SyncopeAlgorithm } from "@/components/SyncopeAlgorithm";

export const Route = createFileRoute("/_layout/syncope")({
  component: SyncopePage,
});

function SyncopePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Syncope Diagnostic Algorithm</h1>
        <p className="text-muted-foreground mt-1">
          A systematic approach to evaluating syncope based on clinical presentation, ECG findings, and hemodynamic assessment.
        </p>
      </div>
      <SyncopeAlgorithm />
    </div>
  );
}