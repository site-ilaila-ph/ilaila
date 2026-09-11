import { NextRequest, NextResponse } from "next/server";
import { withLogging } from "@/lib/logging";
import { acquirePrismaClient } from "@/lib/infra";
import { internalErrorProblem, notFoundProblem } from "@/lib/responses/problem";

export const runtime = "nodejs";

function mapFoodReadFailure(request: NextRequest, error: unknown): NextResponse {
  console.error("Food read failed", error);
  return internalErrorProblem(request, { detail: "Unable to load foods right now. Please try again later." });
}

async function getFoods(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const name = url.searchParams.get("name");
  const db = acquirePrismaClient();

  try {
    if (id) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      let result = null;

      if (isUuid) {
        result = await db.food.findUnique({
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
      }

      if (!result) {
        result = await db.food.findFirst({
          where: {
            OR: [
              { name: { equals: id, mode: "insensitive" } },
              { name: { contains: id, mode: "insensitive" } },
            ],
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
      }

      if (!result) {
        return notFoundProblem(req, { code: "food-not-found", detail: "The food does not exist." });
      }

      return NextResponse.json(result, { status: 200 });
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

      if (!result) {
        return notFoundProblem(req, { code: "food-not-found", detail: "No food matches the requested name." });
      }

      return NextResponse.json(result, { status: 200 });
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
  } catch (error: unknown) {
    return mapFoodReadFailure(req, error);
  }
}

export const GET = withLogging(getFoods, {
  name: "getFoods",
  redact: { headers: ["authorization", "cookie"] },
});
