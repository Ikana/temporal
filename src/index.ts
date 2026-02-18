#!/usr/bin/env bun
import { aheadCommand } from "./commands/ahead";
import { addCommand } from "./commands/add";
import { initCommand } from "./commands/init";
import { nowCommand } from "./commands/now";
import { pastCommand } from "./commands/past";
import { refreshCommand } from "./commands/refresh";
import { removeCommand } from "./commands/remove";
import { scratchCommand } from "./commands/scratch";
import { seqCommand } from "./commands/seq";
import { showCommand } from "./commands/show";
import { spanCommand } from "./commands/span";
import { USAGE, runWithErrors } from "./lib/cli";

type CommandFn = (args: string[]) => void;

const commands: Record<string, CommandFn> = {
  init: initCommand,
  add: addCommand,
  now: nowCommand,
  refresh: refreshCommand,
  show: () => showCommand(),
  past: () => pastCommand(),
  ahead: () => aheadCommand(),
  remove: removeCommand,
  scratch: scratchCommand,
  seq: seqCommand,
  span: spanCommand,
};

function printUsageToStderr(): void {
  process.stderr.write(USAGE);
}

const argv = process.argv.slice(2);
const command = argv[0];

if (!command) {
  printUsageToStderr();
  process.exit(1);
}

if (command === "--help" || command === "-h" || command === "help") {
  printUsageToStderr();
  process.exit(0);
}

const handler = commands[command];
if (!handler) {
  process.stderr.write(`Error: Unknown command '${command}'.\n`);
  printUsageToStderr();
  process.exit(1);
}

const code = runWithErrors(() => handler(argv.slice(1)));
process.exit(code);
