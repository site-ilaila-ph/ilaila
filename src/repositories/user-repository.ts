import { acquireDatabase } from "@/lib/database";
import { UserData, UserRoleEnum } from "@/entities";

export async function listUsers() {
  const db = await acquireDatabase();
  const repo = db.getRepository(UserData);
  return repo.find({ order: { createdAt: "DESC" } });
}

export async function updateUserRole(input: { userId: string; role: "admin" | "viewer" }) {
  const db = await acquireDatabase();
  const repo = db.getRepository(UserData);
  return repo.update({ id: input.userId }, { role: input.role as UserRoleEnum });
}

export async function deleteUserById(id: string) {
  const db = await acquireDatabase();
  const repo = db.getRepository(UserData);
  await repo.delete({ id });
  return { success: true };
}

export async function findFirstUserId(): Promise<string | null> {
  const db = await acquireDatabase();
  const repo = db.getRepository(UserData);
  const row = await repo.findOne({ select: { id: true } });
  return row?.id ?? null;
}

export async function findUserIdByAuthId(authId: string): Promise<string | null> {
  const db = await acquireDatabase();
  const repo = db.getRepository(UserData);
  const row = await repo.findOne({
    select: { id: true },
    where: { authId },
  });
  return row?.id ?? null;
}
