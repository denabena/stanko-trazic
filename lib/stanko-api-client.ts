import type {
  DirectionsCommuteMetrics,
  GeminiComparisonNarrative,
  NeighborhoodPlaceCounts,
  ParkingZoneLookupResult,
  PlacesAutocompleteSuggestion,
  TransitMode,
} from "@/lib/types";

type Ok<T> = { ok: true; data: T };
type Fail = { ok: false; error: string };

function parseOkData<T>(json: unknown): Ok<T> | Fail {
  if (typeof json !== "object" || json === null) {
    return { ok: false, error: "Invalid response" };
  }
  if ("data" in json) {
    return { ok: true, data: (json as { data: T }).data };
  }
  if ("error" in json && typeof (json as { error: unknown }).error === "string") {
    return { ok: false, error: (json as { error: string }).error };
  }
  return { ok: false, error: "Unknown error" };
}

export async function postCommuteDirections(body: {
  originAddress: string;
  destinationPlaceIdOrAddress: string;
  transitMode: TransitMode;
}): Promise<Ok<DirectionsCommuteMetrics> | Fail> {
  try {
    const res = await fetch("/api/commute-directions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json: unknown = await res.json();
    return parseOkData<DirectionsCommuteMetrics>(json);
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Network error" };
  }
}

export async function postNeighborhoodQuality(body: {
  address?: string;
  latitude?: number;
  longitude?: number;
}): Promise<Ok<NeighborhoodPlaceCounts> | Fail> {
  try {
    const res = await fetch("/api/neighborhood-quality-of-life", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json: unknown = await res.json();
    return parseOkData<NeighborhoodPlaceCounts>(json);
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Network error" };
  }
}

export async function postParkingZone(body: {
  address?: string;
  latitude?: number;
  longitude?: number;
}): Promise<Ok<ParkingZoneLookupResult> | Fail> {
  try {
    const res = await fetch("/api/parking-zone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json: unknown = await res.json();
    return parseOkData<ParkingZoneLookupResult>(json);
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Network error" };
  }
}

export async function postPlacesAutocomplete(body: {
  input: string;
  sessionToken?: string;
}): Promise<Ok<{ suggestions: PlacesAutocompleteSuggestion[] }> | Fail> {
  try {
    const res = await fetch("/api/places-autocomplete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json: unknown = await res.json();
    return parseOkData<{ suggestions: PlacesAutocompleteSuggestion[] }>(json);
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Network error" };
  }
}

export async function postGeminiComparisonSummary(body: {
  rowsDescription: string;
  winnerHint: string;
}): Promise<Ok<GeminiComparisonNarrative> | Fail> {
  try {
    const res = await fetch("/api/gemini-comparison-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json: unknown = await res.json();
    return parseOkData<GeminiComparisonNarrative>(json);
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Network error" };
  }
}
