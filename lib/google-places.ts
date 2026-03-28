import {
  GEOCODE_COUNTRY_COMPONENT,
  GOOGLE_GEOCODE_JSON_BASE,
  GOOGLE_PLACES_AUTOCOMPLETE_URL,
  GOOGLE_PLACES_SEARCH_NEARBY_URL,
  NEIGHBORHOOD_CAFE_PLACE_TYPES,
  NEIGHBORHOOD_NEARBY_MAX_RESULT_COUNT,
  NEIGHBORHOOD_PARK_PLACE_TYPES,
  NEIGHBORHOOD_PHARMACY_PLACE_TYPES,
  NEIGHBORHOOD_QUALITY_SEARCH_RADIUS_METERS,
  NEIGHBORHOOD_SHOP_PLACE_TYPES,
  PLACES_AUTOCOMPLETE_FIELD_MASK,
  PLACES_AUTOCOMPLETE_LANGUAGE_CODE,
  PLACES_AUTOCOMPLETE_REGION_CODES,
  PLACES_NEARBY_FIELD_MASK,
  ZAGREB_AUTOCOMPLETE_BIAS_RADIUS_METERS,
  ZAGREB_AUTOCOMPLETE_CENTER_LATITUDE,
  ZAGREB_AUTOCOMPLETE_CENTER_LONGITUDE,
  ZAGREB_SUBLOCALITY_TO_PARKING_ZONE,
} from "@/constants/index";
import type {
  NeighborhoodPlaceCounts,
  ParkingZoneLookupResult,
  PlacesAutocompleteSuggestion,
} from "@/lib/types";

function readGeocodeLocation(
  data: unknown,
): { lat: number; lng: number } | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }
  if ((data as { status?: unknown }).status !== "OK") {
    return null;
  }
  const results = (data as { results?: unknown }).results;
  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }
  const first = results[0];
  if (typeof first !== "object" || first === null) {
    return null;
  }
  const geometry = (first as { geometry?: { location?: unknown } }).geometry;
  if (typeof geometry !== "object" || geometry === null) {
    return null;
  }
  const loc = geometry.location;
  if (typeof loc !== "object" || loc === null) {
    return null;
  }
  const lat = (loc as { lat?: unknown }).lat;
  const lng = (loc as { lng?: unknown }).lng;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }
  return { lat, lng };
}

export async function geocodeAddressToLatLng(
  address: string,
  apiKey: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const trimmed = address.trim();
    if (trimmed.length === 0) {
      return null;
    }
    const params = new URLSearchParams({
      address: trimmed,
      key: apiKey,
    });
    params.set("components", GEOCODE_COUNTRY_COMPONENT);
    const url = `${GOOGLE_GEOCODE_JSON_BASE}?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const payload: unknown = await response.json();
    return readGeocodeLocation(payload);
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function reverseGeocodePayload(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<unknown | null> {
  const params = new URLSearchParams({
    latlng: `${lat},${lng}`,
    key: apiKey,
    language: "en",
  });
  const url = `${GOOGLE_GEOCODE_JSON_BASE}?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

function countPlacesInNearbyResponse(data: unknown): number {
  if (typeof data !== "object" || data === null) {
    return 0;
  }
  const places = (data as { places?: unknown }).places;
  if (!Array.isArray(places)) {
    return 0;
  }
  return places.length;
}

async function searchNearbyTypeCount(params: {
  lat: number;
  lng: number;
  radiusMeters: number;
  includedTypes: readonly string[];
  apiKey: string;
}): Promise<number | null> {
  try {
    const body = {
      includedTypes: [...params.includedTypes],
      maxResultCount: NEIGHBORHOOD_NEARBY_MAX_RESULT_COUNT,
      locationRestriction: {
        circle: {
          center: { latitude: params.lat, longitude: params.lng },
          radius: params.radiusMeters,
        },
      },
    };
    const response = await fetch(GOOGLE_PLACES_SEARCH_NEARBY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": params.apiKey,
        "X-Goog-FieldMask": PLACES_NEARBY_FIELD_MASK,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return null;
    }
    const payload: unknown = await response.json();
    return countPlacesInNearbyResponse(payload);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function requestNeighborhoodPlaceCounts(params: {
  latitude: number;
  longitude: number;
  apiKey: string;
}): Promise<NeighborhoodPlaceCounts | null> {
  try {
    const { latitude, longitude, apiKey } = params;
    const radius = NEIGHBORHOOD_QUALITY_SEARCH_RADIUS_METERS;
    const shops = await searchNearbyTypeCount({
      lat: latitude,
      lng: longitude,
      radiusMeters: radius,
      includedTypes: NEIGHBORHOOD_SHOP_PLACE_TYPES,
      apiKey,
    });
    const parks = await searchNearbyTypeCount({
      lat: latitude,
      lng: longitude,
      radiusMeters: radius,
      includedTypes: NEIGHBORHOOD_PARK_PLACE_TYPES,
      apiKey,
    });
    const pharmacies = await searchNearbyTypeCount({
      lat: latitude,
      lng: longitude,
      radiusMeters: radius,
      includedTypes: NEIGHBORHOOD_PHARMACY_PLACE_TYPES,
      apiKey,
    });
    const cafes = await searchNearbyTypeCount({
      lat: latitude,
      lng: longitude,
      radiusMeters: radius,
      includedTypes: NEIGHBORHOOD_CAFE_PLACE_TYPES,
      apiKey,
    });
    if (
      shops === null ||
      parks === null ||
      pharmacies === null ||
      cafes === null
    ) {
      return null;
    }
    return { shops, parks, pharmacies, cafes };
  } catch (error) {
    console.error(error);
    return null;
  }
}

function resolveZoneFromGeocodeResult(data: unknown): string | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }
  if ((data as { status?: unknown }).status !== "OK") {
    return null;
  }
  const results = (data as { results?: unknown }).results;
  if (!Array.isArray(results) || results.length === 0) {
    return null;
  }
  const first = results[0];
  if (typeof first !== "object" || first === null) {
    return null;
  }
  const components = (first as { address_components?: unknown })
    .address_components;
  if (!Array.isArray(components)) {
    return null;
  }
  for (const component of components) {
    if (typeof component !== "object" || component === null) {
      continue;
    }
    const types = (component as { types?: unknown }).types;
    const longName = (component as { long_name?: unknown }).long_name;
    if (!Array.isArray(types) || typeof longName !== "string") {
      continue;
    }
    const isArea = types.some(
      (t) =>
        t === "neighborhood" ||
        t === "sublocality" ||
        t === "sublocality_level_1",
    );
    if (!isArea) {
      continue;
    }
    const key = longName.trim().toLowerCase();
    const zone = ZAGREB_SUBLOCALITY_TO_PARKING_ZONE[key];
    if (typeof zone === "string" && zone.length > 0) {
      return zone;
    }
  }
  return null;
}

export async function requestParkingZoneLookup(params: {
  latitude: number;
  longitude: number;
  apiKey: string;
}): Promise<ParkingZoneLookupResult | null> {
  try {
    const payload = await reverseGeocodePayload(
      params.latitude,
      params.longitude,
      params.apiKey,
    );
    if (payload === null) {
      return null;
    }
    const zoneCode = resolveZoneFromGeocodeResult(payload);
    return { zoneCode };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function resolveLatLngForPlacesRequest(params: {
  latitude?: number;
  longitude?: number;
  address?: string;
  apiKey: string;
}): Promise<{ lat: number; lng: number } | null> {
  try {
    const lat = params.latitude;
    const lng = params.longitude;
    if (typeof lat === "number" && typeof lng === "number") {
      return { lat, lng };
    }
    if (typeof params.address === "string") {
      return geocodeAddressToLatLng(params.address, params.apiKey);
    }
    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function readGoogleAutocompleteText(node: unknown): string {
  if (typeof node !== "object" || node === null) {
    return "";
  }
  const text = (node as { text?: unknown }).text;
  return typeof text === "string" ? text : "";
}

function mapPlacePredictionToSuggestion(
  prediction: unknown,
): PlacesAutocompleteSuggestion | null {
  if (typeof prediction !== "object" || prediction === null) {
    return null;
  }
  const placeId = (prediction as { placeId?: unknown }).placeId;
  if (typeof placeId !== "string" || placeId.length === 0) {
    return null;
  }
  const fullText = readGoogleAutocompleteText(
    (prediction as { text?: unknown }).text,
  );
  const structured = (prediction as { structuredFormat?: unknown })
    .structuredFormat;
  let mainText = "";
  let secondaryText = "";
  if (typeof structured === "object" && structured !== null) {
    mainText = readGoogleAutocompleteText(
      (structured as { mainText?: unknown }).mainText,
    );
    secondaryText = readGoogleAutocompleteText(
      (structured as { secondaryText?: unknown }).secondaryText,
    );
  }
  if (mainText.length === 0) {
    mainText = fullText;
  }
  const description =
    fullText.length > 0
      ? fullText
      : [mainText, secondaryText].filter((s) => s.length > 0).join(", ");
  return { placeId, description, mainText, secondaryText };
}

function parseAutocompleteSuggestionsPayload(
  data: unknown,
): PlacesAutocompleteSuggestion[] {
  if (typeof data !== "object" || data === null) {
    return [];
  }
  const suggestions = (data as { suggestions?: unknown }).suggestions;
  if (!Array.isArray(suggestions)) {
    return [];
  }
  const out: PlacesAutocompleteSuggestion[] = [];
  for (const item of suggestions) {
    if (typeof item !== "object" || item === null) {
      continue;
    }
    const placePrediction = (item as { placePrediction?: unknown })
      .placePrediction;
    if (placePrediction === undefined) {
      continue;
    }
    const mapped = mapPlacePredictionToSuggestion(placePrediction);
    if (mapped !== null) {
      out.push(mapped);
    }
  }
  return out;
}

export async function requestPlacesAutocompleteSuggestions(params: {
  input: string;
  sessionToken?: string;
  apiKey: string;
}): Promise<PlacesAutocompleteSuggestion[] | null> {
  try {
    const body: Record<string, unknown> = {
      input: params.input,
      includedRegionCodes: [...PLACES_AUTOCOMPLETE_REGION_CODES],
      languageCode: PLACES_AUTOCOMPLETE_LANGUAGE_CODE,
      locationBias: {
        circle: {
          center: {
            latitude: ZAGREB_AUTOCOMPLETE_CENTER_LATITUDE,
            longitude: ZAGREB_AUTOCOMPLETE_CENTER_LONGITUDE,
          },
          radius: ZAGREB_AUTOCOMPLETE_BIAS_RADIUS_METERS,
        },
      },
    };
    if (
      typeof params.sessionToken === "string" &&
      params.sessionToken.length > 0
    ) {
      body.sessionToken = params.sessionToken;
    }
    const response = await fetch(GOOGLE_PLACES_AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": params.apiKey,
        "X-Goog-FieldMask": PLACES_AUTOCOMPLETE_FIELD_MASK,
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      return null;
    }
    const payload: unknown = await response.json();
    return parseAutocompleteSuggestionsPayload(payload);
  } catch (error) {
    console.error(error);
    return null;
  }
}
