/* eslint-disable @typescript-eslint/no-explicit-any */
import { execa } from "execa";
import chokidar from "chokidar";
import { dirname, join } from "node:path";
import fsx from "fs-extra";
import Docker from "dockerode";
import { waitForPostgres } from "@jcoreio/wait-for-postgres";

const rootDir = dirname(import.meta.dirname);

const POSTGRES_CONTAINER_NAME = "prisma-dev-postgres";
const POSTGRES_IMAGE = process.env.POSTGRES_IMAGE ?? "postgres:16-alpine";
const POSTGRES_VOLUME_NAME = "prisma-dev-postgres-data";

const docker = new Docker(); // uses DOCKER_HOST, or the platform default socket/pipe

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

// --- Docker helpers (dockerode instead of `docker compose` / `prisma dev`) ---

async function pullImageIfMissing(image: string) {
  try {
    await docker.getImage(image).inspect();
    return;
  } catch {
    // not present locally, pull it
  }

  console.log(`Pulling image ${image}...`);
  await new Promise<void>((resolve, reject) => {
    docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
      if (err) return reject(err);
      docker.modem.followProgress(stream, (err) => (err ? reject(err) : resolve()));
    });
  });
}

async function findExistingContainer() {
  const containers = await docker.listContainers({ all: true });
  const match = containers.find((c) =>
    c.Names.some((n) => n === `/${POSTGRES_CONTAINER_NAME}`),
  );
  return match ? docker.getContainer(match.Id) : null;
}

async function ensureVolume() {
  try {
    await docker.getVolume(POSTGRES_VOLUME_NAME).inspect();
  } catch {
    await docker.createVolume({ Name: POSTGRES_VOLUME_NAME });
  }
}

async function startPostgresContainer() {
  const dbUrl = new URL(process.env.DATABASE_URL!);
  const hostPort = dbUrl.port || "5432";

  await pullImageIfMissing(POSTGRES_IMAGE);
  await ensureVolume();

  const existing = await findExistingContainer();
  if (existing) {
    const info = await existing.inspect();
    if (info.State.Running) {
      console.log("Postgres container already running, reusing it.");
      return;
    }
    console.log("Found stopped postgres container, starting it.");
    await existing.start();
    return;
  }

  console.log(`Creating postgres container "${POSTGRES_CONTAINER_NAME}"...`);
  const container = await docker.createContainer({
    name: POSTGRES_CONTAINER_NAME,
    Image: POSTGRES_IMAGE,
    Env: [
      `POSTGRES_USER=${dbUrl.username}`,
      `POSTGRES_PASSWORD=${dbUrl.password}`,
      `POSTGRES_DB=${dbUrl.pathname.slice(1)}`,
    ],
    ExposedPorts: { "5432/tcp": {} },
    HostConfig: {
      PortBindings: { "5432/tcp": [{ HostPort: hostPort }] },
      Binds: [`${POSTGRES_VOLUME_NAME}:/var/lib/postgresql/data`],
    },
  });

  await container.start();
}

async function stopPostgresContainer() {
  // Tears down the container AND its volume, so each run starts from a
  // completely clean database.
  const container = await findExistingContainer();
  if (container) {
    const info = await container.inspect().catch(() => null);
    if (info?.State.Running) {
      await container.stop().catch(() => {});
    }
    await container.remove({ force: true }).catch(() => {});
  }

  await docker.getVolume(POSTGRES_VOLUME_NAME).remove().catch((err: any) => {
    if (err?.statusCode !== 404) throw err;
  });
}

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
    await stopPostgresContainer();
  }
}

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;
  await watcher.close();
  await cleanupDatabase();
  await removeLock();
  process.exit(0);
}

async function onWatcherReady() {
  try {
    console.log("prisma-dev waiting for postgres...");
    await waitForDbReady();
    console.log("prisma-dev generating prisma client and pushing...");
    await regenerateAndPush({ seed: true });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    watcher.on("change", onSchemaChange);

    console.log("prisma-dev (docker) ready!");
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

  await startPostgresContainer();
  console.log("Started!");

  process.on("SIGINT", () => shutdown());
  process.on("SIGTERM", () => shutdown());

  watcher.on("ready", onWatcherReady);
}

main().catch((err) => {
  console.error("fatal:", err);
  process.exit(0);
});