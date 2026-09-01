import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { imageUrl, listImagesForPost } from "@/lib/images";
import { excerpt, formatDate, getPostBySlug } from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

function visiblePost(slug: string) {
  const post = getPostBySlug(slug);
  if (!post || post.status !== "published") return undefined;
  if (post.published_at > new Date().toISOString().slice(0, 10)) return undefined;
  return post;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = visiblePost(slug);
  if (!post) return { title: "Not found" };
  return {
    title: post.title,
    description: excerpt(post.body, 160),
  };
}

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = visiblePost(slug);
  if (!post) notFound();

  const images = listImagesForPost(post.id);
  const html = renderMarkdown(post.body);

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          <time dateTime={post.published_at}>
            {formatDate(post.published_at)}
          </time>
          {post.category && (
            <>
              <span aria-hidden>·</span>
              <span>{post.category}</span>
            </>
          )}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
      </header>

      {images.length > 0 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl(images[0])}
          alt=""
          className="w-full rounded-lg object-cover"
        />
      )}

      <div
        className="prose-newsroom flex flex-col gap-4 leading-7 text-zinc-800 dark:text-zinc-200"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.slice(1).map((image) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={image.id}
              src={imageUrl(image)}
              alt=""
              className="aspect-square w-full rounded-md object-cover"
            />
          ))}
        </div>
      )}
    </article>
  );
}
