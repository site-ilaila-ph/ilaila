import { type StorageManager } from "@/lib/storage/common";
import { acquireDatabase as getDB } from "@/lib/database";
export { type StorageManager } from "@/lib/storage/common";
export async function acquireDatabase(): Promise<Awaited<ReturnType<typeof getDB>>> {
  return await getDB();
}
