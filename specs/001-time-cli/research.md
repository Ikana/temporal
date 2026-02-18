# Research: Temporal CLI

## Decision Log

### 1. Date/Time Library

**Decision**: Use native JavaScript `Date` object — zero dependencies.

**Rationale**: Bun does not support the TC39 Temporal API natively (JSC engine). Native `Date` is sufficient for our needs: calculating millisecond differences between dates, adding/subtracting offsets, formatting ISO 8601 strings, and detecting timezones via `Intl.DateTimeFormat`. The Temporal polyfill adds ~50KB which violates the Simplicity principle.

**Alternatives considered**:
- `@js-temporal/polyfill` — Too heavy (50KB) for our simple date math needs.
- `date-fns` — Modular and tree-shakeable, but unnecessary when native `Date` suffices for offset arithmetic.

### 2. Duration Parsing

**Decision**: Write a custom regex-based duration parser (~30 lines).

**Rationale**: The CLI needs to parse strings like `"3 days"`, `"2 hours"`, `"1 week"`, `"5 days ago"`, `"in 3 days"`. A simple regex with a unit lookup table handles all these cases. No library needed.

**Pattern**:
```typescript
// Parse: "3 days" → { ms: 259200000, direction: "future" }
// Parse: "3 days ago" → { ms: 259200000, direction: "past" }
// Parse: "in 3 days" → { ms: 259200000, direction: "future" }
const regex = /(\d+\.?\d*)\s*(minutes?|hours?|days?|weeks?|months?)/i;
```

**Alternatives considered**:
- `chrono-node` — Full NLP date parser (~100KB), massive overkill for structured CLI input.
- `parse-duration` — Tiny (3KB) but doesn't handle "ago"/"in" direction. We'd still need wrapper code.
- `ms` — Only handles short forms like `"2d"`, not `"2 days"`.

### 3. Date Parsing

**Decision**: Use `new Date(string)` for ISO 8601 and supplement with a small custom parser for relative expressions.

**Rationale**: `new Date("2026-02-17")` handles ISO dates natively. For relative expressions (`tomorrow`, `yesterday`, `next Monday`), a small switch statement suffices. We don't need full NLP date parsing.

**Alternatives considered**:
- `chrono-node` — Would handle everything but adds 100KB and violates Simplicity principle.

### 4. Markdown Table Handling

**Decision**: Custom string manipulation functions — zero dependencies.

**Rationale**: Our markdown tables have a fixed, known schema (distance | event | type | notes | iso). We only need to generate and parse tables with these exact columns. A `createTable()` and `parseTable()` function of ~20 lines each handles this perfectly. `Bun.markdown` exists but outputs HTML, not structured data — not useful for our read-modify-write workflow.

**Alternatives considered**:
- `Bun.markdown` — Built-in but converts to HTML; we need structured data round-tripping.
- `markdown-table` — ESM library, adds a dependency for something trivially implementable.

### 5. CLI Argument Parsing

**Decision**: Use `util.parseArgs` (built into Bun/Node.js) with manual subcommand dispatch.

**Rationale**: `util.parseArgs` is zero-dependency, built into Bun, supports short flags, defaults, and strict mode. It doesn't handle subcommands natively, but a simple `switch(positionals[0])` handles that. No need for `commander` (40KB) or `yargs` (100KB).

**Alternatives considered**:
- `commander` — Full-featured but 40KB, way too heavy for 10 commands.
- `yargs` — 100KB, enterprise-grade CLI framework. Overkill.
- `minimist` — 3KB but no TypeScript types, no strict mode.

### 6. Binary Distribution

**Decision**: `bun build --compile --minify` to produce a single standalone binary.

**Rationale**: Produces a self-contained executable (~51MB on macOS) that includes the Bun runtime. Users install it to `$PATH`. No Node.js or Bun installation required on the target machine.

**Gotchas to watch for**:
- Use only static imports (no `require()` with dynamic paths).
- File paths resolve from CWD, not executable location — this is actually what we want since `time.md` lives in the project directory.
- Binary size is ~51MB. Acceptable for a development tool.

### 7. Timezone Detection

**Decision**: Use `Intl.DateTimeFormat().resolvedOptions().timeZone` with `TZ` env var override.

**Rationale**: This is the standard cross-platform way to detect the system timezone in JavaScript. It returns IANA timezone names (e.g., `Europe/Amsterdam`). The `--timezone` CLI flag and `TZ` environment variable provide overrides.

### 8. Human-Readable Distance Formatting

**Decision**: Custom formatter that picks the most natural unit.

**Rules**:
- < 60 minutes → minutes ("45 minutes ahead")
- < 24 hours → hours ("6 hours behind")
- < 14 days → days ("3 days ahead")
- < 8 weeks → weeks ("2 weeks ahead")
- ≥ 8 weeks → months ("2 months ahead")

This follows how humans naturally describe temporal distance — the ego-moving metaphor uses the most salient spatial unit.

## Technology Stack Summary

| Component | Choice | Size | Rationale |
|-----------|--------|------|-----------|
| Runtime | Bun | built-in | Fast, TypeScript native, compile to binary |
| Date math | Native `Date` | 0KB | Sufficient for offset arithmetic |
| Duration parsing | Custom regex | ~30 lines | Handles "3 days", "ago", "in" |
| Date parsing | Native + custom | ~20 lines | ISO 8601 + relative expressions |
| Markdown tables | Custom string ops | ~40 lines | Fixed schema, read-modify-write |
| CLI args | `util.parseArgs` | 0KB | Built into Bun |
| Distribution | `bun build --compile` | — | Single binary, no runtime needed |
| Timezone | `Intl.DateTimeFormat` | 0KB | Standard cross-platform API |

**Total external dependencies: 0**
