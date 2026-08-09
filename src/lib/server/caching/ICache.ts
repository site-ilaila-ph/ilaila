interface ICache {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, expiration?: number): Promise<void>;
    delete(key: string): Promise<void>;
}

export type { ICache }