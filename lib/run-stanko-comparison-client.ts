import {
  calculateCommuteCost,
  calculateMonthlyRealCostBreakdown,
  calculateNeighborhoodQualityOfLife,
  calculateParkingCost,
  calculateUtilitiesEstimate,
  determineComparisonWinner,
} from "@/lib/monthly-real-cost-calculations";
import {
  postCommuteDirections,
  postNeighborhoodQuality,
  postParkingZone,
} from "@/lib/stanko-api-client";
import type {
  ApartmentEntryStepState,
  ApartmentMonthlyRealCostBreakdown,
  ComparisonWinnerInsight,
  NeighborhoodPlaceCounts,
  TransitPriorityQuizAnswers,
} from "@/lib/types";

const EMPTY_NEIGHBORHOOD_COUNTS: NeighborhoodPlaceCounts = {
  shops: 0,
  parks: 0,
  pharmacies: 0,
  cafes: 0,
};

export interface StankoComparisonResult {
  breakdowns: ApartmentMonthlyRealCostBreakdown[];
  winner: ComparisonWinnerInsight | null;
  errors: string[];
}

export async function runStankoComparison(
  entry: ApartmentEntryStepState,
  quiz: TransitPriorityQuizAnswers,
): Promise<StankoComparisonResult> {
  const errors: string[] = [];
  const breakdowns: ApartmentMonthlyRealCostBreakdown[] = [];

  for (const apt of entry.apartments) {
    const commuteRes = await postCommuteDirections({
      originAddress: apt.addressLine.trim(),
      destinationPlaceIdOrAddress: entry.destination.placeIdOrAddress.trim(),
      transitMode: quiz.transitMode,
    });
    if (!commuteRes.ok) {
      errors.push(`${apt.addressLine || apt.id}: commute — ${commuteRes.error}`);
      continue;
    }
    const commute = calculateCommuteCost(commuteRes.data, quiz.transitMode);
    if (commute === null) {
      errors.push(`${apt.id}: commute calculation failed`);
      continue;
    }

    const nRes = await postNeighborhoodQuality({
      address: apt.addressLine.trim(),
    });
    const placeCounts: NeighborhoodPlaceCounts = nRes.ok
      ? nRes.data
      : EMPTY_NEIGHBORHOOD_COUNTS;
    if (!nRes.ok) {
      errors.push(
        `${apt.addressLine || apt.id}: neighborhood unavailable — using minimal amenities estimate (${nRes.error})`,
      );
    }
    const qol = calculateNeighborhoodQualityOfLife(placeCounts);
    if (qol === null) {
      errors.push(`${apt.id}: QoL calculation failed`);
      continue;
    }

    const pRes = await postParkingZone({ address: apt.addressLine.trim() });
    const parkingLookup = pRes.ok ? pRes.data : { zoneCode: null as string | null };
    if (!pRes.ok) {
      errors.push(
        `${apt.addressLine || apt.id}: parking zone unknown — assuming no paid zone (${pRes.error})`,
      );
    }
    const parking = calculateParkingCost(parkingLookup, quiz.transitMode);
    if (parking === null) {
      errors.push(`${apt.id}: parking cost failed`);
      continue;
    }

    const utils = calculateUtilitiesEstimate(apt.squareMeters);
    if (utils === null) {
      errors.push(`${apt.id}: utilities failed`);
      continue;
    }

    const row = calculateMonthlyRealCostBreakdown(
      apt,
      commute,
      utils,
      parking,
      qol,
    );
    if (row === null) {
      errors.push(`${apt.id}: breakdown failed`);
      continue;
    }
    breakdowns.push(row);
  }

  const winner =
    breakdowns.length >= 2
      ? determineComparisonWinner(breakdowns, quiz.priority)
      : null;

  return { breakdowns, winner, errors };
}
