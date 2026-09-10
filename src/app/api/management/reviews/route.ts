import { NextRequest, NextResponse } from "next/server";
import { acquirePrismaClient } from "@/lib/infra";

export async function GET() {
  const db = acquirePrismaClient();
  const data = await db.review.findMany({
    include: {
      user: { include: { authUser: true } },
      business: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data, { status: 200 });
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });
    const db = acquirePrismaClient();
    await db.review.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Unknown" }, { status: 500 });
  }
}
