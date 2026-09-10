import { NextRequest, NextResponse } from "next/server";
import { acquirePrismaClient } from "@/lib/infra";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = acquirePrismaClient();

    if (body.action === "create") {
      const review = await db.review.create({
        data: {
          id: crypto.randomUUID(),
          userId: body.userId,
          businessId: body.businessId,
          text: body.text,
          foodQuality: body.foodQuality,
          service: body.service,
          ambiance: body.ambiance,
          value: body.value,
          upvotes: 0,
        },
      });

      return NextResponse.json({ success: true, data: review }, { status: 201 });
    }

    if (body.action === "upvote") {
      const review = await db.review.findFirst({ where: { id: body.reviewId } });
      if (!review) {
        return NextResponse.json({ success: false, type: "generic", message: "Review not found" }, { status: 404 });
      }

      await db.review.update({
        where: { id: body.reviewId },
        data: { upvotes: review.upvotes + 1 },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ success: false, type: "generic", message: "Unknown review action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, type: "generic", message: error.message ?? "Unknown" }, { status: 500 });
  }
}
