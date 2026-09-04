import { execa } from "execa";
import chokidar from "chokidar";
import { dirname, join } from "node:path";
import dotenv from "dotenv";
import fsx from "fs-extra";
import { waitForPostgres } from "@jcoreio/wait-for-postgres";

const rootDir = dirname(import.meta.dirname);

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
    detached: process.platform === "win32",
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
  await fsx.writeJSON(join(rootDir, ".prisma-dev-lock"), { pid: process.pid });
}

async function respectLock() {
  if (await fsx.exists(join(rootDir, ".prisma-dev-lock"))) {
    console.error("An instance of prisma-dev is already running.");
    process.exit(0);
  }
}

async function removeLock() {
  await fsx.rm(join(rootDir, ".prisma-dev-lock"), { force: true });
}

async function main() {
  await respectLock();
  await writeLock();
  dotenv.config({ path: join(rootDir, ".env.development") });

  const watcher = chokidar.watch([join(rootDir, "prisma/schema.prisma")]);

  const prismaDevPromise = execa("pnpm", ["exec", "prisma", "dev"], {
    cwd: rootDir,
    stdio: "ignore",
    cleanup: false,
    detached: true,
    windowsHide: true,
    windowsVerbatimArguments: false,
  });

  prismaDevPromise.catch((err) => {
    console.error("prisma dev exited unexpectedly:", err);
  });

  async function waitForDbReady() {
    const dbUrl = new URL(process.env.DATABASE_URL!);

    await waitForPostgres({
      host: dbUrl.hostname,
      port: Number(dbUrl.port),
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1),
      timeout: 2 * 60 * 1000,
    });
  }

  async function regenerateAndPush({ seed = false }: { seed?: boolean } = {}) {
    await run("pnpm", ["exec", "prisma", "db", "push"], { cwd: rootDir });
    await run("pnpm", ["exec", "prisma", "generate"], { cwd: rootDir });
    if (seed) {
      await run("pnpm", ["exec", "prisma", "db", "seed"], { cwd: rootDir });
    }
  }

  async function cleanupDatabase() {
    try {
      await run("pnpm", ["exec", "prisma", "migrate", "reset", "--force"], {
        cwd: rootDir,
      });
    } catch (err) {
      console.error("cleanup routine failed:", err);
    } finally {
      prismaDevPromise.kill("SIGTERM");
      try {
        await prismaDevPromise;
      } catch {
        // already logged via the .catch() above
      }
    }
  }

  let shuttingDown = false;
  async function shutdown() {
    if (shuttingDown) return;
    shuttingDown = true;
    await watcher.close();
    await cleanupDatabase();
    await removeLock();
    process.exit(0);
  }

  process.on("SIGINT", () => shutdown());
  process.on("SIGTERM", () => shutdown());

  watcher.on("ready", async () => {
    try {
      await waitForDbReady();
      await regenerateAndPush({ seed: true });
      
      await new Promise((resolve) => setTimeout(resolve, 1000));

      watcher.on("change", async () => {
        try {
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
      });

      console.log("prisma-dev ready!");
    } catch (err) {
      if (err instanceof CommandFailedError) {
        console.error(err.message);
        await shutdown();
      } else {
        throw err;
      }
    }
  });
}

main().catch((err) => {
  console.error("fatal:", err);
  process.exit(0);
});
