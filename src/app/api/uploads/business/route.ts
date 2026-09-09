import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { acquireStorageManager } from "@/lib/infra";
import { acquireDb, acquireNextJSCookieMap } from "@/lib/live";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxFileSize = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const cookieMap = await acquireNextJSCookieMap();
  const sessionId = cookieMap.get("SESSION_TOKEN");
  const session = sessionId
    ? await acquireDb().session.findUnique({
        where: { id: sessionId },
        include: { user: true },
      })
    : null;
  const user = session && session.expiresAt > new Date() ? session.user : null;
  if (!user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Persistent image storage is not configured. Set BLOB_READ_WRITE_TOKEN before uploading business photos." },
      { status: 500 },
    );
  }

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

  const blob = await acquireStorageManager().upload({
    key,
    fileOrBody: file,
    options: { access: "public", contentType: file.type },
  });
  return NextResponse.json({ url: blob.url });
}