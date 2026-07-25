"use strict";

import { loggerFrom } from "./modules/logger.js";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import crypto from "node:crypto";
import editDotenv from "edit-dotenv";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const envPath = join(root, ".env.development");

logger.log("Starting keygen...");
logger.indent();

logger.block(function () {
  try {
    const envContent = readFileSync(envPath, "utf8");

    const updatedContent = editDotenv(envContent, {
      JWT_SECRET: crypto.randomBytes(64).toString("hex"),
    });

    writeFileSync(envPath, updatedContent, "utf8");
    logger.log(".env file updated successfully!");
  } catch (error) {
    logger.error("Error handling the .env file:", error.message);
  }
});
