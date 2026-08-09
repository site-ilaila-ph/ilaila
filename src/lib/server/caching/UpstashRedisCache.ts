import { ICache } from "./ICache";

class UpstashRedisCache implements ICache {
  private readonly store = new Map<string, { value: unknown; expiresAt?: number }>();

  async get<T>(key: string): Promise<T | null> {
    const item = this.store.get(key);

    if (!item) {
      return null;
    }

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set(key: string, value: unknown, expiration?: number): Promise<void> {
    const expiresAt = expiration ? Date.now() + expiration * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

export default UpstashRedisCache;