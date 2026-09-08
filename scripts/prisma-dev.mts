/* eslint-disable @typescript-eslint/no-explicit-any */
import { execa } from "execa";
import chokidar from "chokidar";
import { dirname, join } from "node:path";
import fsx from "fs-extra";

const rootDir = dirname(import.meta.dirname);

const watcher = chokidar.watch([join(rootDir, "prisma/schema.prisma")]);

let shuttingDown = false;

class CommandFailedError extends Error {
  constructor(
    public readonly command: string,
    public readonly exitCode: number,
  ) {
    super(`command failed: ${command} (exit code ${exitCode})`);
    this.name = "CommandFailedError";
  }
}

async function run(
  command: string,
  args: string[],
  options: { cwd?: string } = {},
) {
  console.log(`$ ${command} ${args.join(" ")}`);

  const subprocess = execa(command, args, {
    ...options,
    reject: false,
    detached: true,
    windowsHide: true,
    windowsVerbatimArguments: false,
  });

  const printLine = (line: string) => console.log(`   ${line}`);

  subprocess.stdout?.on("data", (chunk: Buffer) => {
    chunk.toString().split("\n").filter(Boolean).forEach(printLine);
  });
  subprocess.stderr?.on("data", (chunk: Buffer) => {
    chunk.toString().split("\n").filter(Boolean).forEach(printLine);
  });

  const result = await subprocess;

  if (result.exitCode !== 0) {
    throw new CommandFailedError(
      `${command} ${args.join(" ")}`,
      result.exitCode ?? 1,
    );
  }

  return result;
}

async function writeLock() {
  await fsx.ensureDir(join(rootDir, ".tmp"));
  await fsx.writeJSON(join(rootDir, ".tmp", ".prisma-dev-lock"), {
    pid: process.pid,
  });
}

async function isPidAlive(pid: number): Promise<boolean> {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err: any) {
    if (err instanceof Error && "code" in err) return err.code === "EPERM";
    else return false;
  }
}

async function respectLock() {
  const lockPath = join(rootDir, ".tmp", ".prisma-dev-lock");

  if (await fsx.exists(lockPath)) {
    const { pid } = await fsx.readJSON(lockPath);

    if (typeof pid === "number" && (await isPidAlive(pid))) {
      console.error(
        `An instance of prisma-dev is already running (pid ${pid}).`,
      );
      process.exit(0);
    }

    console.warn(
      `Stale prisma-dev lock found (pid ${pid} not running). Removing it.`,
    );
    await fsx.rm(lockPath, { force: true });
  }
}

async function removeLock() {
  await fsx.rm(join(rootDir, ".tmp", ".prisma-dev-lock"), { force: true });
}

async function regenerateAndPush({ seed = false }: { seed?: boolean } = {}) {
  await run("pnpm", ["exec", "prisma", "db", "push"], { cwd: rootDir });
  await run("pnpm", ["exec", "prisma", "generate"], { cwd: rootDir });
  if (seed) {
    await run("pnpm", ["exec", "prisma", "db", "seed"], { cwd: rootDir });
  }
}

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  await watcher.close();
  await removeLock();
  process.exit(0);
}

async function onWatcherReady() {
  try {
    console.log("prisma-dev generating prisma client and pushing...");
    await regenerateAndPush({ seed: true });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    watcher.on("change", onSchemaChange);

    console.log("prisma-dev ready and watching for changes!");
  } catch (err) {
    if (err instanceof CommandFailedError) {
      console.error(err.message);
      await shutdown();
    } else {
      throw err;
    }
  }
}

async function onSchemaChange() {
  try {
    console.log(
      "prisma-dev detected schema file change, regenerating client and pushing to database.",
    );
    await regenerateAndPush();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (err) {
    if (err instanceof CommandFailedError) {
      console.error(err.message);
      await shutdown();
    } else {
      throw err;
    }
  }
}

async function main() {
  await respectLock();
  await writeLock();

  console.log("Started! Assuming Postgres is running externally.");

  process.on("SIGINT", () => shutdown());
  process.on("SIGTERM", () => shutdown());

  watcher.on("ready", onWatcherReady);
}

main().catch((err) => {
  console.error("fatal:", err);
  process.exit(0);
});