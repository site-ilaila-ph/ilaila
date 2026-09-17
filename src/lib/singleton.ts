type GlobalState = {
    singletonCache: Map<string, unknown>;
};

const globalState = globalThis as typeof globalThis & GlobalState;

globalState.singletonCache = new Map<string, unknown>();

function singleton<T>(name: string, factory: () => T): T {
    const cache = globalState.singletonCache;

    if (!cache.has(name)) {
        cache.set(name, factory());
    }

    return cache.get(name) as T;
}

function acquire<T>(name: string) {
    return singleton<T>(name, () => {
        throw new Error("Invalid singleton.");
    });
}

export { singleton, acquire };