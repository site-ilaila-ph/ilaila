import { error } from "node:console";
import Stream from "node:stream";

export function loggerFrom({ indent = 4 }) {
  let indentCount = 0;
  const indentStr = typeof indent === "number" ? " ".repeat(indent) : indent;
  const getCurrentIndent = () => indentStr.repeat(indentCount);

  /** @param {Stream.Writable} stream */
  const createWriter = (stream) => (message) => stream.write(message);

  const writers = {
    log: createWriter(process.stdout),
    warn: createWriter(process.stdout),
    error: createWriter(process.stderr),
  };

  const createLogMethod = (writer, colorCode) => (message) => {
    writer(`${getCurrentIndent()}\x1b[${colorCode}m${message}\x1b[0m\n`);
  };

  const createAsIsMethod = (writer) => (message) => {
    writer(`${getCurrentIndent()}${message}`);
  };

  const asIs = {
    log: createAsIsMethod(writers.log),
    warn: createAsIsMethod(writers.warn),
    error: createAsIsMethod(writers.error),
  };

  return {
    log: createLogMethod(writers.log, "36"),
    warn: createLogMethod(writers.warn, "33"),
    error: createLogMethod(writers.error, "31"),
    asIs,

    indent() {
      indentCount++;
    },

    dedent() {
      indentCount = Math.max(indentCount - 1, 0);
    },

    block(fn) {
      this.indent();
      try {
        return fn();
      } finally {
        this.dedent();
      }
    },
  };
}