import { afterEach, describe, expect, it, vi } from "vitest";

const { PrismaClient, PrismaPg } = vi.hoisted(() => ({
  PrismaClient: vi.fn(class MockPrismaClient {}),
  PrismaPg: vi.fn(),
}));

vi.mock("@/generated/prisma/client", () => ({ PrismaClient }));
vi.mock("@prisma/adapter-pg", () => ({ PrismaPg }));

import { acquireDb } from "@/lib/live";

describe("database live component", () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;

  afterEach(() => {
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;
    PrismaClient.mockClear();
    PrismaPg.mockClear();
  });

  it("fails clearly when the database URL is missing", () => {
    delete process.env.DATABASE_URL;
    expect(() => acquireDb()).toThrow("DATABASE_URL is not set");
  });

  it("constructs a Prisma client from the configured URL", () => {
    process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/app";
    const db = acquireDb();

    expect(PrismaPg).toHaveBeenCalledWith({ connectionString: process.env.DATABASE_URL });
    expect(PrismaClient).toHaveBeenCalledWith({ adapter: expect.anything() });
    expect(db).toBe(PrismaClient.mock.results[0].value);
  });

  it("returns the same singleton on repeated acquisition", () => {
    process.env.DATABASE_URL = "postgresql://user:password@localhost:5432/app";
    const first = acquireDb();
    const second = acquireDb();

    expect(second).toBe(first);
    expect(PrismaClient).not.toHaveBeenCalled();
  });
});