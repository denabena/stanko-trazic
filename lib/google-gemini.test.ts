import { describe, expect, it } from "vitest";

import { buildGeminiComparisonPrompt } from "./google-gemini";
import type { GeminiComparisonSummaryRequest } from "./types";

const minimalCtx: GeminiComparisonSummaryRequest = {
  priority: "lowest_monthly_total",
  apartments: [
    {
      addressLine: "Ilica 1, Zagreb",
      rentEurosPerMonth: 550,
      utilitiesEurosPerMonth: 40,
      commuteEurosPerMonth: 30,
      parkingEurosPerMonth: 0,
      totalEurosPerMonth: 620,
      commuteDurationMinutes: 25,
      qualityOfLifeScoreOutOf100: 80,
    },
    {
      addressLine: "Trg 2, Zagreb",
      rentEurosPerMonth: 620,
      utilitiesEurosPerMonth: 42,
      commuteEurosPerMonth: 20,
      parkingEurosPerMonth: 0,
      totalEurosPerMonth: 682,
      commuteDurationMinutes: 18,
      qualityOfLifeScoreOutOf100: 88,
    },
  ],
  winnerAddress: "Ilica 1, Zagreb",
  runnerUpAddress: "Trg 2, Zagreb",
  monthlyTotalDifferenceEuros: 62,
  dailyCommuteMinutesSavedVersusRunnerUp: -7,
  qualityOfLifeScoreDifferenceVersusRunnerUp: -8,
};

describe("buildGeminiComparisonPrompt", () => {
  it("includes priority, addresses, and DATA labels", () => {
    const p = buildGeminiComparisonPrompt(minimalCtx);
    expect(p).toContain("PRIORITY: lowest_monthly_total");
    expect(p).toContain("Ilica 1, Zagreb");
    expect(p).toContain("Winner (by app ranking)");
    expect(p).toContain("bullet list only");
    expect(p).toContain("Rent €/mo: 550");
    expect(p).toContain("€62 cheaper");
  });
});
