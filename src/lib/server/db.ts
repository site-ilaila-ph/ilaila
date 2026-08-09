import "./server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  db: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const db =
  globalForPrisma.db ??
  new PrismaClient({
    adapter: new PrismaPg(connectionString),
  });

export default db;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.db = db;
}
