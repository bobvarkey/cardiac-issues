import { createFileRoute } from "@tanstack/react-router";
import { MCASSMiniApp } from "@/components/MCASSMiniApp";

export const Route = createFileRoute("/_layout/autonomic")({
  head: () => ({
    meta: [
      { title: "mCASS — Cardiac Autonomic Neuropathy" },
      {
        name: "description",
        content:
          "mCASS mini app for autonomic dysfunction testing: HRV, deep breathing, Valsalva, orthostatic BP, POTS screen, handgrip, Sudoscan, and CAN staging.",
      },
    ],
  }),
  component: AutonomicPage,
});

function AutonomicPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Autonomic · CAN workup</span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">mCASS autonomic testing</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Evaluate cardiovagal, adrenergic, and sudomotor domains, appraise orthostatic physiology,
          and generate report-ready CAN staging with integrated safety and data-quality safeguards.
        </p>
      </div>
      <MCASSMiniApp />
    </div>
  );
}
