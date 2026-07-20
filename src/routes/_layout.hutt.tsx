import { createFileRoute } from "@tanstack/react-router";
import { HUTTMiniApp } from "@/components/HUTTMiniApp";
import { HUTTTour } from "@/components/HUTTTour";

export const Route = createFileRoute("/_layout/hutt")({
  head: () => ({
    meta: [
      { title: "HUTT — Head-Up Tilt Table Test" },
      {
        name: "description",
        content:
          "Head-up tilt table test workflow with Standard/Italian protocol toggle, phase timer, vitals log, and EMR note export.",
      },
    ],
  }),
  component: HUTTPage,
});

function HUTTPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">Autonomic · Syncope workup</span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Head-Up Tilt Table Test</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Run a full HUTT study with phase timing, vitals logging, findings, interpretation, and
          exportable EMR note.
        </p>
      </div>
      <HUTTMiniApp />
      <HUTTTour />
    </div>
  );
}
