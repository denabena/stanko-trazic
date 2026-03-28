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
