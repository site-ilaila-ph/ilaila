import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { withUnhandledApiErrorHandling } from "@/lib/error-handling";
import { acquirePrismaClient } from "@/lib/infra";
import { notFoundProblem } from "@/lib/responses/problem";
import { logAndRethrow } from "@/lib/errors";

export const runtime = "nodejs";

async function getBusinesses(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const db = acquirePrismaClient();
    if (id) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let data = null;

      if (isUuid) {
        data = await db.business.findUnique({
          where: { id },
          include: {
            images: true,
            tags: true,
            reviews: { include: { user: { include: { authUser: true } } } },
            menuItems: true,
            foods: { include: { food: { include: { images: true, tags: true } } } },
          },
        });
      }

      if (!data) {
        const decoded = decodeURIComponent(id).replaceAll("-", " ");
        data = await db.business.findFirst({
          where: {
            OR: [
              { name: { equals: id, mode: "insensitive" } },
              { name: { equals: decoded, mode: "insensitive" } },
              { name: { contains: id, mode: "insensitive" } },
            ],
          },
          include: {
            images: true,
            tags: true,
            reviews: { include: { user: { include: { authUser: true } } } },
            menuItems: true,
            foods: { include: { food: { include: { images: true, tags: true } } } },
          },
        });
      }

      if (!data) {
        return notFoundProblem(req, { code: "business-not-found", detail: "The business does not exist." });
      }

      return NextResponse.json(data, { status: 200 });
    }

    const data = await db.business.findMany({
      where: { isPublished: true },
      include: {
        images: true,
        tags: true,
        reviews: true,
        menuItems: true,
        foods: { include: { food: { include: { images: true, tags: true } } } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    logAndRethrow("Business read", error);
  }
}

export const GET = withLogging(withUnhandledApiErrorHandling(getBusinesses), "getBusinesses");
