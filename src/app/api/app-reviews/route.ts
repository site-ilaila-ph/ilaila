import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { acquirePrismaClient } from "@/lib/infra";
import { mapKnownApiRouteFailure } from "@/lib/api-route-errors";

const createAppReviewSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  rating: z.number().min(1).max(5),
  text: z.string().min(3),
});

export async function GET() {
  try {
    const db = acquirePrismaClient();
    const reviews = await db.appReview.findMany({
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(reviews, { status: 200 });
  } catch (error: unknown) {
    const mapped = mapKnownApiRouteFailure(error, "Unknown app review error");
    return NextResponse.json({ message: mapped.message }, { status: mapped.status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createAppReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const db = acquirePrismaClient();
    await db.appReview.create({
      data: {
        id: crypto.randomUUID(),
        userId: parsed.data.userId,
        email: parsed.data.email,
        rating: parsed.data.rating,
        text: parsed.data.text,
      },
    });

    return NextResponse.json(null, { status: 200 });
  } catch (error: unknown) {
    const mapped = mapKnownApiRouteFailure(error, "Unknown app review error");
    return NextResponse.json({ message: mapped.message }, { status: mapped.status });
  }
}
