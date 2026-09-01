import { db, queryAll, queryOne } from "./db";

export type PostStatus = "draft" | "published";

export interface Post {
  id: number;
  slug: string;
  title: string;
  body: string;
  category: string | null;
  status: PostStatus;
  published_at: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface PostInput {
  slug: string;
  title: string;
  body: string;
  category: string | null;
  status: PostStatus;
  published_at: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Ensure a slug is unique, appending -2, -3, ... when needed. */
export function uniqueSlug(base: string, ignoreId?: number): string {
  const root = slugify(base) || "post";
  let candidate = root;
  let n = 2;
  while (true) {
    const row = queryOne<{ id: number }>(
      "SELECT id FROM posts WHERE slug = ?",
      candidate,
    );
    if (!row || row.id === ignoreId) return candidate;
    candidate = `${root}-${n++}`;
  }
}

export function listPublishedPosts(): Post[] {
  return queryAll<Post>(
    `SELECT * FROM posts
     WHERE status = 'published' AND published_at <= date('now')
     ORDER BY published_at DESC, id DESC`,
  );
}

export function listAllPosts(): Post[] {
  return queryAll<Post>(
    "SELECT * FROM posts ORDER BY published_at DESC, id DESC",
  );
}

export function getPostBySlug(slug: string): Post | undefined {
  return queryOne<Post>("SELECT * FROM posts WHERE slug = ?", slug);
}

export function getPostById(id: number): Post | undefined {
  return queryOne<Post>("SELECT * FROM posts WHERE id = ?", id);
}

export function insertPost(input: PostInput): number {
  const ts = nowIso();
  const result = db
    .prepare(
      `INSERT INTO posts (slug, title, body, category, status, published_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.slug,
      input.title,
      input.body,
      input.category,
      input.status,
      input.published_at,
      ts,
      ts,
    );
  return Number(result.lastInsertRowid);
}

export function updatePost(id: number, input: PostInput): void {
  db.prepare(
    `UPDATE posts
     SET slug = ?, title = ?, body = ?, category = ?, status = ?, published_at = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    input.slug,
    input.title,
    input.body,
    input.category,
    input.status,
    input.published_at,
    nowIso(),
    id,
  );
}

export function deletePost(id: number): void {
  db.prepare("DELETE FROM posts WHERE id = ?").run(id);
}

export function excerpt(body: string, max = 200): string {
  const text = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

export function formatDate(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
