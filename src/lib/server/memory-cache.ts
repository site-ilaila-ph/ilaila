import type { CacheLayer } from "./cache";

class MemoryCache implements CacheLayer {
  private store = new Map<string, { value: unknown; expiresAt?: number }>();

  private tryGet(key: string) {
    const item = this.store.get(key);

    if (!item || (item.expiresAt && Date.now() > item.expiresAt)) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  async has(key: string): Promise<boolean> {
    return Boolean(this.tryGet(key));
  }

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

  async set(
    key: string,
    value: unknown,
    expirationSeconds?: number,
  ): Promise<void> {
    const expiresAt = expirationSeconds
      ? Date.now() + expirationSeconds * 1000
      : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  remainingTtl(key: string): number {
    const item = this.store.get(key);
    if (!item || !item.expiresAt) return -1;
    const ttl = Math.floor((item.expiresAt - Date.now()) / 1000);
    return ttl > 0 ? ttl : 0;
  }
}

export default MemoryCache;
