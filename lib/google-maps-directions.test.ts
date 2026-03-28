import { describe, expect, it } from "vitest";

import { formatDirectionsQueryLocation } from "./google-maps-directions";

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
