import type { Event, TimeContext } from "../types";
import { classifyPosition, formatDistance, sortTimelineEvents } from "./distance";
import { buildNow } from "./time";

export function emptyContext(timezone?: string): TimeContext {
  return {
    now: buildNow(new Date(), timezone),
    behindEvents: [],
    aheadEvents: [],
    sequences: [],
    spans: [],
  };
}

export function allEvents(context: TimeContext): Event[] {
  return [...context.behindEvents, ...context.aheadEvents];
}

export function hasEventName(context: TimeContext, name: string): boolean {
  const target = name.toLowerCase();
  return allEvents(context).some((event) => event.name.toLowerCase() === target);
}

export function upsertEvent(context: TimeContext, event: Event): void {
  const now = new Date(context.now.timestamp);
  const when = new Date(event.iso);
  event.distance = formatDistance(when, now);

  if (classifyPosition(when, now) === "behind") {
    context.behindEvents = sortTimelineEvents([...context.behindEvents, event]);
  } else {
    context.aheadEvents = sortTimelineEvents([...context.aheadEvents, event]);
  }
}

export function rebuildEventPositions(context: TimeContext): void {
  const now = new Date(context.now.timestamp);
  const merged = allEvents(context);
  const behind: Event[] = [];
  const ahead: Event[] = [];

  for (const event of merged) {
    const eventDate = new Date(event.iso);
    const next = {
      ...event,
      distance: formatDistance(eventDate, now),
    };
    if (classifyPosition(eventDate, now) === "behind") {
      behind.push(next);
    } else {
      ahead.push(next);
    }
  }

  context.behindEvents = sortTimelineEvents(behind);
  context.aheadEvents = sortTimelineEvents(ahead);
}
