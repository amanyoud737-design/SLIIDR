import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { ensureUploadsDir, safeFileName, toPublicFileUrl } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_MB = 8;
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp"]);

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");

  if (!(file instanceof File)) return NextResponse.json({ error: "file is required" }, { status: 400 });
  if (!ALLOWED.has(file.type)) return NextResponse.json({ error: "Only PNG/JPEG/WEBP allowed" }, { status: 400 });

  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > MAX_MB) return NextResponse.json({ error: `Max ${MAX_MB}MB` }, { status: 400 });

  const dir = ensureUploadsDir();
  const { name, ext } = safeFileName(file.name);
  const id = crypto.randomBytes(8).toString("hex");
  const fileName = `${name}-${id}${ext}`;
  const diskPath = path.join(dir, fileName);

  const bytes = new Uint8Array(await file.arrayBuffer());
  await fs.writeFile(diskPath, bytes);

  return NextResponse.json({ url: toPublicFileUrl(fileName) });
}
