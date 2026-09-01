import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

// --- Local SQLite store -----------------------------------------------------
// Everything the CMS persists lives in one file: data/cms.db. The uploaded
// image *files* live under public/uploads/ (see src/lib/images.ts) and only
// their metadata is stored here.
//
// To move to a hosted database later, this is the only file that needs to
// change: expose the same helper surface from src/lib/posts.ts and
// src/lib/images.ts backed by the new driver.

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "cms.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS posts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL DEFAULT '',
  category      TEXT,
  status        TEXT NOT NULL DEFAULT 'draft',
  published_at  TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS images (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id       INTEGER REFERENCES posts(id) ON DELETE SET NULL,
  filename      TEXT NOT NULL,
  original_name TEXT,
  mime          TEXT,
  size          INTEGER,
  created_at    TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_images_post_id ON images(post_id);
`;

function openDatabase(): DatabaseSync {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(SCHEMA);
  return db;
}

// Cache the connection on globalThis so Next.js dev HMR doesn't open a new
// handle on every reload.
const globalForDb = globalThis as unknown as { cmsDb?: DatabaseSync };

export const db: DatabaseSync = globalForDb.cmsDb ?? openDatabase();

if (process.env.NODE_ENV !== "production") {
  globalForDb.cmsDb = db;
}

// node:sqlite returns loosely-typed rows; these helpers narrow to our own
// row interfaces (the schema is fixed, so the cast is safe).
export function queryAll<T>(sql: string, ...params: unknown[]): T[] {
  return db.prepare(sql).all(...(params as never[])) as unknown as T[];
}

export function queryOne<T>(sql: string, ...params: unknown[]): T | undefined {
  return db.prepare(sql).get(...(params as never[])) as unknown as T | undefined;
}
