import type { TransitMode } from "@/lib/types";

export function isTransitMode(value: unknown): value is TransitMode {
  return (
    value === "car" ||
    value === "tram_bus" ||
    value === "zagreb_bike" ||
    value === "walk"
  );
}

export function readFiniteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return value;
}

export function readNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
