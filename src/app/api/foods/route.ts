import { NextRequest, NextResponse } from "next/server";
import { acquirePrismaClient } from "@/lib/infra";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const name = url.searchParams.get("name");
  const db = acquirePrismaClient();

  try {
    if (id) {
      const result = await db.food.findUnique({
        where: { id },
        include: {
          images: true,
          tags: true,
          businesses: {
            include: {
              business: {
                include: {
                  images: true,
                  tags: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(result ?? null, { status: result ? 200 : 404 });
    }

    if (name) {
      const result = await db.food.findFirst({
        where: {
          name: {
            contains: name,
            mode: "insensitive",
          },
        },
        include: {
          images: true,
          tags: true,
          businesses: {
            include: {
              business: {
                include: {
                  images: true,
                  tags: true,
                },
              },
            },
          },
        },
      });

      return NextResponse.json(result ?? null, { status: result ? 200 : 404 });
    }

    const topRated = url.searchParams.get("topRated");
    if (topRated) {
      const foods = await db.food.findMany({
        include: {
          images: true,
          tags: true,
          businesses: {
            include: {
              business: {
                include: {
                  reviews: true,
                },
              },
            },
          },
        },
      });

      const result = foods
        .map((food) => {
          const allReviews = food.businesses.flatMap((bf) => bf.business?.reviews ?? []);
          const averageRating = allReviews.length > 0
            ? allReviews.reduce((sum, review) => sum + review.foodQuality, 0) / allReviews.length
            : 0;

          return { ...food, averageRating };
        })
        .filter((food) => food.averageRating > 0)
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 6);

      return NextResponse.json(result, { status: 200 });
    }

    const result = await db.food.findMany({
      include: {
        images: true,
        tags: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ success: false, type: "generic", message: e.message ?? "Unknown" }, { status: 500 });
  }
}
