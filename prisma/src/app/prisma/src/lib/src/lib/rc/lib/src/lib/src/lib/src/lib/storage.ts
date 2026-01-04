import path from "path";
import fs from "fs";

export function uploadsRoot() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
}

export function ensureUploadsDir() {
  const dir = uploadsRoot();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function safeFileName(original: string) {
  const base = original
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

  const ext = path.extname(base) || ".bin";
  const name = path.basename(base, ext) || "file";
  return { name, ext };
}

export function toPublicFileUrl(fileName: string) {
  return `/api/files/${encodeURIComponent(fileName)}`;
}

export function publicUrlToDiskPath(url: string) {
  const prefix = "/api/files/";
  if (!url.startsWith(prefix)) return null;
  const encoded = url.slice(prefix.length);
  const fileName = decodeURIComponent(encoded);
  return path.join(uploadsRoot(), fileName);
}
