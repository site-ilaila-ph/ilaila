import { afterEach, describe, expect, it, vi } from "vitest";

const { PrismaClient, PrismaPg } = vi.hoisted(() => ({
  PrismaClient: vi.fn(class MockPrismaClient {}),
  PrismaPg: vi.fn(),
}));

vi.mock("@/generated/prisma/client", () => ({ PrismaClient }));
vi.mock("@prisma/adapter-pg", () => ({ PrismaPg }));

import { acquireDb } from "@/lib/infra";

describe("database live component", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
    PrismaClient.mockClear();
    PrismaPg.mockClear();
  });

  it("returns the same singleton on repeated acquisition", () => {
    process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/app";
    const first = acquireDb();
    const second = acquireDb();

    expect(second).toBe(first);
  });
});