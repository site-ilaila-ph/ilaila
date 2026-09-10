import { NextRequest, NextResponse } from "next/server";
import { acquirePrismaClient } from "@/lib/infra";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const db = acquirePrismaClient();

  try {
    if (id) {
      const data = await db.business.findUnique({
        where: { id },
        include: {
          images: true,
          tags: true,
          reviews: true,
          menuItems: true,
          foods: { include: { food: { include: { images: true, tags: true } } } },
        },
      });

      if (!data) {
        return NextResponse.json({ success: false, type: "generic", message: "Business not found" }, { status: 404 });
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
    const message = error instanceof Error ? error.message : "Unknown";
    return NextResponse.json({ success: false, type: "generic", message }, { status: 500 });
  }
}
