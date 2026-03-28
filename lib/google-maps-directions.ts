import {
  DIRECTIONS_FALLBACK_ONE_WAY_DISTANCE_METERS,
  DIRECTIONS_FALLBACK_ONE_WAY_DURATION_SECONDS,
  GOOGLE_DIRECTIONS_JSON_BASE,
} from "@/constants/index";
import type {
  DirectionsCommuteMetrics,
  DirectionsRouteLeg,
  TransitMode,
} from "@/lib/types";

export function transitModeToGoogleDirectionsMode(
  mode: TransitMode,
): "driving" | "walking" | "bicycling" | "transit" {
  switch (mode) {
    case "car":
      return "driving";
    case "tram_bus":
      return "transit";
    case "zagreb_bike":
      return "bicycling";
    case "walk":
      return "walking";
  }
}

function mapDirectionsPayloadToMetrics(
  data: unknown,
): DirectionsCommuteMetrics | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }
  const status = (data as { status?: unknown }).status;
  if (status !== "OK") {
    return null;
  }
  const routes = (data as { routes?: unknown }).routes;
  if (!Array.isArray(routes) || routes.length === 0) {
    return null;
  }
  const first = routes[0];
  if (typeof first !== "object" || first === null) {
    return null;
  }
  const legsRaw = (first as { legs?: unknown }).legs;
  if (!Array.isArray(legsRaw)) {
    return null;
  }
  const legs: DirectionsRouteLeg[] = [];
  let durationSeconds = 0;
  let distanceMeters = 0;
  for (const leg of legsRaw) {
    if (typeof leg !== "object" || leg === null) {
      continue;
    }
    const durationValue = (leg as { duration?: { value?: unknown } }).duration
      ?.value;
    const distanceValue = (leg as { distance?: { value?: unknown } }).distance
      ?.value;
    if (typeof durationValue !== "number" || typeof distanceValue !== "number") {
      continue;
    }
    legs.push({
      durationSeconds: durationValue,
      distanceMeters: distanceValue,
    });
    durationSeconds += durationValue;
    distanceMeters += distanceValue;
  }
  if (legs.length === 0) {
    return null;
  }
  return { durationSeconds, distanceMeters, legs };
}

/**
 * Directions API requires place IDs as `place_id:ChIJ...`. Values from Places
 * Autocomplete are bare IDs; free-text addresses are passed through unchanged.
 */
export function formatDirectionsQueryLocation(value: string): string {
  const t = value.trim();
  if (t.length === 0) {
    return t;
  }
  const prefixed = t.match(/^place_id:(.*)$/i);
  if (prefixed) {
    return `place_id:${prefixed[1]!.trimStart()}`;
  }
  if (
    !/\s/.test(t) &&
    t.length >= 20 &&
    /^[A-Za-z0-9_-]+$/.test(t)
  ) {
    return `place_id:${t}`;
  }
  return t;
}

type GoogleDirectionsTravelMode =
  | "driving"
  | "walking"
  | "bicycling"
  | "transit";

export function buildFallbackDirectionsCommuteMetrics(): DirectionsCommuteMetrics {
  const durationSeconds = DIRECTIONS_FALLBACK_ONE_WAY_DURATION_SECONDS;
  const distanceMeters = DIRECTIONS_FALLBACK_ONE_WAY_DISTANCE_METERS;
  const leg: DirectionsRouteLeg = { durationSeconds, distanceMeters };
  return {
    durationSeconds,
    distanceMeters,
    legs: [leg],
  };
}

async function fetchDirectionsCommuteMetricsForMode(
  origin: string,
  destination: string,
  mode: GoogleDirectionsTravelMode,
  apiKey: string,
): Promise<DirectionsCommuteMetrics | null> {
  const params = new URLSearchParams({
    origin,
    destination,
    mode,
    key: apiKey,
  });
  if (mode === "transit") {
    params.set("departure_time", String(Math.floor(Date.now() / 1000)));
  }
  const url = `${GOOGLE_DIRECTIONS_JSON_BASE}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  const payload: unknown = await response.json();
  return mapDirectionsPayloadToMetrics(payload);
}

export async function requestDirectionsCommuteMetrics(
  originAddress: string,
  destinationPlaceIdOrAddress: string,
  transitMode: TransitMode,
): Promise<DirectionsCommuteMetrics | null> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_DIRECTIONS_API_KEY;
    const origin = formatDirectionsQueryLocation(originAddress);
    const destination = formatDirectionsQueryLocation(
      destinationPlaceIdOrAddress,
    );
    if (!apiKey || origin.length === 0 || destination.length === 0) {
      return null;
    }

    const primaryMode = transitModeToGoogleDirectionsMode(transitMode);
    let metrics = await fetchDirectionsCommuteMetricsForMode(
      origin,
      destination,
      primaryMode,
      apiKey,
    );

    if (metrics === null && transitMode === "zagreb_bike") {
      metrics = await fetchDirectionsCommuteMetricsForMode(
        origin,
        destination,
        "walking",
        apiKey,
      );
    }

    if (metrics === null) {
      console.warn(
        "[directions] using synthetic fallback (no OK route or HTTP error)",
        {
          transitMode,
          triedBikeThenWalk: transitMode === "zagreb_bike",
        },
      );
      return buildFallbackDirectionsCommuteMetrics();
    }

    return metrics;
  } catch (error) {
    console.error(error);
    console.warn("[directions] using synthetic fallback after exception");
    return buildFallbackDirectionsCommuteMetrics();
  }
}
