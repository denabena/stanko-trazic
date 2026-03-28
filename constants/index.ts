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
export const GEMINI_WINNER_SUMMARY_MAX_CHARS = 600;

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
