import { ICache } from "./ICache";

class InMemoryCache implements ICache {
  private store = new Map<string, { value: unknown; expiresAt?: number }>();

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

  async set(key: string, value: unknown, expirationSeconds?: number): Promise<void> {
    const expiresAt = expirationSeconds ? Date.now() + (expirationSeconds * 1000) : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}

export default InMemoryCache;