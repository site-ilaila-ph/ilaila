"use strict";

import { rm } from "fs/promises";
import { loggerFrom } from "./modules/logger.js";
import { join } from "path";
import { projectRoot } from "./modules/paths.js";

async function main() {
  const logger = loggerFrom({ console });

  logger.log("Removing node_modules, and other package related artifacts.");

  await logger.block(async () => {
    const nodeModulesRemovalPromise = rm(join(projectRoot, 'node_modules'), { recursive: true, force: true });
    const pnpmStoreRemovalPromise = rm(join(projectRoot, '.pnpm-store'), { recursive: true, force: true });
    const nextCacheRemovalPromise = rm(join(projectRoot, '.next'), { recursive: true, force: true });
    const generatedSourceRemovalPromise = rm(join(projectRoot, 'src/generated'), { recursive: true, force: true });

    try {
      await Promise.all([nodeModulesRemovalPromise, pnpmStoreRemovalPromise, nextCacheRemovalPromise, generatedSourceRemovalPromise]);
    }
    catch (e) {
      logger.error("Something went wrong whilst cleaning up.");
    }
  });
}

main();