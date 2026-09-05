import { describe, expect, it } from "vitest";
import { hash, verify } from "@/app/(unauthenticated-only)/auth/lib/password";
import signInSchema from "@/app/(unauthenticated-only)/auth/validation/schemas/sign-in";
import signUpSchema from "@/app/(unauthenticated-only)/auth/validation/schemas/sign-up";

describe("auth password hashing and verification", () => {
  it("should hash a password and verify it successfully", async () => {
    const password = "securepassword123";
    const hashed = await hash(password);
    
    expect(hashed).toBeDefined();
    expect(typeof hashed).toBe("string");
    expect(hashed).toContain(":");

    const isValid = await verify(password, hashed);
    expect(isValid).toBe(true);

    const isInvalid = await verify("wrongpassword", hashed);
    expect(isInvalid).toBe(false);
  });

  it("rejects malformed stored hashes without throwing", async () => {
    await expect(verify("password", "malformed")).resolves.toBe(false);
    await expect(verify("password", "00:00")).resolves.toBe(false);
  });

  it("rejects empty and wrong passwords", async () => {
    const hashed = await hash("correct-password");

    await expect(verify("", hashed)).resolves.toBe(false);
    await expect(verify("wrong-password", hashed)).resolves.toBe(false);
  });
});

describe("auth input validation", () => {
  it("accepts valid sign-in and sign-up data", () => {
    expect(signInSchema.safeParse({ email: "admin@example.com", password: "00000000" }).success).toBe(true);
    expect(signUpSchema.safeParse({
      userName: "admin",
      email: "admin@example.com",
      password: "00000000",
      confirmPassword: "00000000",
    }).success).toBe(true);
  });

  it("rejects invalid emails, short passwords, and mismatched confirmation", () => {
    expect(signInSchema.safeParse({ email: "not-an-email", password: "password" }).success).toBe(false);
    expect(signUpSchema.safeParse({
      userName: "ab",
      email: "not-an-email",
      password: "short",
      confirmPassword: "different",
    }).success).toBe(false);
  });
});
