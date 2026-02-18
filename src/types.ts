export interface Now {
  timestamp: string;
  weekday: string;
  week: string;
  quarter: string;
  timezone: string;
}

export interface Event {
  distance: string;
  name: string;
  type?: string;
  notes?: string;
  iso: string;
}

export interface Sequence {
  name: string;
  events: string[];
}

export interface Span {
  name: string;
  from: string;
  to: string;
  length: string;
}

export interface TimeContext {
  now: Now;
  behindEvents: Event[];
  aheadEvents: Event[];
  sequences: Sequence[];
  spans: Span[];
}
