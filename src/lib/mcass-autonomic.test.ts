import { describe, expect, it } from "vitest";
import { calculateMcass, getMcassSeverity, type McassInputs } from "./mcass-autonomic";

describe("calculateMcass", () => {
  it("scores a moderate CAN case with combined cardiovagal and adrenergic abnormalities", () => {
    const input: McassInputs = {
      age: 52,
      sex: "female",
      hrvSdnn: 62,
      deepBreathingDeltaHr: 12,
      deepBreathingEiRatio: 1.12,
      valsalvaRatio: 1.3,
      thirtyFifteenRatio: 1.05,
      supineSbp: 122,
      standingSbp: 92,
      supineDbp: 76,
      standingDbp: 64,
      maxSbpFall: 30,
      maxDbpFall: 14,
      hrRiseStanding: 22,
      deltaHrDeltaSbp: 0.8,
      sixMinuteStandingHr: 36,
      potsScreen: "not-screened",
      handgripDbpDelta: 10,
      sudoscanComposite: 2,
      clinicianApproved: true,
      qualityFlags: [],
      manualOverride: false,
    };

    const result = calculateMcass(input);
    expect(result.total).toBe(7);
    expect(result.cardiovagal).toBe(2);
    expect(result.adrenergic).toBe(2);
    expect(result.sudomotor).toBe(3);
    expect(result.severity).toBe("moderate");
    expect(result.canStage).toBe("definite");
  });

  it("classifies a normal autonomic profile as normal with no CAN", () => {
    const input: McassInputs = {
      age: 38,
      sex: "male",
      hrvSdnn: 110,
      deepBreathingDeltaHr: 22,
      deepBreathingEiRatio: 1.43,
      valsalvaRatio: 1.8,
      thirtyFifteenRatio: 1.35,
      supineSbp: 126,
      standingSbp: 120,
      supineDbp: 79,
      standingDbp: 74,
      maxSbpFall: 6,
      maxDbpFall: 5,
      hrRiseStanding: 10,
      deltaHrDeltaSbp: 0.34,
      sixMinuteStandingHr: 12,
      potsScreen: "negative",
      handgripDbpDelta: 18,
      sudoscanComposite: 0,
      clinicianApproved: true,
      qualityFlags: [],
      manualOverride: false,
    };

    const result = calculateMcass(input);
    expect(result.total).toBe(0);
    expect(result.severity).toBe("normal");
    expect(result.canStage).toBe("none");
  });
});

describe("getMcassSeverity", () => {
  it("maps totals to severity labels", () => {
    expect(getMcassSeverity(0)).toBe("normal");
    expect(getMcassSeverity(3)).toBe("mild");
    expect(getMcassSeverity(6)).toBe("moderate");
    expect(getMcassSeverity(9)).toBe("severe");
  });
});
