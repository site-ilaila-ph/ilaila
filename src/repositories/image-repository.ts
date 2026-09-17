import { acquireDatabase } from "@/lib/database";
import { Image } from "@/entities";

export async function listImages(parentType?: string, parentId?: string) {
  const db = await acquireDatabase();
  const repo = db.getRepository(Image);
  if (parentType && parentId) {
    return repo.find({ where: { parentType, parentId } });
  }
  if (parentType) {
    return repo.find({ where: { parentType } });
  }
  return repo.find();
}

export async function findImageById(id: string) {
  const db = await acquireDatabase();
  return db.getRepository(Image).findOne({ where: { id } });
}

export async function createImage(input: Partial<Image> & { id?: string }) {
  const db = await acquireDatabase();
  const repo = db.getRepository(Image);
  return repo.save({ ...input, id: input.id ?? crypto.randomUUID() });
}

export async function updateImage(id: string, input: Partial<Image>) {
  const db = await acquireDatabase();
  const repo = db.getRepository(Image);
  await repo.update({ id }, input);
  return repo.findOne({ where: { id } });
}

export async function deleteImageById(id: string) {
  const db = await acquireDatabase();
  await db.getRepository(Image).delete({ id });
  return { success: true };
}
