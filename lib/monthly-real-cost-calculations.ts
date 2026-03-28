import type {
  TransitMode,
  DirectionsRouteLeg,
  CommuteCostEstimate,
  ParkingZoneCostEstimate,
  UtilitiesEstimate,
  NeighborhoodQualityOfLifeEstimate,
  ApartmentMonthlyRealCostBreakdown,
  ApartmentCandidate,
  ComparisonWinnerInsight,
  UserPriority,
} from "./types";

import {
  DEFAULT_FUEL_COST_EUROS_PER_KM,
  WORKING_DAYS_PER_MONTH,
  COMMUTE_ROUND_TRIPS_PER_DAY,
  ZAGREB_ZET_MONTHLY_PASS_EUROS,
  ZAGREB_BIKE_MONTHLY_EQUIVALENT_EUROS,
  ZAGREB_DEFAULT_UTILITIES_EUROS_PER_SQUARE_METER_MONTH,
  PARKING_ZONE_MONTHLY_EUROS,
  PARKING_NO_ZONE_DEFAULT_EUROS,
  QOL_WEIGHT_SHOPS,
  QOL_WEIGHT_PARKS,
  QOL_WEIGHT_PHARMACIES,
  QOL_WEIGHT_CAFES,
  QOL_SATURATION_COUNT,
} from "../constants";

/**
 * Input types matching Person B's raw API metrics.
 * Structurally compatible with whatever named types Person B adds to types.ts.
 */

interface CommuteMetrics {
  durationSeconds: number;
  distanceMeters: number;
  legs: DirectionsRouteLeg[];
}

interface PlaceCounts {
  shops: number;
  parks: number;
  pharmacies: number;
  cafes: number;
}

interface ParkingLookup {
  zoneCode: string | null;
}

export function calculateCommuteCost(
  metrics: CommuteMetrics,
  mode: TransitMode,
): CommuteCostEstimate | null {
  try {
    const monthlyEuros = commuteEurosForMode(metrics.distanceMeters, mode);
    return {
      monthlyEuros: round2(monthlyEuros),
      durationMinutes: round2(metrics.durationSeconds / 60),
      legs: metrics.legs,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

function commuteEurosForMode(
  oneWayDistanceMeters: number,
  mode: TransitMode,
): number {
  switch (mode) {
    case "car": {
      const km = oneWayDistanceMeters / 1000;
      return km * DEFAULT_FUEL_COST_EUROS_PER_KM
        * COMMUTE_ROUND_TRIPS_PER_DAY
        * WORKING_DAYS_PER_MONTH;
    }
    case "tram_bus":
      return ZAGREB_ZET_MONTHLY_PASS_EUROS;
    case "zagreb_bike":
      return ZAGREB_BIKE_MONTHLY_EQUIVALENT_EUROS;
    case "walk":
      return 0;
  }
}

export function calculateUtilitiesEstimate(
  squareMeters: number,
): UtilitiesEstimate | null {
  try {
    const rate = ZAGREB_DEFAULT_UTILITIES_EUROS_PER_SQUARE_METER_MONTH;
    return {
      monthlyEuros: round2(squareMeters * rate),
      appliedRateEurosPerSquareMeter: rate,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function calculateParkingCost(
  lookup: ParkingLookup,
  mode: TransitMode,
): ParkingZoneCostEstimate | null {
  try {
    if (mode !== "car") {
      return { zoneCode: lookup.zoneCode, monthlyEuros: 0 };
    }
    const euros = lookup.zoneCode !== null
      ? (PARKING_ZONE_MONTHLY_EUROS[lookup.zoneCode] ?? PARKING_NO_ZONE_DEFAULT_EUROS)
      : PARKING_NO_ZONE_DEFAULT_EUROS;
    return { zoneCode: lookup.zoneCode, monthlyEuros: euros };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function calculateNeighborhoodQualityOfLife(
  counts: PlaceCounts,
): NeighborhoodQualityOfLifeEstimate | null {
  try {
    const totalWeight =
      QOL_WEIGHT_SHOPS + QOL_WEIGHT_PARKS + QOL_WEIGHT_PHARMACIES + QOL_WEIGHT_CAFES;

    const weighted =
      saturate(counts.shops) * QOL_WEIGHT_SHOPS +
      saturate(counts.parks) * QOL_WEIGHT_PARKS +
      saturate(counts.pharmacies) * QOL_WEIGHT_PHARMACIES +
      saturate(counts.cafes) * QOL_WEIGHT_CAFES;

    const scoreOutOf100 = Math.min(100, Math.round((weighted / totalWeight) * 100));

    return {
      scoreOutOf100,
      shopsWithinRadius: counts.shops,
      parksWithinRadius: counts.parks,
      pharmaciesWithinRadius: counts.pharmacies,
      cafesWithinRadius: counts.cafes,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

function saturate(count: number): number {
  return Math.min(count / QOL_SATURATION_COUNT, 1);
}

export function calculateMonthlyRealCostBreakdown(
  apartment: ApartmentCandidate,
  commute: CommuteCostEstimate,
  utilities: UtilitiesEstimate,
  parking: ParkingZoneCostEstimate,
  qualityOfLife: NeighborhoodQualityOfLifeEstimate,
): ApartmentMonthlyRealCostBreakdown | null {
  try {
    const total =
      apartment.rentEurosPerMonth +
      utilities.monthlyEuros +
      commute.monthlyEuros +
      parking.monthlyEuros;

    return {
      apartmentId: apartment.id,
      rentEurosPerMonth: apartment.rentEurosPerMonth,
      utilitiesEurosPerMonth: utilities.monthlyEuros,
      commuteEurosPerMonth: commute.monthlyEuros,
      parkingEurosPerMonth: parking.monthlyEuros,
      totalEurosPerMonth: round2(total),
      commuteDurationMinutes: commute.durationMinutes,
      qualityOfLifeScoreOutOf100: qualityOfLife.scoreOutOf100,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function determineComparisonWinner(
  breakdowns: ApartmentMonthlyRealCostBreakdown[],
  priority: UserPriority,
): ComparisonWinnerInsight | null {
  try {
    if (breakdowns.length < 2) {
      return null;
    }

    const sorted = [...breakdowns].sort(comparatorForPriority(priority));
    const winner = sorted[0];
    const runnerUp = sorted[1];

    return {
      winnerApartmentId: winner.apartmentId,
      monthlyTotalDifferenceEuros: round2(
        runnerUp.totalEurosPerMonth - winner.totalEurosPerMonth,
      ),
      dailyCommuteMinutesSavedVersusRunnerUp: round2(
        runnerUp.commuteDurationMinutes - winner.commuteDurationMinutes,
      ),
      qualityOfLifeScoreDifferenceVersusRunnerUp:
        winner.qualityOfLifeScoreOutOf100 - runnerUp.qualityOfLifeScoreOutOf100,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

type BreakdownComparator = (
  a: ApartmentMonthlyRealCostBreakdown,
  b: ApartmentMonthlyRealCostBreakdown,
) => number;

function comparatorForPriority(priority: UserPriority): BreakdownComparator {
  switch (priority) {
    case "lowest_monthly_total":
      return (a, b) => a.totalEurosPerMonth - b.totalEurosPerMonth;
    case "shortest_commute":
      return (a, b) => a.commuteDurationMinutes - b.commuteDurationMinutes;
    case "best_neighborhood_quality":
      return (a, b) => b.qualityOfLifeScoreOutOf100 - a.qualityOfLifeScoreOutOf100;
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
