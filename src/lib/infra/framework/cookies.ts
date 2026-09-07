import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { cookies } from "next/headers";

export interface CookieMap {
  get(key: string): string | null;
  has(key: string): boolean;
  set(key: string, value: string, options?: Parameters<ReadonlyRequestCookies["set"]>[2]): void;
  delete(key: string): void;
}

export async function acquireNextJSCookieMap(): Promise<CookieMap> {
  const cookieStore = await cookies();

  return {
    get(key) {
      return cookieStore.get(key)?.value ?? null;
    },
    has(key) {
      return cookieStore.has(key);
    },
    set(key, value, options) {
      cookieStore.set(key, value, options);
    },
    delete(key) {
      cookieStore.delete(key);
    },
  };
}