import "./server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  db: PrismaClient | undefined;
};

export function acquireDb(): PrismaClient {
  if (globalForPrisma.db) {
    return globalForPrisma.db;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const db = new PrismaClient({
    adapter: new PrismaPg(connectionString),
  });

  globalForPrisma.db = db;

  return db;
}