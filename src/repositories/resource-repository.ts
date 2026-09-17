import { acquireDatabase } from "@/lib/database";
import { Resource } from "@/entities";

export async function listResources() {
  const db = await acquireDatabase();
  return db.getRepository(Resource).find({ order: { createdAt: "DESC" } });
}

export async function findResourceById(id: string) {
  const db = await acquireDatabase();
  return db.getRepository(Resource).findOne({ where: { id } });
}

export async function createResource(input: Partial<Resource> & { id?: string }) {
  const db = await acquireDatabase();
  const repo = db.getRepository(Resource);
  return repo.save({ ...input, id: input.id ?? crypto.randomUUID() });
}

export async function updateResource(id: string, input: Partial<Resource>) {
  const db = await acquireDatabase();
  const repo = db.getRepository(Resource);
  await repo.update({ id }, input);
  return repo.findOne({ where: { id } });
}

export async function deleteResourceById(id: string) {
  const db = await acquireDatabase();
  await db.getRepository(Resource).delete({ id });
  return { success: true };
}
