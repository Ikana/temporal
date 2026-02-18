import type { Event, Sequence, Span, TimeContext } from "../types";
import { buildNow } from "./time";

interface ParseOptions {
  warn?: (message: string) => void;
}

function splitRow(row: string): string[] {
  const cols = row.split("|").map((part) => part.trim());
  return cols.slice(1, -1);
}

function sectionBounds(lines: string[], heading: string): [number, number] | null {
  const startHeadingIndex = lines.findIndex((line) => line.trim() === heading);
  if (startHeadingIndex === -1) {
    return null;
  }

  let end = lines.length;
  for (let i = startHeadingIndex + 1; i < lines.length; i += 1) {
    const line = lines[i] ?? "";
    if (line.trim().startsWith("## ")) {
      end = i;
      break;
    }
  }

  return [startHeadingIndex + 1, end];
}

function subsectionBounds(lines: string[], heading: string): [number, number] | null {
  const startHeadingIndex = lines.findIndex((line) => line.trim() === heading);
  if (startHeadingIndex === -1) {
    return null;
  }

  let end = lines.length;
  for (let i = startHeadingIndex + 1; i < lines.length; i += 1) {
    const trimmed = (lines[i] ?? "").trim();
    if (trimmed.startsWith("### ") || trimmed.startsWith("## ")) {
      end = i;
      break;
    }
  }

  return [startHeadingIndex + 1, end];
}

function parseEventTable(rows: string[], warn: (message: string) => void, label: string): Event[] {
  const tableRows = rows.filter((line) => line.trim().startsWith("|"));
  if (tableRows.length < 2) {
    return [];
  }

  const events: Event[] = [];
  for (const row of tableRows.slice(2)) {
    const cols = splitRow(row);
    if (cols.length < 5) {
      warn(`Skipping malformed ${label} row: ${row}`);
      continue;
    }

    const [distance, name, type, notes, iso] = cols;
    if (!name) {
      warn(`Skipping ${label} row with empty event name.`);
      continue;
    }

    events.push({
      distance: distance ?? "",
      name,
      type: type || undefined,
      notes: notes || undefined,
      iso: iso ?? "",
    });
  }

  return events;
}

function parseSequences(lines: string[], bounds: [number, number] | null, warn: (message: string) => void): Sequence[] {
  if (!bounds) {
    return [];
  }

  const [start, end] = bounds;
  const sequences: Sequence[] = [];

  for (let i = start; i < end; i += 1) {
    const trimmed = (lines[i] ?? "").trim();
    if (!trimmed.startsWith("### ")) {
      continue;
    }

    const name = trimmed.slice(4).trim();
    let chainLine = "";
    for (let j = i + 1; j < end; j += 1) {
      const candidate = (lines[j] ?? "").trim();
      if (!candidate) {
        continue;
      }
      if (candidate.startsWith("### ") || candidate.startsWith("## ")) {
        break;
      }
      chainLine = candidate;
      i = j;
      break;
    }

    if (!chainLine) {
      warn(`Sequence '${name}' is missing a chain line.`);
      continue;
    }

    const events = chainLine
      .split(/→|->/)
      .map((token) => token.trim())
      .filter((token) => token && token !== "[NOW]");

    sequences.push({ name, events });
  }

  return sequences;
}

function parseSpans(lines: string[], bounds: [number, number] | null, warn: (message: string) => void): Span[] {
  if (!bounds) {
    return [];
  }

  const [start, end] = bounds;
  const tableRows = lines.slice(start, end).filter((line) => line.trim().startsWith("|"));
  if (tableRows.length < 2) {
    return [];
  }

  const spans: Span[] = [];
  for (const row of tableRows.slice(2)) {
    const cols = splitRow(row);
    if (cols.length < 4) {
      warn(`Skipping malformed span row: ${row}`);
      continue;
    }
    const [name, from, to, length] = cols;
    if (!name) {
      continue;
    }
    spans.push({
      name,
      from: from ?? "",
      to: to ?? "",
      length: length ?? "",
    });
  }

  return spans;
}

export function parseTimeContext(markdown: string, options: ParseOptions = {}): TimeContext {
  const warn = options.warn ?? (() => {});
  const lines = markdown.split(/\r?\n/);
  const fallbackNow = buildNow(new Date(), "UTC");

  const context: TimeContext = {
    now: fallbackNow,
    behindEvents: [],
    aheadEvents: [],
    sequences: [],
    spans: [],
  };

  const nowBounds = sectionBounds(lines, "## Now");
  if (nowBounds) {
    const [start, end] = nowBounds;
    const fields = new Map<string, string>();

    for (const line of lines.slice(start, end)) {
      const match = line.trim().match(/^-\s+\*\*([^*]+)\*\*:\s*(.*)$/);
      if (!match) {
        continue;
      }
      const key = match[1];
      const value = match[2];
      if (!key || value === undefined) {
        continue;
      }
      fields.set(key.toLowerCase(), value);
    }

    context.now = {
      timestamp: fields.get("timestamp") || fallbackNow.timestamp,
      weekday: fields.get("weekday") || fallbackNow.weekday,
      week: fields.get("week") || fallbackNow.week,
      quarter: fields.get("quarter") || fallbackNow.quarter,
      timezone: fields.get("timezone") || fallbackNow.timezone,
    };
  } else {
    warn("Missing ## Now section. Using fallback NOW values.");
  }

  const behindBounds = subsectionBounds(lines, "### Behind (Past)");
  if (behindBounds) {
    const [start, end] = behindBounds;
    context.behindEvents = parseEventTable(lines.slice(start, end), warn, "behind");
  } else {
    warn("Missing ### Behind (Past) section.");
  }

  const aheadBounds = subsectionBounds(lines, "### Ahead (Future)");
  if (aheadBounds) {
    const [start, end] = aheadBounds;
    context.aheadEvents = parseEventTable(lines.slice(start, end), warn, "ahead");
  } else {
    warn("Missing ### Ahead (Future) section.");
  }

  context.sequences = parseSequences(lines, sectionBounds(lines, "## Sequences"), warn);
  context.spans = parseSpans(lines, sectionBounds(lines, "## Durations"), warn);

  return context;
}
