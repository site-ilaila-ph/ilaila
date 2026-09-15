import { acquirePrismaClient } from "@/lib/infra";
import { Prisma } from "@/generated/prisma/client";

const businessDetailInclude = {
  images: true,
  createdBy: true,
  reviews: { include: { images: true, user: true }, orderBy: { createdAt: "desc" as const } },
  foods: true,
} satisfies Prisma.BusinessInclude;

export async function findBusinessDetailById(id: string) {
  const db = acquirePrismaClient();
  return db.business.findUnique({ where: { id }, include: businessDetailInclude });
}

export async function findBusinessByIdOrName(idOrName: string) {
  const db = acquirePrismaClient();
  const fullInclude = {
    images: true,
    reviews: { include: { user: { include: { authUser: true } } } },
    menuItems: true,
    foods: { include: { food: { include: { images: true } } } },
  };
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidPattern.test(idOrName)) {
    const byId = await db.business.findUnique({ where: { id: idOrName }, include: fullInclude });
    if (byId) return byId;
  }
  const decoded = decodeURIComponent(idOrName).replaceAll("-", " ");
  return db.business.findFirst({
    where: {
      OR: [
        { name: { equals: idOrName, mode: "insensitive" } },
        { name: { equals: decoded, mode: "insensitive" } },
        { name: { contains: idOrName, mode: "insensitive" } },
      ],
    },
    include: fullInclude,
  });
}

export async function createBusinessWithImages(input: {
  id: string;
  fields: Prisma.BusinessUncheckedCreateInput;
  ownerId: string;
  images: Prisma.BusinessImageCreateManyBusinessInput[];
}) {
  const db = acquirePrismaClient();
  const { createdById: _createdById, images: _images, id: _id, ...rest } = input.fields;
  void _createdById; void _images; void _id;
  return db.business.create({
    data: {
      ...rest,
      id: input.id,
      createdById: input.ownerId,
      images: input.images.length > 0 ? { create: input.images } : undefined,
    },
    include: { images: true },
  });
}

export async function createSimpleBusiness(input: Omit<Prisma.BusinessUncheckedCreateInput, "createdById" | "id"> & { ownerId: string }) {
  const db = acquirePrismaClient();
  const { ownerId, ...fields } = input;
  return db.business.create({
    data: {
      ...fields,
      id: crypto.randomUUID(),
      createdById: ownerId,
      isPublished: true,
    },
  });
}

export async function updateSimpleBusiness(input: Prisma.BusinessUncheckedUpdateInput & { id: string }) {
  const db = acquirePrismaClient();
  const { id, ...data } = input;
  return db.business.update({ where: { id }, data });
}

export async function deleteBusinessById(id: string) {
  const db = acquirePrismaClient();
  await db.business.delete({ where: { id } });
  return { success: true };
}

export async function findBusinessImageIds(businessId: string): Promise<string[]> {
  const db = acquirePrismaClient();
  const rows = await db.businessImage.findMany({ where: { businessId }, select: { id: true } });
  return rows.map((r) => r.id);
}

export async function findBusinessImageIdsByIds(ids: string[], businessId: string): Promise<string[]> {
  const db = acquirePrismaClient();
  const rows = await db.businessImage.findMany({
    where: { id: { in: ids }, businessId },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}
