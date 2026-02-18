import type { Event, Sequence, TimeContext } from "../types";
import { sortTimelineEvents } from "./distance";

type RenderView = "full" | "past" | "ahead";

interface RenderOptions {
  view?: RenderView;
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function renderEventTable(events: Event[]): string[] {
  const rows = [
    "| distance | event | type | notes | iso |",
    "|----------|-------|------|-------|-----|",
  ];

  for (const event of events) {
    rows.push(
      `| ${escapeCell(event.distance)} | ${escapeCell(event.name)} | ${escapeCell(event.type || "")} | ${escapeCell(event.notes || "")} | ${escapeCell(event.iso)} |`,
    );
  }

  return rows;
}

function renderNowSection(context: TimeContext): string[] {
  return [
    "## Now",
    `- **timestamp**: ${context.now.timestamp}`,
    `- **weekday**: ${context.now.weekday}`,
    `- **week**: ${context.now.week}`,
    `- **quarter**: ${context.now.quarter}`,
    `- **timezone**: ${context.now.timezone}`,
  ];
}

function sequenceWithNow(sequence: Sequence, context: TimeContext): string {
  const allEvents = [...context.behindEvents, ...context.aheadEvents];
  const byName = new Map(allEvents.map((event) => [event.name.toLowerCase(), event]));
  const nowMs = new Date(context.now.timestamp).getTime();

  let insertAt = sequence.events.length;
  for (let i = 0; i < sequence.events.length; i += 1) {
    const eventName = sequence.events[i];
    if (!eventName) {
      continue;
    }
    const event = byName.get(eventName.toLowerCase());
    if (!event) {
      insertAt = i;
      break;
    }
    const eventMs = new Date(event.iso).getTime();
    if (eventMs >= nowMs) {
      insertAt = i;
      break;
    }
  }

  const tokens = [...sequence.events];
  tokens.splice(insertAt, 0, "[NOW]");
  return tokens.join(" → ");
}

export function renderTimeContext(context: TimeContext, options: RenderOptions = {}): string {
  const view = options.view ?? "full";
  const lines: string[] = ["# Time Context", "", ...renderNowSection(context), "", "## Timeline", ""];

  if (view === "full" || view === "past") {
    lines.push("### Behind (Past)", "", ...renderEventTable(sortTimelineEvents(context.behindEvents)), "");
  }

  if (view === "full" || view === "ahead") {
    lines.push("### Ahead (Future)", "", ...renderEventTable(sortTimelineEvents(context.aheadEvents)), "");
  }

  if (view === "full") {
    lines.push("## Sequences", "");
    for (const sequence of context.sequences) {
      lines.push(`### ${sequence.name}`);
      lines.push(sequenceWithNow(sequence, context));
      lines.push("");
    }

    lines.push("## Durations", "", "| span | from | to | length |", "|------|------|----|--------|");
    for (const span of context.spans) {
      lines.push(
        `| ${escapeCell(span.name)} | ${escapeCell(span.from)} | ${escapeCell(span.to)} | ${escapeCell(span.length)} |`,
      );
    }
    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}
