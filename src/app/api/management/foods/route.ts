import { NextRequest, NextResponse } from "next/server";
import { acquirePrismaClient } from "@/lib/infra";

export async function GET() {
  const db = acquirePrismaClient();
  const data = await db.food.findMany({
    include: { tags: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(data, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = acquirePrismaClient();
    const data = await db.food.create({
      data: {
        id: crypto.randomUUID(),
        name: body.name,
        description: body.description,
        history: body.history,
        preparation: body.preparation,
        recipe: body.recipe,
        culturalSignificance: body.culturalSignificance,
        isHeritage: body.isHeritage,
      },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const db = acquirePrismaClient();
    const data = await db.food.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        history: body.history,
        preparation: body.preparation,
        recipe: body.recipe,
        culturalSignificance: body.culturalSignificance,
        isHeritage: body.isHeritage,
      },
    });
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Missing id" }, { status: 400 });
    const db = acquirePrismaClient();
    await db.food.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown";
    return NextResponse.json({ message }, { status: 500 });
  }
}
