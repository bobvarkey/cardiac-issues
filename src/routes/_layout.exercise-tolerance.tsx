import { createFileRoute } from "@tanstack/react-router";
import { ExerciseToleranceTest } from "@/components/ExerciseToleranceTest";

export const Route = createFileRoute("/_layout/exercise-tolerance")({
  head: () => ({
    meta: [
      { title: "Exercise Tolerance Test (Aerobic Capacity, VO₂max & Lactate Threshold)" },
      {
        name: "description",
        content:
          "Exercise tolerance test for aerobic capacity, VO₂max and lactate threshold. Modified Bruce / bike protocol with lactate, pyruvate & VBG sampling, L:P ratio, second-wind McArdle check and mitochondrial dysfunction flags.",
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
          Exercise Tolerance Test <span className="block text-lg font-normal text-muted-foreground">(Aerobic Capacity, VO₂ max and Lactate Threshold)</span>
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Modified Bruce or bike protocol with serial lactate + pyruvate + VBG
          sampling, lactate-threshold and L:P callouts, mitochondrial-dysfunction
          flags, and a Second-Wind (McArdle) check-in. Patient demographics are
          optional — you can jump straight into the protocol.
        </p>
      </div>
      <ExerciseToleranceTest />
    </div>
  );
}
