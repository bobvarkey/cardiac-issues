import { describe, expect, it } from "vitest";
import { getFollowUpBranch, getVisibleQuestionSections, type TriageAnswers } from "./syncope-triage-logic";

const baseAnswers: TriageAnswers = {
  trueSyncope: true,
  ecg: {
    abnormal: false,
    ischemia: false,
    bradycardia: false,
    tachycardia: false,
    qtProlonged: false,
    preexcitation: false,
    brugadaPattern: false,
    afib: false,
    avBlock: false,
  },
  redFlags: {
    exertional: false,
    familyHistorySuddenDeath: false,
    structuralHeartDisease: false,
    palpitationsBeforeSyncope: false,
    syncopeSupine: false,
    chestPain: false,
    dyspnea: false,
  },
  orthostatic: {
    supineSBP: 120,
    standingSBP: 118,
    supineDBP: 80,
    standingDBP: 78,
  },
  trigger: {
    pain: false,
    emotion: false,
    prolongedStanding: false,
    heatExposure: false,
    nauseaSweating: false,
    postMicturition: false,
  },
};

describe("syncope triage branching", () => {
  it("skips the risk pathway when the event is not true syncope", () => {
    const result = getFollowUpBranch({ ...baseAnswers, trueSyncope: false });
    expect(result.branch).toBe("not_syncope");
    expect(result.visibleSections).toEqual(["presentation"]);
  });

  it("opens ECG and red flag follow-up when an alarm feature is present", () => {
    const result = getFollowUpBranch({
      ...baseAnswers,
      redFlags: { ...baseAnswers.redFlags, exertional: true },
    });

    expect(result.branch).toBe("cardiac");
    expect(result.visibleSections).toEqual(["presentation", "cardiac-risk", "ecg-patterns"]);
  });

  it("shows orthostatic and trigger prompts when the patient has true syncope with no cardiac red flags", () => {
    const result = getFollowUpBranch(baseAnswers);
    expect(result.branch).toBe("evaluation");
    expect(result.visibleSections).toContain("orthostatic");
    expect(result.visibleSections).toContain("triggers");
  });

  it("includes the relevant follow-up sections for each branch", () => {
    const sections = getVisibleQuestionSections(baseAnswers);
    expect(sections).toContain("presentation");
    expect(sections).toContain("orthostatic");
    expect(sections).toContain("triggers");
  });
});
