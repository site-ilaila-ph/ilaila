import { NextRequest, NextResponse } from "next/server";
import { getAllFood, getFoodById, getFoodByName, getTopRatedFoods } from "@/logic/foods";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const name = url.searchParams.get("name");
  try {
    if (id) {
      const result = await getFoodById({ id });
      if ("success" in result && !result.success) return NextResponse.json(result, { status: 400 });
      return NextResponse.json(result, { status: 200 });
    }
    if (name) {
      const result = await getFoodByName({ name });
      if ("success" in result && !result.success) return NextResponse.json(result, { status: 400 });
      return NextResponse.json(result, { status: 200 });
    }
    const result = await getAllFood({});
    if ("success" in result && !result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ success: false, type: "generic", message: e.message ?? "Unknown" }, { status: 500 });
  }
}
