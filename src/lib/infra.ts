import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { type StorageManager } from "@/lib/storage/common";

export { type StorageManager } from "@/lib/storage/common";

export function acquirePrismaClient(): PrismaClient {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
    return new PrismaClient({ adapter } as never);
}
