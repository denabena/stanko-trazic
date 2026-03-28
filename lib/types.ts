/**
 * Shared contracts for StankoTrazic — real monthly apartment cost in Zagreb
 * (rent, utilities, commute, parking, neighborhood quality).
 */

export type ApartmentId = string;

export type TransitMode = "car" | "tram_bus" | "zagreb_bike" | "walk";

export type UserPriority =
  | "lowest_monthly_total"
  | "shortest_commute"
  | "best_neighborhood_quality";

export interface ApartmentCandidate {
  id: ApartmentId;
  addressLine: string;
  rentEurosPerMonth: number;
  squareMeters: number;
}

export interface WorkOrUniversityDestination {
  label: string;
  /** Resolved place ID or address string used for routing and storage */
  placeIdOrAddress: string;
}

export interface ApartmentEntryStepState {
  apartments: ApartmentCandidate[];
  destination: WorkOrUniversityDestination;
}

export interface TransitPriorityQuizAnswers {
  transitMode: TransitMode;
  priority: UserPriority;
}

export interface DirectionsRouteLeg {
  durationSeconds: number;
  distanceMeters: number;
}

/** Person B → Person C: raw route metrics from Directions (no €). */
export interface DirectionsCommuteMetrics {
  durationSeconds: number;
  distanceMeters: number;
  legs: DirectionsRouteLeg[];
}

/** Person B → Person C: raw nearby counts from Places (no score). */
export interface NeighborhoodPlaceCounts {
  shops: number;
  parks: number;
  pharmacies: number;
  cafes: number;
}

/** Person B → Person C: parking zone hint (€ from constants / calculators). */
export interface ParkingZoneLookupResult {
  zoneCode: string | null;
}

/** Person B: one row from Places Autocomplete (New), for address pickers. */
export interface PlacesAutocompleteSuggestion {
  placeId: string;
  /** Full line from Google (good fallback for Directions / display). */
  description: string;
  mainText: string;
  secondaryText: string;
}

/** Mapped commute result — not raw Google Directions JSON */
export interface CommuteCostEstimate {
  monthlyEuros: number;
  durationMinutes: number;
  legs: DirectionsRouteLeg[];
}

export interface ParkingZoneCostEstimate {
  zoneCode: string | null;
  monthlyEuros: number;
}

/** Utilities from Zagreb per-m² heuristics before bills exist */
export interface UtilitiesEstimate {
  monthlyEuros: number;
  appliedRateEurosPerSquareMeter: number;
}

/** Mapped Places nearby search — QoL building blocks */
export interface NeighborhoodQualityOfLifeEstimate {
  scoreOutOf100: number;
  shopsWithinRadius: number;
  parksWithinRadius: number;
  pharmaciesWithinRadius: number;
  cafesWithinRadius: number;
}

/** One row in the Step 4 comparison table */
export interface ApartmentMonthlyRealCostBreakdown {
  apartmentId: ApartmentId;
  rentEurosPerMonth: number;
  utilitiesEurosPerMonth: number;
  commuteEurosPerMonth: number;
  parkingEurosPerMonth: number;
  totalEurosPerMonth: number;
  commuteDurationMinutes: number;
  qualityOfLifeScoreOutOf100: number;
}

export interface ComparisonWinnerInsight {
  winnerApartmentId: ApartmentId;
  monthlyTotalDifferenceEuros: number;
  dailyCommuteMinutesSavedVersusRunnerUp: number;
  qualityOfLifeScoreDifferenceVersusRunnerUp: number;
}

export interface PersistedComparisonSession {
  apartmentEntry: ApartmentEntryStepState;
  quiz: TransitPriorityQuizAnswers;
  savedAtIso: string;
}

/** Optional Gemini copy for “why this won” narrative */
export interface GeminiComparisonNarrative {
  plainLanguageSummary: string;
}

/** Firestore document shape for a saved comparison (IDs only, no secrets) */
export interface FirestoreComparisonDocument {
  ownerUserId: string;
  apartmentEntry: ApartmentEntryStepState;
  quiz: TransitPriorityQuizAnswers;
  createdAtIso: string;
}
