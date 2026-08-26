import { dirname, join } from "node:path";
import fsx from "fs-extra";

const rootDir = dirname(import.meta.dirname);
const lockPath = join(rootDir, ".prisma-dev-lock");

async function main() {
  if (!(await fsx.exists(lockPath))) {
    console.log("No lock file found - nothing to stop.");
    return;
  }

  const { pid } = await fsx.readJSON(lockPath);

  try {
    process.kill(pid, 0); // check if the process is actually alive
  } catch {
    console.warn(`Stale lock file found (pid ${pid} not running) - removing.`);
    await fsx.rm(lockPath, { force: true });
    return;
  }

  console.log(`Stopping prisma-dev (pid ${pid})...`);
  process.kill(pid, "SIGTERM");

  const timeoutMs = 30 * 1000;
  const pollMs = 300;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      process.kill(pid, 0);
    } catch {
      console.log("Stopped.");
      await fsx.rm(lockPath, { force: true });
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }

  console.error(
    `Timed out waiting for pid ${pid} to exit after ${timeoutMs}ms. It may still be running or stuck in cleanup. Removing lock file anyway.`,
  );
  await fsx.rm(lockPath, { force: true });
  process.exit(1);
}

main().catch((err) => {
  console.error("fatal:", err);
  process.exit(1);
});