/**
 * App-wide limits, Zagreb defaults, and integration tuning — single source of truth.
 */

/** Step 1: user must enter between 2 and 3 candidate apartments */
export const MIN_APARTMENT_CANDIDATES = 2;
export const MAX_APARTMENT_CANDIDATES = 3;

/** Rough utilities when user has no bills yet — €/m²/month (placeholder heuristic) */
export const ZAGREB_DEFAULT_UTILITIES_EUROS_PER_SQUARE_METER_MONTH = 0.85;

/** Places API radial search for QoL amenities */
export const NEIGHBORHOOD_QUALITY_SEARCH_RADIUS_METERS = 800;

/** Max extra narrative length from Gemini (chars) */
export const GEMINI_WINNER_SUMMARY_MAX_CHARS = 2000;

/** localStorage key for cross-step wizard state */
export const LOCAL_STORAGE_COMPARISON_SESSION_KEY = "stanko-trazic-comparison-session";

/** Firestore collection name for saved comparisons */
export const FIRESTORE_COMPARISONS_COLLECTION = "zagreb-apartment-comparisons";

/** ZET monthly pass placeholder when transit is tram/bus (€/month) */
export const ZAGREB_ZET_MONTHLY_PASS_EUROS = 30;

/** Zagreb public bike (bajs) seasonal pass placeholder (€/month averaged) */
export const ZAGREB_BIKE_MONTHLY_EQUIVALENT_EUROS = 5;

/** Default fuel cost per km when driving (€) — zone/refinement later */
export const DEFAULT_FUEL_COST_EUROS_PER_KM = 0.12;

/** Google Directions API (legacy JSON) */
export const GOOGLE_DIRECTIONS_JSON_BASE =
  "https://maps.googleapis.com/maps/api/directions/json";

/** Google Geocoding API (JSON) — same key as Places/Directions when APIs enabled */
export const GOOGLE_GEOCODE_JSON_BASE =
  "https://maps.googleapis.com/maps/api/geocode/json";

/** Bias geocoding to Croatia for Zagreb-centric flows */
export const GEOCODE_COUNTRY_COMPONENT = "country:HR";

/** Places API (New) — nearby search */
export const GOOGLE_PLACES_SEARCH_NEARBY_URL =
  "https://places.googleapis.com/v1/places:searchNearby";

/** Places API (New) — autocomplete (server proxy for Person A) */
export const GOOGLE_PLACES_AUTOCOMPLETE_URL =
  "https://places.googleapis.com/v1/places:autocomplete";

/**
 * Field mask for autocomplete — no spaces (Google requirement).
 * @see https://developers.google.com/maps/documentation/places/web-service/place-autocomplete
 */
export const PLACES_AUTOCOMPLETE_FIELD_MASK =
  "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat";

/** Bias suggestions toward Zagreb / NW Croatia */
export const ZAGREB_AUTOCOMPLETE_CENTER_LATITUDE = 45.815;
export const ZAGREB_AUTOCOMPLETE_CENTER_LONGITUDE = 15.9819;
export const ZAGREB_AUTOCOMPLETE_BIAS_RADIUS_METERS = 50000;

export const PLACES_AUTOCOMPLETE_REGION_CODES = ["hr"] as const;

export const PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH = 2;
export const PLACES_AUTOCOMPLETE_MAX_INPUT_LENGTH = 200;

/** IETF BCP-47 language for autocomplete labels */
export const PLACES_AUTOCOMPLETE_LANGUAGE_CODE = "hr";

/** Google session token max length (UUID hex is typical) */
export const PLACES_AUTOCOMPLETE_SESSION_TOKEN_MAX_LENGTH = 128;

/** Cap per category for Places nearby (API max 20) */
export const NEIGHBORHOOD_NEARBY_MAX_RESULT_COUNT = 20;

/** Field mask for nearby: ids only (minimize payload) */
export const PLACES_NEARBY_FIELD_MASK = "places.id";

/** Included types for “shops” bucket (Places type enums) */
export const NEIGHBORHOOD_SHOP_PLACE_TYPES = [
  "supermarket",
  "convenience_store",
  "store",
  "shopping_mall",
] as const;

export const NEIGHBORHOOD_PARK_PLACE_TYPES = ["park"] as const;

export const NEIGHBORHOOD_PHARMACY_PLACE_TYPES = ["pharmacy"] as const;

export const NEIGHBORHOOD_CAFE_PLACE_TYPES = ["cafe", "coffee_shop"] as const;

/**
 * Optional: map Geocoding sublocality/neighborhood long_name (lowercase) → zone code.
 * Extend as you validate Zagreb labels; unknown → null zone in API response.
 */
export const ZAGREB_SUBLOCALITY_TO_PARKING_ZONE: Readonly<
  Record<string, string>
> = {
  "donji grad": "1",
  "gornji grad - medveščak": "1",
  maksimir: "2",
  trešnjevka: "2",
  tresnjevka: "2",
  "trešnjevka - sjever": "2",
  "trešnjevka - jug": "2",
  "tresnjevka - sjever": "2",
  "tresnjevka - jug": "2",
};

/** Gemini model id for REST generateContent (AI Studio; avoid deprecated 2.0-flash for new keys) */
export const GEMINI_GENERATE_CONTENT_MODEL = "gemini-2.5-flash";

/** Gemini REST API base (v1beta) */
export const GEMINI_REST_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";
/** Average working days per month for commute cost projection */
export const WORKING_DAYS_PER_MONTH = 22;

/** One-way trips per working day (home → work, work → home) */
export const COMMUTE_ROUND_TRIPS_PER_DAY = 2;

/** Zagreb parking zone monthly pass prices (€) — approximate commuter rates */
export const PARKING_ZONE_MONTHLY_EUROS: Record<string, number> = {
  "1": 66,
  "2": 40,
  "3": 26,
};

/** Fallback when apartment is outside any paid parking zone */
export const PARKING_NO_ZONE_DEFAULT_EUROS = 0;

/** QoL scoring weights per amenity category (relative importance) */
export const QOL_WEIGHT_SHOPS = 3;
export const QOL_WEIGHT_PARKS = 4;
export const QOL_WEIGHT_PHARMACIES = 2;
export const QOL_WEIGHT_CAFES = 1;

/** Count at which an amenity category is considered fully saturated */
export const QOL_SATURATION_COUNT = 10;
