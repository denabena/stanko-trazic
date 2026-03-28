/**
 * Person B — smoke tests for Next.js API routes.
 *
 * Usage:
 *   1. `npm run build && npm run start` (or `npm run dev`) on port 3000
 *   2. `npm run test:api` — validation-only (400 responses), no Google keys required
 *   3. `STANKO_API_LIVE=1 npm run test:api` — optional live calls (needs .env.local keys + billing)
 *
 * Optional: `STANKO_API_BASE_URL=http://127.0.0.1:3000`
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) {
    return;
  }
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvLocal();

const baseUrl =
  process.env.STANKO_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:3000";
const live = process.env.STANKO_API_LIVE === "1";

let failures = 0;

async function postJson(pathname, body) {
  const res = await fetch(`${baseUrl}${pathname}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let json;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

function fail(message) {
  failures += 1;
  console.error(`FAIL: ${message}`);
}

function pass(message) {
  console.log(`ok: ${message}`);
}

async function runValidationSuite() {
  const cases = [
    {
      name: "commute-directions rejects empty body",
      path: "/api/commute-directions",
      body: {},
      expectStatus: 400,
    },
    {
      name: "neighborhood-quality-of-life rejects empty body",
      path: "/api/neighborhood-quality-of-life",
      body: {},
      expectStatus: 400,
    },
    {
      name: "parking-zone rejects empty body",
      path: "/api/parking-zone",
      body: {},
      expectStatus: 400,
    },
    {
      name: "gemini-comparison-summary rejects empty body",
      path: "/api/gemini-comparison-summary",
      body: {},
      expectStatus: 400,
    },
    {
      name: "places-autocomplete rejects empty body",
      path: "/api/places-autocomplete",
      body: {},
      expectStatus: 400,
    },
    {
      name: "places-autocomplete rejects too-short input",
      path: "/api/places-autocomplete",
      body: { input: "a" },
      expectStatus: 400,
    },
    {
      name: "commute-directions rejects invalid transitMode",
      path: "/api/commute-directions",
      body: {
        originAddress: "Ilica 1, Zagreb",
        destinationPlaceIdOrAddress: "University of Zagreb",
        transitMode: "spaceship",
      },
      expectStatus: 400,
    },
  ];

  for (const c of cases) {
    const { status, json } = await postJson(c.path, c.body);
    if (status !== c.expectStatus) {
      fail(
        `${c.name}: expected status ${c.expectStatus}, got ${status} body=${JSON.stringify(json)}`,
      );
      if (status === 500 && c.expectStatus === 400) {
        console.error(
          "  hint: restart `npm run dev` or run `npm run build && npm run start` so routes match the repo (stale dev can 500).",
        );
      }
      continue;
    }
    if (
      typeof json !== "object" ||
      json === null ||
      typeof json.error !== "string"
    ) {
      fail(`${c.name}: expected JSON { error: string }, got ${JSON.stringify(json)}`);
      continue;
    }
    pass(c.name);
  }
}

async function runLiveSuite() {
  const directionsKey = process.env.GOOGLE_MAPS_DIRECTIONS_API_KEY;
  const placesKey = process.env.GOOGLE_PLACES_API_KEY;
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (
    typeof directionsKey === "string" &&
    directionsKey.length > 0 &&
    !directionsKey.includes("your_key")
  ) {
    const { status, json } = await postJson("/api/commute-directions", {
      originAddress: "Trg bana Josipa Jelačića 1, Zagreb",
      destinationPlaceIdOrAddress: "Fakultet elektrotehnike i računarstva, Zagreb",
      transitMode: "walk",
    });
    if (status !== 200 || json === null || !("data" in json)) {
      fail(
        `live commute-directions: expected 200 + data, got ${status} ${JSON.stringify(json)}`,
      );
    } else {
      const d = json.data;
      if (
        typeof d?.durationSeconds !== "number" ||
        typeof d?.distanceMeters !== "number" ||
        !Array.isArray(d?.legs)
      ) {
        fail(`live commute-directions: bad data shape ${JSON.stringify(d)}`);
      } else {
        pass("live commute-directions returns DirectionsCommuteMetrics");
      }
    }
  } else {
    console.log("skip: live commute (GOOGLE_MAPS_DIRECTIONS_API_KEY not set)");
  }

  if (
    typeof placesKey === "string" &&
    placesKey.length > 0 &&
    !placesKey.includes("your_key")
  ) {
    const coords = { latitude: 45.8131, longitude: 15.9775 };
    const nRes = await postJson("/api/neighborhood-quality-of-life", coords);
    if (nRes.status !== 200 || nRes.json === null || !("data" in nRes.json)) {
      fail(
        `live neighborhood-quality-of-life: expected 200 + data, got ${nRes.status} ${JSON.stringify(nRes.json)}`,
      );
    } else {
      const d = nRes.json.data;
      if (
        typeof d?.shops !== "number" ||
        typeof d?.parks !== "number" ||
        typeof d?.pharmacies !== "number" ||
        typeof d?.cafes !== "number"
      ) {
        fail(
          `live neighborhood-quality-of-life: bad shape ${JSON.stringify(d)}`,
        );
      } else {
        pass("live neighborhood-quality-of-life returns NeighborhoodPlaceCounts");
      }
    }

    const pRes = await postJson("/api/parking-zone", coords);
    if (pRes.status !== 200 || pRes.json === null || !("data" in pRes.json)) {
      fail(
        `live parking-zone: expected 200 + data, got ${pRes.status} ${JSON.stringify(pRes.json)}`,
      );
    } else if (
      !(
        "zoneCode" in pRes.json.data &&
        (pRes.json.data.zoneCode === null ||
          typeof pRes.json.data.zoneCode === "string")
      )
    ) {
      fail(`live parking-zone: bad shape ${JSON.stringify(pRes.json.data)}`);
    } else {
      pass("live parking-zone returns ParkingZoneLookupResult");
    }

    const acRes = await postJson("/api/places-autocomplete", {
      input: "Ilica zag",
    });
    if (acRes.status !== 200 || acRes.json === null || !("data" in acRes.json)) {
      fail(
        `live places-autocomplete: expected 200 + data, got ${acRes.status} ${JSON.stringify(acRes.json)}`,
      );
    } else {
      const list = acRes.json.data?.suggestions;
      if (!Array.isArray(list) || list.length === 0) {
        fail(
          `live places-autocomplete: expected non-empty suggestions ${JSON.stringify(acRes.json.data)}`,
        );
      } else {
        const first = list[0];
        if (
          typeof first?.placeId !== "string" ||
          typeof first?.description !== "string" ||
          typeof first?.mainText !== "string" ||
          typeof first?.secondaryText !== "string"
        ) {
          fail(
            `live places-autocomplete: bad suggestion shape ${JSON.stringify(first)}`,
          );
        } else {
          pass("live places-autocomplete returns PlacesAutocompleteSuggestion[]");
        }
      }
    }
  } else {
    console.log("skip: live Places routes (GOOGLE_PLACES_API_KEY not set)");
  }

  if (
    typeof geminiKey === "string" &&
    geminiKey.length > 0 &&
    !geminiKey.includes("your_key")
  ) {
    const { status, json } = await postJson("/api/gemini-comparison-summary", {
      priority: "lowest_monthly_total",
      apartments: [
        {
          addressLine: "Ilica 1, Zagreb",
          rentEurosPerMonth: 550,
          utilitiesEurosPerMonth: 40,
          commuteEurosPerMonth: 30,
          parkingEurosPerMonth: 0,
          totalEurosPerMonth: 620,
          commuteDurationMinutes: 25,
          qualityOfLifeScoreOutOf100: 80,
        },
        {
          addressLine: "Trg bana Jelačića 2, Zagreb",
          rentEurosPerMonth: 620,
          utilitiesEurosPerMonth: 42,
          commuteEurosPerMonth: 20,
          parkingEurosPerMonth: 0,
          totalEurosPerMonth: 682,
          commuteDurationMinutes: 18,
          qualityOfLifeScoreOutOf100: 88,
        },
      ],
      winnerAddress: "Ilica 1, Zagreb",
      runnerUpAddress: "Trg bana Jelačića 2, Zagreb",
      monthlyTotalDifferenceEuros: 62,
      dailyCommuteMinutesSavedVersusRunnerUp: -7,
      qualityOfLifeScoreDifferenceVersusRunnerUp: -8,
    });
    if (status !== 200 || json === null || !("data" in json)) {
      fail(
        `live gemini-comparison-summary: expected 200 + data, got ${status} ${JSON.stringify(json)}`,
      );
    } else if (typeof json.data?.plainLanguageSummary !== "string") {
      fail(`live gemini: bad shape ${JSON.stringify(json.data)}`);
    } else {
      pass("live gemini-comparison-summary returns GeminiComparisonNarrative");
    }
  } else {
    console.log("skip: live Gemini (GOOGLE_GEMINI_API_KEY not set)");
  }
}

async function main() {
  console.log(`Person B API smoke — baseUrl=${baseUrl} live=${live}`);
  try {
    await fetch(`${baseUrl}/`);
  } catch {
    console.error(
      "Cannot reach Next.js server. Start with: npm run build && npm run start",
    );
    process.exit(1);
  }

  await runValidationSuite();

  if (live) {
    await runLiveSuite();
  } else {
    console.log(
      "Live Google tests skipped (set STANKO_API_LIVE=1 and valid .env.local to run them).",
    );
  }

  if (failures > 0) {
    console.error(`\n${failures} test(s) failed`);
    process.exit(1);
  }
  console.log("\nAll executed tests passed.");
}

main();
