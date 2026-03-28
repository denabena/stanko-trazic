import { NextResponse } from "next/server";

import {
  isUserPriority,
  readFiniteNumber,
  readNonEmptyString,
} from "@/lib/api-request-guards";
import { requestGeminiComparisonNarrative } from "@/lib/google-gemini";
import type { GeminiComparisonSummaryRequest } from "@/lib/types";

type ApartmentRow = GeminiComparisonSummaryRequest["apartments"][0];

function parseApartmentRow(
  row: unknown,
): { ok: true; row: ApartmentRow } | { ok: false; error: string } {
  if (typeof row !== "object" || row === null) {
    return { ok: false, error: "Each apartment must be an object" };
  }
  const o = row as Record<string, unknown>;
  const addressLine = readNonEmptyString(o.addressLine);
  if (addressLine === null) {
    return { ok: false, error: "apartment.addressLine is required" };
  }
  const rentEurosPerMonth = readFiniteNumber(o.rentEurosPerMonth);
  const utilitiesEurosPerMonth = readFiniteNumber(o.utilitiesEurosPerMonth);
  const commuteEurosPerMonth = readFiniteNumber(o.commuteEurosPerMonth);
  const parkingEurosPerMonth = readFiniteNumber(o.parkingEurosPerMonth);
  const totalEurosPerMonth = readFiniteNumber(o.totalEurosPerMonth);
  const commuteDurationMinutes = readFiniteNumber(o.commuteDurationMinutes);
  const qualityOfLifeScoreOutOf100 = readFiniteNumber(
    o.qualityOfLifeScoreOutOf100,
  );
  if (
    rentEurosPerMonth === null ||
    utilitiesEurosPerMonth === null ||
    commuteEurosPerMonth === null ||
    parkingEurosPerMonth === null ||
    totalEurosPerMonth === null ||
    commuteDurationMinutes === null ||
    qualityOfLifeScoreOutOf100 === null
  ) {
    return { ok: false, error: "apartment has invalid numeric fields" };
  }
  return {
    ok: true,
    row: {
      addressLine,
      rentEurosPerMonth,
      utilitiesEurosPerMonth,
      commuteEurosPerMonth,
      parkingEurosPerMonth,
      totalEurosPerMonth,
      commuteDurationMinutes,
      qualityOfLifeScoreOutOf100,
    },
  };
}

function parseGeminiComparisonSummaryBody(body: unknown):
  | { ok: true; data: GeminiComparisonSummaryRequest }
  | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const b = body as Record<string, unknown>;
  if (!isUserPriority(b.priority)) {
    return { ok: false, error: "priority is invalid" };
  }
  const apartmentsRaw = b.apartments;
  if (!Array.isArray(apartmentsRaw)) {
    return { ok: false, error: "apartments must be an array" };
  }
  if (apartmentsRaw.length < 2 || apartmentsRaw.length > 5) {
    return { ok: false, error: "apartments must have 2 to 5 entries" };
  }
  const apartments: GeminiComparisonSummaryRequest["apartments"] = [];
  for (const row of apartmentsRaw) {
    const parsed = parseApartmentRow(row);
    if (!parsed.ok) {
      return parsed;
    }
    apartments.push(parsed.row);
  }
  const winnerAddress = readNonEmptyString(b.winnerAddress);
  const runnerUpAddress = readNonEmptyString(b.runnerUpAddress);
  if (winnerAddress === null) {
    return { ok: false, error: "winnerAddress is required" };
  }
  if (runnerUpAddress === null) {
    return { ok: false, error: "runnerUpAddress is required" };
  }
  const monthlyTotalDifferenceEuros = readFiniteNumber(
    b.monthlyTotalDifferenceEuros,
  );
  const dailyCommuteMinutesSavedVersusRunnerUp = readFiniteNumber(
    b.dailyCommuteMinutesSavedVersusRunnerUp,
  );
  const qualityOfLifeScoreDifferenceVersusRunnerUp = readFiniteNumber(
    b.qualityOfLifeScoreDifferenceVersusRunnerUp,
  );
  if (
    monthlyTotalDifferenceEuros === null ||
    dailyCommuteMinutesSavedVersusRunnerUp === null ||
    qualityOfLifeScoreDifferenceVersusRunnerUp === null
  ) {
    return { ok: false, error: "winner comparison numbers are invalid" };
  }
  return {
    ok: true,
    data: {
      priority: b.priority,
      apartments,
      winnerAddress,
      runnerUpAddress,
      monthlyTotalDifferenceEuros,
      dailyCommuteMinutesSavedVersusRunnerUp,
      qualityOfLifeScoreDifferenceVersusRunnerUp,
    },
  };
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = parseGeminiComparisonSummaryBody(json);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (typeof apiKey !== "string" || apiKey.length === 0) {
      return NextResponse.json(
        { error: "Gemini API is not configured" },
        { status: 500 },
      );
    }
    const narrative = await requestGeminiComparisonNarrative(parsed.data);
    if (narrative === null) {
      return NextResponse.json(
        { error: "Could not generate summary" },
        { status: 502 },
      );
    }
    return NextResponse.json({ data: narrative });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
