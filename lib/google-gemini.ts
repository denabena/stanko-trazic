import {
  GEMINI_GENERATE_CONTENT_MODEL,
  GEMINI_REST_API_BASE,
  GEMINI_WINNER_SUMMARY_MAX_CHARS,
  PARKING_ZONE_1_STREETS,
  PARKING_ZONE_2_STREETS,
  PARKING_ZONE_3_STREETS,
  PARKING_ZONE_4_1_STREETS,
  PARKING_ZONE_4_2_STREETS,
  PARKING_ZONE_VALID_CODES,
} from "@/constants/index";
import type {
  GeminiComparisonNarrative,
  GeminiComparisonSummaryRequest,
  ParkingZoneLookupResult,
} from "@/lib/types";

function resolveGeminiModelId(): string {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }
  return GEMINI_GENERATE_CONTENT_MODEL;
}

function buildGeminiUrl(apiKey: string): string {
  const model = encodeURIComponent(resolveGeminiModelId());
  return `${GEMINI_REST_API_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

function formatCommuteMinutes(minutes: number): string {
  const r = Math.round(minutes * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

export function buildGeminiComparisonPrompt(
  ctx: GeminiComparisonSummaryRequest,
): string {
  const apartmentBlocks = ctx.apartments
    .map(
      (a) =>
        `Apartment: ${a.addressLine}\n` +
        `  Rent €/mo: ${Math.round(a.rentEurosPerMonth)} | Utilities €/mo: ${Math.round(a.utilitiesEurosPerMonth)} | Commute €/mo: ${Math.round(a.commuteEurosPerMonth)} | Parking €/mo: ${Math.round(a.parkingEurosPerMonth)} | Total €/mo: ${Math.round(a.totalEurosPerMonth)}\n` +
        `  Commute: ${formatCommuteMinutes(a.commuteDurationMinutes)} minutes | QoL (0–100): ${a.qualityOfLifeScoreOutOf100}`,
    )
    .join("\n\n");

  const md = Math.round(ctx.monthlyTotalDifferenceEuros * 100) / 100;
  const commuteDelta =
    Math.round(ctx.dailyCommuteMinutesSavedVersusRunnerUp * 100) / 100;
  const qolDelta =
    Math.round(ctx.qualityOfLifeScoreDifferenceVersusRunnerUp * 100) / 100;

  const totalLine =
    md > 0
      ? `Monthly total: winner is €${md} cheaper per month than runner-up`
      : md < 0
        ? `Monthly total: winner is €${Math.abs(md)} more expensive per month than runner-up (ranked by stated priority)`
        : `Monthly total: winner and runner-up have the same total`;

  const commuteLine =
    commuteDelta > 0
      ? `Commute: winner is ${commuteDelta} minutes shorter than runner-up (one-way trip duration in DATA above)`
      : commuteDelta < 0
        ? `Commute: winner is ${Math.abs(commuteDelta)} minutes longer than runner-up (one-way trip duration in DATA above)`
        : `Commute: winner and runner-up have the same commute time`;

  const qolLine =
    qolDelta > 0
      ? `QoL: winner scores ${qolDelta} points higher than runner-up`
      : qolDelta < 0
        ? `QoL: winner scores ${Math.abs(qolDelta)} points lower than runner-up`
        : `QoL: winner and runner-up have the same score`;

  const dataSection = [
    apartmentBlocks,
    "",
    `Winner (by app ranking): ${ctx.winnerAddress}`,
    `Runner-up: ${ctx.runnerUpAddress}`,
    totalLine,
    commuteLine,
    qolLine,
  ].join("\n");

  return [
    "You explain apartment comparisons in Zagreb to renters. Follow these rules strictly:",
    "- Use ONLY the numbers and labels in the DATA section. Do not invent prices, times, neighborhoods, or routes.",
    "- Write in clear English.",
    "",
    "OUTPUT FORMAT (required):",
    "- Reply with a bullet list only. No essay, no opening paragraph, no closing paragraph.",
    "- Each line must start with \"- \" (hyphen + space) and be one concise bullet.",
    "- Use 5 to 8 bullets. Do not use numbered lists, bold, or headings—only \"- \" lines.",
    "",
    "Cover these points across your bullets (order is flexible):",
    "- Which address wins for the user's PRIORITY and why (lowest_monthly_total → total €/month; shortest_commute → commute minutes; best_neighborhood_quality → QoL score).",
    "- Runner-up address and how it compares using concrete figures from DATA.",
    "- Monthly total € comparison (winner vs runner-up).",
    "- Commute time comparison (one-way minutes from DATA).",
    "- QoL score comparison.",
    "- One bullet for the main tradeoff if choosing the winner (only facts from DATA).",
    "",
    `PRIORITY: ${ctx.priority}`,
    "",
    "DATA:",
    "",
    dataSection,
  ].join("\n");
}

function extractTextFromGeminiPayload(data: unknown): string | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }
  const candidates = (data as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }
  const first = candidates[0];
  if (typeof first !== "object" || first === null) {
    return null;
  }
  const content = (first as { content?: { parts?: unknown } }).content;
  if (typeof content !== "object" || content === null) {
    return null;
  }
  const parts = content.parts;
  if (!Array.isArray(parts) || parts.length === 0) {
    return null;
  }
  const part = parts[0];
  if (typeof part !== "object" || part === null) {
    return null;
  }
  const text = (part as { text?: unknown }).text;
  if (typeof text !== "string") {
    return null;
  }
  return text;
}

export async function requestGeminiComparisonNarrative(
  ctx: GeminiComparisonSummaryRequest,
): Promise<GeminiComparisonNarrative | null> {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    const prompt = buildGeminiComparisonPrompt(ctx);
    const url = buildGeminiUrl(apiKey);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });
    if (!response.ok) {
      return null;
    }
    const payload: unknown = await response.json();
    const raw = extractTextFromGeminiPayload(payload);
    if (raw === null) {
      return null;
    }
    const trimmed = raw.trim().slice(0, GEMINI_WINNER_SUMMARY_MAX_CHARS);
    return { plainLanguageSummary: trimmed };
  } catch (error) {
    console.error(error);
    return null;
  }
}

function buildParkingZonePrompt(address: string): string {
  return [
    "You are a Zagreb parking zone classifier.",
    "Given a street address in Zagreb, Croatia, respond with ONLY the zone code.",
    "Valid responses: 1, 2, 3, 4.1, 4.2, none",
    "",
    "Zone 1 (monthly pass: 1051.20 EUR) streets:",
    PARKING_ZONE_1_STREETS.join(", "),
    "",
    "Zone 2 (monthly pass: 47.80 EUR) streets:",
    PARKING_ZONE_2_STREETS.join(", "),
    "",
    "Zone 3 (monthly pass: 17.00 EUR) streets:",
    PARKING_ZONE_3_STREETS.join(", "),
    "",
    "Zone 4.1 (monthly pass: 13.30 EUR):",
    PARKING_ZONE_4_1_STREETS.join(", "),
    "",
    "Zone 4.2 (monthly pass: 26.50 EUR):",
    PARKING_ZONE_4_2_STREETS.join(", "),
    "",
    'If the street is not in any list, respond "none".',
    "Do not explain. Reply with exactly one value: 1, 2, 3, 4.1, 4.2, or none.",
    "",
    `Address: ${address}`,
  ].join("\n");
}

function parseZoneCode(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  const match = PARKING_ZONE_VALID_CODES.find((code) => trimmed === code);
  return match ?? null;
}

export async function requestParkingZoneFromGemini(
  address: string,
): Promise<ParkingZoneLookupResult | null> {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    const prompt = buildParkingZonePrompt(address);
    const url = buildGeminiUrl(apiKey);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    });
    if (!response.ok) {
      return null;
    }
    const payload: unknown = await response.json();
    const raw = extractTextFromGeminiPayload(payload);
    if (raw === null) {
      return null;
    }
    const zoneCode = parseZoneCode(raw);
    return { zoneCode };
  } catch (error) {
    console.error(error);
    return null;
  }
}
