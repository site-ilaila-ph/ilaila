import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.POSTGRES_PRISMA_URL,
  }),
});

export default function factory() {
  return db;
}