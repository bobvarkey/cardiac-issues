import { describe, expect, it } from "vitest";
import { getDefaultECGInput } from "./ecg-rule-engine";
import { scoreWobbler } from "./wobbler-scoring";
import { ecgTestCases } from "./ecg-test-cases";

describe("scoreWobbler — reference cases", () => {
  for (const tc of ecgTestCases) {
    it(`${tc.id}: ${tc.name}`, () => {
      const s = scoreWobbler(tc.input);
      expect(s.triggered.map((c) => c.key).sort()).toEqual([...tc.expected.triggeredKeys].sort());
      expect(s.total).toBe(tc.expected.total);
      expect(s.riskLevel).toBe(tc.expected.riskLevel);
      expect(s.disposition).toBe(tc.expected.recommendationGist);
    });
  }
});

describe("scoreWobbler — invariants", () => {
  it("empty input scores zero and is low risk", () => {
    const s = scoreWobbler(getDefaultECGInput());
    expect(s.total).toBe(0);
    expect(s.riskLevel).toBe("low");
    expect(s.hasMajor).toBe(false);
  });

  it("does not flag bradycardia when heart rate is unentered (0)", () => {
    const s = scoreWobbler({ ...getDefaultECGInput(), heart_rate: 0 });
    expect(s.triggered.map((c) => c.key)).not.toContain("bradycardia");
  });

  it("does not flag pre-excitation when PR is unentered (0)", () => {
    const s = scoreWobbler({ ...getDefaultECGInput(), pr_interval_ms: 0, delta_wave: true });
    expect(s.triggered.map((c) => c.key)).not.toContain("preexcitation");
  });

  it("any single major finding forces high risk regardless of total", () => {
    const s = scoreWobbler({ ...getDefaultECGInput(), svt_or_vt_present: true });
    expect(s.total).toBe(3);
    expect(s.hasMajor).toBe(true);
    expect(s.riskLevel).toBe("high");
  });

  it("QTc thresholds are exclusive: 480 borderline, 500 severe", () => {
    const keys = (qtc: number) =>
      scoreWobbler({ ...getDefaultECGInput(), qtc_ms: qtc }).triggered.map((c) => c.key);
    expect(keys(479)).toEqual([]);
    expect(keys(480)).toEqual(["repolarization_borderline"]);
    expect(keys(499)).toEqual(["repolarization_borderline"]);
    expect(keys(500)).toEqual(["repolarization"]);
  });

  it("QRS width threshold triggers at exactly 120 ms", () => {
    const at = (ms: number) =>
      scoreWobbler({ ...getDefaultECGInput(), qrs_duration_ms_global: ms }).triggered.map(
        (c) => c.key,
      );
    expect(at(119)).toEqual([]);
    expect(at(120)).toEqual(["wide_qrs"]);
  });

  it("total never exceeds maxPossible and points match severity weights", () => {
    for (const tc of ecgTestCases) {
      const s = scoreWobbler(tc.input);
      expect(s.total).toBeLessThanOrEqual(s.maxPossible);
      for (const c of s.triggered) {
        expect(c.points).toBe(c.severity === "major" ? 3 : c.severity === "moderate" ? 2 : 1);
      }
    }
  });

  it("recommendation text matches the risk level", () => {
    expect(scoreWobbler(getDefaultECGInput()).recommendation).toMatch(/Low risk/);
    expect(
      scoreWobbler({ ...getDefaultECGInput(), qtc_ms: 485 }).recommendation,
    ).toMatch(/Intermediate risk/);
    expect(
      scoreWobbler({ ...getDefaultECGInput(), high_grade_av_block: true }).recommendation,
    ).toMatch(/High risk/);
  });
});
