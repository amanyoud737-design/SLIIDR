import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { uploadsRoot } from "@/lib/storage";

export const runtime = "nodejs";

function contentTypeFor(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

export async function GET(_: Request, { params }: { params: { file: string } }) {
  const fileName = decodeURIComponent(params.file);
  if (fileName.includes("..") || fileName.includes("/") || fileName.includes("\\")) {
    return NextResponse.json({ error: "Bad path" }, { status: 400 });
  }

  const diskPath = path.join(uploadsRoot(), fileName);
  try {
    const buf = await fs.readFile(diskPath);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentTypeFor(fileName),
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
