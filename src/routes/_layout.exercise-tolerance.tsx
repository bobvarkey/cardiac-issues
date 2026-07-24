import { createFileRoute } from "@tanstack/react-router";
import { ExerciseToleranceTest } from "@/components/ExerciseToleranceTest";

export const Route = createFileRoute("/_layout/exercise-tolerance")({
  head: () => ({
    meta: [
      { title: "Exercise Tolerance Test — VO₂max / Lactate Stress Test" },
      {
        name: "description",
        content:
          "Exercise tolerance test mini-app with Modified Bruce / bike protocol, lactate curve analysis, VO₂max estimation, and printable report.",
      },
    ],
  }),
  component: ExerciseTolerancePage,
});

function ExerciseTolerancePage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2.5 text-xs text-primary">
          <span className="pulse-dot" />
          <span className="font-mono uppercase tracking-wider">
            Investigations · Exercise Physiology
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Exercise Tolerance Test
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          VO₂max / lactate stress test with Modified Bruce or bicycle ergometer
          protocol, real-time METs calculation, lactate pattern analysis, and
          printable report.
        </p>
      </div>
      <ExerciseToleranceTest />
    </div>
  );
}
