import { NextResponse } from "next/server";

import {
  readFiniteNumber,
  readNonEmptyString,
} from "@/lib/api-request-guards";
import {
  requestParkingZoneLookup,
  resolveLatLngForPlacesRequest,
} from "@/lib/google-places";

type ParkingParsed =
  | { ok: true; kind: "coords"; latitude: number; longitude: number }
  | { ok: true; kind: "address"; address: string }
  | { ok: false; error: string };

function parseParkingBody(body: unknown): ParkingParsed {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const lat = readFiniteNumber((body as { latitude?: unknown }).latitude);
  const lng = readFiniteNumber((body as { longitude?: unknown }).longitude);
  if (lat !== null && lng !== null) {
    return { ok: true, kind: "coords", latitude: lat, longitude: lng };
  }
  const address = readNonEmptyString((body as { address?: unknown }).address);
  if (address !== null) {
    return { ok: true, kind: "address", address };
  }
  return {
    ok: false,
    error: "Provide latitude and longitude, or address",
  };
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = parseParkingBody(json);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (typeof apiKey !== "string" || apiKey.length === 0) {
      return NextResponse.json(
        { error: "Places API is not configured" },
        { status: 500 },
      );
    }
    let latitude: number;
    let longitude: number;
    if (parsed.kind === "coords") {
      latitude = parsed.latitude;
      longitude = parsed.longitude;
    } else {
      const resolved = await resolveLatLngForPlacesRequest({
        address: parsed.address,
        apiKey,
      });
      if (resolved === null) {
        return NextResponse.json(
          { error: "Could not resolve address to coordinates" },
          { status: 400 },
        );
      }
      latitude = resolved.lat;
      longitude = resolved.lng;
    }
    const zone = await requestParkingZoneLookup({
      latitude,
      longitude,
      apiKey,
    });
    if (zone === null) {
      return NextResponse.json(
        { error: "Could not resolve parking zone" },
        { status: 502 },
      );
    }
    return NextResponse.json({ data: zone });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
