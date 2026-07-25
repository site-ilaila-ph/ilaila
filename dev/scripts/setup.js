import { rm, access } from "fs/promises";
import { logger } from "./modules/singletons.js";
import { join } from "path";
import { projectRoot } from "./modules/paths.js";
import { spawn } from "child_process";
import { command } from "./modules/commands.js";

async function areDependenciesInstalled() {
  try {
    await access(join(projectRoot, 'node_modules'));
    return true;
  } catch {
    return false;
  }
}

async function isDockerRunning() {
  const { exitCode } = await command("docker", ["info"]);
}

async function waitForDatabase(retries = 15, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await command("pnpm", ["exec", "prisma", "migrate", "status"]);
      return;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("PostgreSQL took too long to start.");
}

async function main() {
  if (!(await isDockerRunning())) {
    logger.error(
      "Cannot run setup script with docker engine not started. Please start docker desktop.",
    );
    return;
  }

  if(!(await areDependenciesInstalled())) {
    logger.error(
      "Cannot run setup script without installing dependencies first. please run `pnpm install` at the project root."
    );
    return;
  }

  logger.log("Regenerating development JWT_SECRET key...");
  await logger.block(async () => {
    await import("./keygen.js");
  });

  logger.log("Syncing local postgresql database...");
  await logger.block(async () => {
    await command("docker", [
      "compose",
      "-f",
      "dev/docker-compose.yml",
      "up",
      "-d",
    ]);

    await waitForDatabase();

    await command("pnpm", ["exec", "prisma", "migrate", "deploy"]);
  });

  logger.log("Generating prisma types.");
  await logger.block(async () => {
    await command("pnpm", ["exec", "prisma", "generate"]);
  });

  logger.log("Finished setup!");
  logger.log("What is next?");
  logger.log(
    "Run each of these commands on separate terminals:\n\tpnpm dev:docker\n\tpnpm db:sync",
  );
}

main();
