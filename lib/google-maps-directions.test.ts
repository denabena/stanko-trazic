import {
  DIRECTIONS_FALLBACK_ONE_WAY_DISTANCE_METERS,
  DIRECTIONS_FALLBACK_ONE_WAY_DURATION_SECONDS,
} from "@/constants/index";
import { describe, expect, it } from "vitest";

import {
  buildFallbackDirectionsCommuteMetrics,
  formatDirectionsQueryLocation,
} from "./google-maps-directions";

describe("formatDirectionsQueryLocation", () => {
  it("prefixes bare Google place IDs", () => {
    expect(
      formatDirectionsQueryLocation("ChIJhZX37-LXZUcR1hmlja4NgY0"),
    ).toBe("place_id:ChIJhZX37-LXZUcR1hmlja4NgY0");
  });

  it("leaves full addresses unchanged", () => {
    expect(formatDirectionsQueryLocation("Ilica 32, Zagreb, Hrvatska")).toBe(
      "Ilica 32, Zagreb, Hrvatska",
    );
  });

  it("normalizes existing place_id prefix (any case)", () => {
    expect(
      formatDirectionsQueryLocation("PLACE_ID:ChIJhZX37-LXZUcR1hmlja4NgY0"),
    ).toBe("place_id:ChIJhZX37-LXZUcR1hmlja4NgY0");
  });

  it("does not treat short tokens as place IDs", () => {
    expect(formatDirectionsQueryLocation("Zagreb")).toBe("Zagreb");
  });
});

describe("buildFallbackDirectionsCommuteMetrics", () => {
  it("returns one leg matching constants", () => {
    const m = buildFallbackDirectionsCommuteMetrics();
    expect(m.legs).toHaveLength(1);
    expect(m.durationSeconds).toBe(
      DIRECTIONS_FALLBACK_ONE_WAY_DURATION_SECONDS,
    );
    expect(m.distanceMeters).toBe(
      DIRECTIONS_FALLBACK_ONE_WAY_DISTANCE_METERS,
    );
    expect(m.legs[0]!.durationSeconds).toBe(m.durationSeconds);
    expect(m.legs[0]!.distanceMeters).toBe(m.distanceMeters);
  });
});
