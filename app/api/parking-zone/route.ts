import { NextResponse } from "next/server";

import { readNonEmptyString } from "@/lib/api-request-guards";
import { requestParkingZoneFromGemini } from "@/lib/google-gemini";

function parseParkingBody(
  body: unknown,
): { ok: true; address: string } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Body must be a JSON object" };
  }
  const address = readNonEmptyString((body as { address?: unknown }).address);
  if (address === null) {
    return { ok: false, error: "address is required" };
  }
  return { ok: true, address };
}

export async function POST(request: Request) {
  try {
    const json: unknown = await request.json();
    const parsed = parseParkingBody(json);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const zone = await requestParkingZoneFromGemini(parsed.address);
    if (zone === null) {
      return NextResponse.json(
        { error: "Could not resolve parking zone" },
        { status: 502 },
      );
    }
    return NextResponse.json({ data: zone });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}
