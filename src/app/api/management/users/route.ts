import { NextRequest, NextResponse } from "next/server";
import { acquirePrismaClient } from "@/lib/infra";

export async function GET() {
  const db = acquirePrismaClient();
  const data = await db.userData.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(
    data.map((row) => ({ ...row, isAdmin: row.role === "admin" })),
    { status: 200 },
  );
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const db = acquirePrismaClient();
    const data = await db.userData.update({
      where: { id: body.userId },
      data: { role: body.isAdmin ? "admin" : "viewer" },
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Unknown" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });
    const db = acquirePrismaClient();
    await db.userData.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message ?? "Unknown" }, { status: 500 });
  }
}
