import { dependencies } from "@/lib/server/di";
import { describe, expect, it, test } from "vitest";

describe("Dependency Injection", () => {
    it("should be able to build a single dependency.", () => {
        const deps = dependencies().extend(() => ({ a: 1 })).build()
        expect(deps.a).toEqual(1);
    });

    it("should be able to build a dependency chain.", () => {
        const deps = dependencies()
            .extend(() => ({ a: 2 }))
            .extend((d) => ({ b: Math.pow(d.a, 2) }))
            .extend(d => ({ c: d.b + 2 }))
            .build();
            
        expect(deps.a).toBe(2);
        expect(deps.b).toBe(4);
        expect(deps.c).toBe(6);
    });
})