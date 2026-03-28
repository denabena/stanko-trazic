import { NextResponse } from "next/server";

import {
  PLACES_AUTOCOMPLETE_MAX_INPUT_LENGTH,
  PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH,
  PLACES_AUTOCOMPLETE_SESSION_TOKEN_MAX_LENGTH,
} from "@/constants/index";
import { requestPlacesAutocompleteSuggestions } from "@/lib/google-places";

function parsePlacesAutocompleteBody(body: unknown):
  | { ok: true; input: string; sessionToken?: string }
  | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const rawInput = (body as { input?: unknown }).input;
  if (typeof rawInput !== "string") {
    return { ok: false, error: "input is required" };
  }
  const input = rawInput.trim();
  if (input.length < PLACES_AUTOCOMPLETE_MIN_INPUT_LENGTH) {
    return { ok: false, error: "input is too short" };
  }
  if (input.length > PLACES_AUTOCOMPLETE_MAX_INPUT_LENGTH) {
    return { ok: false, error: "input is too long" };
  }
  const tokenRaw = (body as { sessionToken?: unknown }).sessionToken;
  if (tokenRaw === undefined || tokenRaw === null) {
    return { ok: true, input };
  }
  if (typeof tokenRaw !== "string") {
    return { ok: false, error: "sessionToken must be a string" };
  }
  const sessionToken = tokenRaw.trim();
  if (sessionToken.length === 0) {
    return { ok: true, input };
  }
  if (sessionToken.length > PLACES_AUTOCOMPLETE_SESSION_TOKEN_MAX_LENGTH) {
    return { ok: false, error: "sessionToken is too long" };
  }
  return { ok: true, input, sessionToken };
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = parsePlacesAutocompleteBody(json);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (typeof apiKey !== "string" || apiKey.length === 0) {
      return NextResponse.json(
        { error: "Places API is not configured" },
        { status: 500 },
      );
    }
    const suggestions = await requestPlacesAutocompleteSuggestions({
      input: parsed.input,
      sessionToken: parsed.sessionToken,
      apiKey,
    });
    if (suggestions === null) {
      return NextResponse.json(
        { error: "Could not load address suggestions" },
        { status: 502 },
      );
    }
    return NextResponse.json({ data: { suggestions } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
