import { describe, expect, it } from "vitest";
import { hash, verify } from "@/app/auth/lib/password";

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
});
