import { describe, it, expect } from "vitest";
import {
  calculateCommuteCost,
  calculateUtilitiesEstimate,
  calculateParkingCost,
  calculateNeighborhoodQualityOfLife,
  calculateMonthlyRealCostBreakdown,
  determineComparisonWinner,
} from "./monthly-real-cost-calculations";

const singleLeg = (durationSeconds: number, distanceMeters: number) => [
  { durationSeconds, distanceMeters },
];

describe("calculateCommuteCost", () => {
  const metrics = {
    durationSeconds: 1800,
    distanceMeters: 10_000,
    legs: singleLeg(1800, 10_000),
  };

  it("car: fuel * round trips * working days", () => {
    const result = calculateCommuteCost(metrics, "car");
    expect(result?.monthlyEuros).toBe(52.8);
    expect(result?.durationMinutes).toBe(30);
    expect(result?.legs).toEqual(metrics.legs);
  });

  it("tram_bus: flat ZET pass", () => {
    const result = calculateCommuteCost(metrics, "tram_bus");
    expect(result?.monthlyEuros).toBe(30);
  });

  it("zagreb_bike: flat bike pass", () => {
    const result = calculateCommuteCost(metrics, "zagreb_bike");
    expect(result?.monthlyEuros).toBe(5);
  });

  it("walk: free", () => {
    const result = calculateCommuteCost(metrics, "walk");
    expect(result?.monthlyEuros).toBe(0);
  });

  it("short car commute (2 km)", () => {
    const short = { durationSeconds: 300, distanceMeters: 2000, legs: singleLeg(300, 2000) };
    const result = calculateCommuteCost(short, "car");
    expect(result?.monthlyEuros).toBe(10.56);
  });
});

describe("calculateUtilitiesEstimate", () => {
  it("50 m² at default rate", () => {
    const result = calculateUtilitiesEstimate(50);
    expect(result?.monthlyEuros).toBe(42.5);
    expect(result?.appliedRateEurosPerSquareMeter).toBe(0.85);
  });

  it("0 m² returns 0", () => {
    const result = calculateUtilitiesEstimate(0);
    expect(result?.monthlyEuros).toBe(0);
  });
});

describe("calculateParkingCost", () => {
  it("zone 1 for car", () => {
    const result = calculateParkingCost({ zoneCode: "1" }, "car");
    expect(result?.monthlyEuros).toBe(66);
    expect(result?.zoneCode).toBe("1");
  });

  it("zone 3 for car", () => {
    const result = calculateParkingCost({ zoneCode: "3" }, "car");
    expect(result?.monthlyEuros).toBe(26);
  });

  it("unknown zone for car falls back to 0", () => {
    const result = calculateParkingCost({ zoneCode: "99" }, "car");
    expect(result?.monthlyEuros).toBe(0);
  });

  it("null zone for car falls back to 0", () => {
    const result = calculateParkingCost({ zoneCode: null }, "car");
    expect(result?.monthlyEuros).toBe(0);
  });

  it("non-car mode always 0 regardless of zone", () => {
    expect(calculateParkingCost({ zoneCode: "1" }, "tram_bus")?.monthlyEuros).toBe(0);
    expect(calculateParkingCost({ zoneCode: "1" }, "zagreb_bike")?.monthlyEuros).toBe(0);
    expect(calculateParkingCost({ zoneCode: "1" }, "walk")?.monthlyEuros).toBe(0);
  });
});

describe("calculateNeighborhoodQualityOfLife", () => {
  it("fully saturated counts → 100", () => {
    const result = calculateNeighborhoodQualityOfLife({
      shops: 10, parks: 10, pharmacies: 10, cafes: 10,
    });
    expect(result?.scoreOutOf100).toBe(100);
  });

  it("all zeros → 0", () => {
    const result = calculateNeighborhoodQualityOfLife({
      shops: 0, parks: 0, pharmacies: 0, cafes: 0,
    });
    expect(result?.scoreOutOf100).toBe(0);
  });

  it("counts above saturation are capped at 100", () => {
    const result = calculateNeighborhoodQualityOfLife({
      shops: 50, parks: 50, pharmacies: 50, cafes: 50,
    });
    expect(result?.scoreOutOf100).toBe(100);
  });

  it("parks-heavy neighborhood scores higher than cafes-heavy (parks weight > cafes weight)", () => {
    const parksHeavy = calculateNeighborhoodQualityOfLife({
      shops: 0, parks: 10, pharmacies: 0, cafes: 0,
    });
    const cafesHeavy = calculateNeighborhoodQualityOfLife({
      shops: 0, parks: 0, pharmacies: 0, cafes: 10,
    });
    expect(parksHeavy!.scoreOutOf100).toBeGreaterThan(cafesHeavy!.scoreOutOf100);
  });

  it("passes through raw counts", () => {
    const result = calculateNeighborhoodQualityOfLife({
      shops: 3, parks: 7, pharmacies: 1, cafes: 5,
    });
    expect(result?.shopsWithinRadius).toBe(3);
    expect(result?.parksWithinRadius).toBe(7);
    expect(result?.pharmaciesWithinRadius).toBe(1);
    expect(result?.cafesWithinRadius).toBe(5);
  });
});

describe("calculateMonthlyRealCostBreakdown", () => {
  it("sums all cost components into total", () => {
    const result = calculateMonthlyRealCostBreakdown(
      { id: "apt-1", addressLine: "Ilica 1", rentEurosPerMonth: 500, squareMeters: 60 },
      { monthlyEuros: 52.8, durationMinutes: 30, legs: singleLeg(1800, 10_000) },
      { monthlyEuros: 42.5, appliedRateEurosPerSquareMeter: 0.85 },
      { zoneCode: "1", monthlyEuros: 66 },
      { scoreOutOf100: 72, shopsWithinRadius: 5, parksWithinRadius: 3, pharmaciesWithinRadius: 2, cafesWithinRadius: 8 },
    );

    expect(result?.apartmentId).toBe("apt-1");
    expect(result?.totalEurosPerMonth).toBe(661.3);
    expect(result?.rentEurosPerMonth).toBe(500);
    expect(result?.utilitiesEurosPerMonth).toBe(42.5);
    expect(result?.commuteEurosPerMonth).toBe(52.8);
    expect(result?.parkingEurosPerMonth).toBe(66);
    expect(result?.commuteDurationMinutes).toBe(30);
    expect(result?.qualityOfLifeScoreOutOf100).toBe(72);
  });
});

describe("determineComparisonWinner", () => {
  const breakdowns = [
    {
      apartmentId: "a",
      rentEurosPerMonth: 500,
      utilitiesEurosPerMonth: 40,
      commuteEurosPerMonth: 60,
      parkingEurosPerMonth: 66,
      totalEurosPerMonth: 666,
      commuteDurationMinutes: 30,
      qualityOfLifeScoreOutOf100: 70,
    },
    {
      apartmentId: "b",
      rentEurosPerMonth: 400,
      utilitiesEurosPerMonth: 35,
      commuteEurosPerMonth: 80,
      parkingEurosPerMonth: 40,
      totalEurosPerMonth: 555,
      commuteDurationMinutes: 45,
      qualityOfLifeScoreOutOf100: 85,
    },
  ];

  it("lowest_monthly_total picks cheaper apartment", () => {
    const result = determineComparisonWinner(breakdowns, "lowest_monthly_total");
    expect(result?.winnerApartmentId).toBe("b");
    expect(result?.monthlyTotalDifferenceEuros).toBe(111);
  });

  it("shortest_commute picks faster apartment", () => {
    const result = determineComparisonWinner(breakdowns, "shortest_commute");
    expect(result?.winnerApartmentId).toBe("a");
    expect(result?.dailyCommuteMinutesSavedVersusRunnerUp).toBe(15);
  });

  it("best_neighborhood_quality picks higher QoL", () => {
    const result = determineComparisonWinner(breakdowns, "best_neighborhood_quality");
    expect(result?.winnerApartmentId).toBe("b");
    expect(result?.qualityOfLifeScoreDifferenceVersusRunnerUp).toBe(15);
  });

  it("returns null for fewer than 2 breakdowns", () => {
    expect(determineComparisonWinner([breakdowns[0]], "lowest_monthly_total")).toBeNull();
  });

  it("returns null for empty array", () => {
    expect(determineComparisonWinner([], "lowest_monthly_total")).toBeNull();
  });
});
