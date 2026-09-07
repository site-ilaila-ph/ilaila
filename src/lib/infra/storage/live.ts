import { head, put, del, list } from "@vercel/blob";
import { StorageLayer } from "./common";

export default function liveStorageFactory(): StorageLayer {
  return {
    async upload(key, fileOrBody, options) {
      return await put(key, fileOrBody, { access: "public", ...options });
    },
    async get(key) {
      try {
        return await head(key);
      } catch {
        return null;
      }
    },
    async delete(key) {
      await del(key);
    },
    async list(options) {
      return await list(options);
    },
  };
}