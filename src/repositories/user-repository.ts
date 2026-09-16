import { acquirePrismaClient } from "@/lib/infra";

export async function listUsers() {
  const db = acquirePrismaClient();
  return db.userData.findMany({ orderBy: { createdAt: "desc" } });
}

export async function updateUserRole(input: { userId: string; role: "admin" | "viewer" }) {
  const db = acquirePrismaClient();
  return db.userData.update({
    where: { id: input.userId },
    data: { role: input.role },
  });
}

export async function deleteUserById(id: string) {
  const db = acquirePrismaClient();
  await db.userData.delete({ where: { id } });
  return { success: true };
}

export async function findFirstUserId(): Promise<string | null> {
  const db = acquirePrismaClient();
  const row = await db.userData.findFirst({ select: { id: true } });
  return row?.id ?? null;
}

export async function findUserIdByAuthId(authId: string): Promise<string | null> {
  const db = acquirePrismaClient();
  const row = await db.userData.findFirst({
    select: { id: true },
    where: { authId },
  });
  return row?.id ?? null;
}
