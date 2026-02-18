export type DurationDirection = "past" | "future";

export interface ParsedDuration {
  ms: number;
  direction: DurationDirection;
}

const UNIT_MS: Record<string, number> = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

function normalizeUnit(raw: string): keyof typeof UNIT_MS {
  return raw.toLowerCase().replace(/s$/, "") as keyof typeof UNIT_MS;
}

export function parseDuration(input: string): ParsedDuration {
  let text = input.trim().toLowerCase();
  if (!text) {
    throw new Error("Duration cannot be empty. Expected formats like '3 days' or '2 hours ago'.");
  }

  let direction: DurationDirection = "future";

  if (text.startsWith("in ")) {
    text = text.slice(3).trim();
    direction = "future";
  }

  if (text.endsWith(" ago")) {
    text = text.slice(0, -4).trim();
    direction = "past";
  } else if (text.endsWith(" from now")) {
    text = text.slice(0, -9).trim();
    direction = "future";
  }

  const match = text.match(/^(-?\d+(?:\.\d+)?)\s*(minutes?|hours?|days?|weeks?|months?)$/i);
  if (!match) {
    throw new Error("Invalid duration. Use forms like '3 days', 'in 2 hours', or '5 days ago'.");
  }

  let value = Number(match[1]);
  if (!Number.isFinite(value)) {
    throw new Error("Invalid duration value.");
  }

  const rawUnit = match[2];
  if (!rawUnit) {
    throw new Error("Invalid duration unit.");
  }
  const unit = normalizeUnit(rawUnit);
  const unitMs = UNIT_MS[unit];
  if (!unitMs) {
    throw new Error(`Unsupported duration unit '${rawUnit}'.`);
  }

  if (value < 0) {
    value = Math.abs(value);
    direction = "past";
  }

  return {
    ms: value * unitMs,
    direction,
  };
}
