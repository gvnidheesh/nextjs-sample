import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { db, queryAll, queryOne } from "./db";

// Uploaded files are written to public/uploads/ so Next serves them directly at
// /uploads/<filename>. Only metadata is kept in SQLite.

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB per file

export interface ImageRecord {
  id: number;
  post_id: number | null;
  filename: string;
  original_name: string | null;
  mime: string | null;
  size: number | null;
  created_at: string;
}

export function imageUrl(record: Pick<ImageRecord, "filename">): string {
  return `/uploads/${record.filename}`;
}

/** Persist one uploaded File to disk + DB. Returns the new row, or throws. */
export async function saveUpload(
  file: File,
  postId: number | null,
): Promise<ImageRecord> {
  if (!file || file.size === 0) {
    throw new Error("Empty file.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error(`"${file.name}" is not an image.`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`"${file.name}" is larger than 8 MB.`);
  }

  const ext =
    EXT_BY_MIME[file.type] ??
    path.extname(file.name).replace(".", "").toLowerCase() ??
    "bin";
  const filename = `${randomUUID()}.${ext}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);

  const result = db
    .prepare(
      `INSERT INTO images (post_id, filename, original_name, mime, size, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(postId, filename, file.name, file.type, file.size, new Date().toISOString());

  return getImage(Number(result.lastInsertRowid))!;
}

export function getImage(id: number): ImageRecord | undefined {
  return queryOne<ImageRecord>("SELECT * FROM images WHERE id = ?", id);
}

export function listImages(): ImageRecord[] {
  return queryAll<ImageRecord>("SELECT * FROM images ORDER BY id DESC");
}

export function listImagesForPost(postId: number): ImageRecord[] {
  return queryAll<ImageRecord>(
    "SELECT * FROM images WHERE post_id = ? ORDER BY id ASC",
    postId,
  );
}

export function coverImageForPost(postId: number): ImageRecord | undefined {
  return queryOne<ImageRecord>(
    "SELECT * FROM images WHERE post_id = ? ORDER BY id ASC LIMIT 1",
    postId,
  );
}

export async function deleteImage(id: number): Promise<void> {
  const record = getImage(id);
  if (!record) return;
  db.prepare("DELETE FROM images WHERE id = ?").run(id);
  await fs
    .unlink(path.join(UPLOAD_DIR, record.filename))
    .catch(() => {
      /* file already gone — ignore */
    });
}

export async function deleteImagesForPost(postId: number): Promise<void> {
  for (const image of listImagesForPost(postId)) {
    await deleteImage(image.id);
  }
}
