if (typeof window !== "undefined") {
    throw new Error("A server-only module was imported in the client.");
}

export {}