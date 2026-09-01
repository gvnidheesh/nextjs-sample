"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "../actions";
import type { Post } from "@/lib/posts";

const initial: FormState = {};

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

const fieldClass =
  "rounded-md border border-black/15 bg-transparent px-3 py-2 text-base outline-none focus:border-foreground dark:border-white/20";

export function PostForm({
  action,
  post,
  submitLabel,
}: {
  action: Action;
  post?: Post;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Title
        <input
          name="title"
          required
          defaultValue={post?.title ?? ""}
          className={fieldClass}
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Slug <span className="text-zinc-400">(optional)</span>
          <input
            name="slug"
            defaultValue={post?.slug ?? ""}
            placeholder="auto from title"
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Category <span className="text-zinc-400">(optional)</span>
          <input
            name="category"
            defaultValue={post?.category ?? ""}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Status
          <select
            name="status"
            defaultValue={post?.status ?? "draft"}
            className={fieldClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Publish date
          <input
            type="date"
            name="published_at"
            defaultValue={post?.published_at ?? today}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Body <span className="text-zinc-400">(Markdown)</span>
        <textarea
          name="body"
          rows={14}
          defaultValue={post?.body ?? ""}
          className={`${fieldClass} font-mono text-sm`}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        {post ? "Add more images" : "Images"}
        <input
          type="file"
          name="images"
          multiple
          accept="image/*"
          className="text-sm"
        />
        <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
          The first image becomes the cover. JPEG / PNG / WebP / GIF, up to 8 MB
          each.
        </span>
      </label>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-60"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        <Link
          href="/admin"
          className="text-sm font-medium text-zinc-500 hover:underline dark:text-zinc-400"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
