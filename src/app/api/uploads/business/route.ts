import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { acquireNextJSCookieMap, acquireCacheManager, acquireDb, acquireStorageManager } from "@/lib/infra";
import { createSessionReader } from "@/lib/session/server";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxFileSize = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const session = createSessionReader({
    db: acquireDb(),
    cache: acquireCacheManager(),
    cookieMap: await acquireNextJSCookieMap(),
  });
  const user = await session.getSessionUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || !allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
  }
  if (file.size > maxFileSize) {
    return NextResponse.json({ error: "Image must be 5 MB or smaller" }, { status: 413 });
  }

  const extension = file.type.split("/")[1].replace("jpeg", "jpg");
  const filename = `${randomUUID()}.${extension}`;
  const key = ["management", "businesses", filename];

  if (process.env.NODE_ENV !== "production" && !process.env.BLOB_READ_WRITE_TOKEN) {
    const relativePath = path.join("uploads", ...key);
    const filePath = path.join(process.cwd(), "public", relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url: `/${relativePath.replaceAll("\\", "/")}` });
  }

  const blob = await acquireStorageManager().upload({
    key,
    fileOrBody: file,
    options: { access: "public", contentType: file.type },
  });
  return NextResponse.json({ url: blob.url });
}