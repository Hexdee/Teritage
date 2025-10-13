import util from "node:util";

import { env } from "../config/env.js";

type LogLevel = "error" | "warn" | "info" | "debug";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const defaultLevel: LogLevel = env.logLevel === "debug" || env.logLevel === "warn" || env.logLevel === "error" ? (env.logLevel as LogLevel) : "info";
const activeLevelPriority = LEVEL_PRIORITY[defaultLevel] ?? LEVEL_PRIORITY.info;

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] <= activeLevelPriority;
}

function formatMessage(message: unknown, meta?: unknown): string {
  if (meta === undefined) {
    return typeof message === "string" ? message : util.inspect(message, { depth: null });
  }

  const formattedMeta = typeof meta === "string" ? meta : util.inspect(meta, { depth: null });

  if (typeof message === "string") {
    return `${message} ${formattedMeta}`;
  }

  return `${util.inspect(message, { depth: null })} ${formattedMeta}`;
}

function log(level: LogLevel, message: unknown, meta?: unknown) {
  if (!shouldLog(level)) {
    return;
  }

  const payload = formatMessage(message, meta);

  switch (level) {
    case "error":
      console.error(payload);
      break;
    case "warn":
      console.warn(payload);
      break;
    case "debug":
      console.debug(payload);
      break;
    default:
      console.log(payload);
  }
}

export const logger = {
  error(message: unknown, meta?: unknown) {
    log("error", message, meta);
  },
  warn(message: unknown, meta?: unknown) {
    log("warn", message, meta);
  },
  info(message: unknown, meta?: unknown) {
    log("info", message, meta);
  },
  debug(message: unknown, meta?: unknown) {
    log("debug", message, meta);
  }
};
