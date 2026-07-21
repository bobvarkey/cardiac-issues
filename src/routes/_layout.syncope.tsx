import { createFileRoute, Link } from "@tanstack/react-router";
import { SyncopeAlgorithm } from "@/components/SyncopeAlgorithm";
import { Stethoscope } from "lucide-react";

export const Route = createFileRoute("/_layout/syncope")({
  component: SyncopePage,
});

function SyncopePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Syncope Diagnostic Algorithm</h1>
        <p className="text-muted-foreground mt-1">
          A systematic approach to evaluating syncope based on clinical presentation, ECG findings,
          and hemodynamic assessment.
        </p>
      </div>

      {/* Link to Triage App */}
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Bedside Triage Tool</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Interactive calculator for rapid syncope risk stratification
            </p>
          </div>
          <Link
            to="/syncope-triage"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Stethoscope className="w-4 h-4" />
            Open Triage App
          </Link>
        </div>
      </div>

      <SyncopeAlgorithm />
    </div>
  );
}
