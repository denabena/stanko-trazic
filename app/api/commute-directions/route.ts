import { NextResponse } from "next/server";

import {
  isTransitMode,
  readNonEmptyString,
} from "@/lib/api-request-guards";
import { requestDirectionsCommuteMetrics } from "@/lib/google-maps-directions";
import type { TransitMode } from "@/lib/types";

function parseCommuteDirectionsBody(
  body: unknown,
):
  | {
      ok: true;
      originAddress: string;
      destinationPlaceIdOrAddress: string;
      transitMode: TransitMode;
    }
  | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const originAddress = readNonEmptyString(
    (body as { originAddress?: unknown }).originAddress,
  );
  const destinationPlaceIdOrAddress = readNonEmptyString(
    (body as { destinationPlaceIdOrAddress?: unknown })
      .destinationPlaceIdOrAddress,
  );
  const transitMode = (body as { transitMode?: unknown }).transitMode;
  if (originAddress === null) {
    return { ok: false, error: "originAddress is required" };
  }
  if (destinationPlaceIdOrAddress === null) {
    return { ok: false, error: "destinationPlaceIdOrAddress is required" };
  }
  if (!isTransitMode(transitMode)) {
    return { ok: false, error: "transitMode is invalid" };
  }
  return {
    ok: true,
    originAddress,
    destinationPlaceIdOrAddress,
    transitMode,
  };
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = parseCommuteDirectionsBody(json);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const apiKey = process.env.GOOGLE_MAPS_DIRECTIONS_API_KEY;
    if (typeof apiKey !== "string" || apiKey.length === 0) {
      return NextResponse.json(
        { error: "Directions API is not configured" },
        { status: 500 },
      );
    }
    const metrics = await requestDirectionsCommuteMetrics(
      parsed.originAddress,
      parsed.destinationPlaceIdOrAddress,
      parsed.transitMode,
    );
    if (metrics === null) {
      return NextResponse.json(
        { error: "Could not compute commute route" },
        { status: 502 },
      );
    }
    return NextResponse.json({ data: metrics });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
