class AssertionError extends Error {
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);
        this.name = "AssertionError";
        Object.setPrototypeOf(this, AssertionError.prototype);
    }
}

function assert(check: unknown, message: string | (() => string) | null = null): asserts check {
    if (check) return;

    const resolvedMessage = typeof message === "function" ? message() : (message ?? "Assertion failed.");
    throw new AssertionError(resolvedMessage);
}

export { AssertionError, assert };