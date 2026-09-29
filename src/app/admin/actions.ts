"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  checkPassword,
  endSession,
  requireAdmin,
  startSession,
} from "@/lib/auth";
import { issueCaptcha, verifyCaptcha, type Captcha } from "@/lib/captcha";
import {
  deletePost as deletePostRow,
  getPostById,
  insertPost,
  updatePost as updatePostRow,
  uniqueSlug,
  type PostStatus,
} from "@/lib/posts";
import {
  deleteImage,
  deleteImagesForPost,
  getImage,
  saveUpload,
} from "@/lib/images";

export interface FormState {
  error?: string;
  /** A fresh challenge to render after a failed attempt. */
  captcha?: Captcha;
}

// --- Auth -----------------------------------------------------------------

export async function login(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const captchaToken = formData.get("captcha_token");
  const captchaAnswer = formData.get("captcha");
  if (
    !verifyCaptcha(
      typeof captchaToken === "string" ? captchaToken : "",
      typeof captchaAnswer === "string" ? captchaAnswer : "",
    )
  ) {
    return { error: "Captcha answer is incorrect.", captcha: issueCaptcha() };
  }

  const password = formData.get("password");
  if (!checkPassword(typeof password === "string" ? password : "")) {
    return { error: "Incorrect password.", captcha: issueCaptcha() };
  }
  await startSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/auth/login");
}

// --- Posts --------------------------------------------------------------

function readPostForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "draft");
  const publishedAt = String(formData.get("published_at") ?? "").trim();

  const status: PostStatus = statusRaw === "published" ? "published" : "draft";

  return {
    title,
    body,
    category: categoryRaw ? categoryRaw : null,
    slugRaw,
    status,
    published_at: publishedAt || new Date().toISOString().slice(0, 10),
  };
}

function validate(fields: ReturnType<typeof readPostForm>): string | null {
  if (!fields.title) return "Title is required.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields.published_at))
    return "Publish date is invalid.";
  return null;
}

async function attachUploads(formData: FormData, postId: number): Promise<void> {
  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);
  for (const file of files) {
    await saveUpload(file, postId);
  }
}

export async function createPost(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const fields = readPostForm(formData);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const slug = uniqueSlug(fields.slugRaw || fields.title);

  let id: number;
  try {
    id = insertPost({
      slug,
      title: fields.title,
      body: fields.body,
      category: fields.category,
      status: fields.status,
      published_at: fields.published_at,
    });
    await attachUploads(formData, id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save post." };
  }

  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updatePost(
  id: number,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const existing = getPostById(id);
  if (!existing) return { error: "Post not found." };

  const fields = readPostForm(formData);
  const invalid = validate(fields);
  if (invalid) return { error: invalid };

  const slug = uniqueSlug(fields.slugRaw || fields.title, id);

  try {
    updatePostRow(id, {
      slug,
      title: fields.title,
      body: fields.body,
      category: fields.category,
      status: fields.status,
      published_at: fields.published_at,
    });
    await attachUploads(formData, id);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save post." };
  }

  revalidatePath("/");
  revalidatePath(`/news/${slug}`);
  revalidatePath(`/news/${existing.slug}`);
  revalidatePath("/gallery");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deletePost(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  if (Number.isFinite(id)) {
    await deleteImagesForPost(id);
    deletePostRow(id);
  }
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin");
  redirect("/admin");
}

// --- Images -----------------------------------------------------------

export async function uploadImages(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAdmin();

  const postIdRaw = formData.get("post_id");
  const postId =
    typeof postIdRaw === "string" && postIdRaw ? Number(postIdRaw) : null;

  const files = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) return { error: "Choose at least one image." };

  try {
    for (const file of files) {
      await saveUpload(file, postId);
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload failed." };
  }

  revalidatePath("/gallery");
  revalidatePath("/admin/images");
  if (postId) revalidatePath("/admin");
  return {};
}

export async function removeImage(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const image = Number.isFinite(id) ? getImage(id) : undefined;
  if (image) {
    await deleteImage(id);
    if (image.post_id) {
      const post = getPostById(image.post_id);
      if (post) revalidatePath(`/news/${post.slug}`);
    }
  }
  revalidatePath("/");
  revalidatePath("/gallery");
  revalidatePath("/admin/images");
  revalidatePath("/admin");
}
