import Link from "next/link";
import { coverImageForPost, imageUrl } from "@/lib/images";
import { excerpt, formatDate, listPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const posts = listPublishedPosts();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Latest news</h1>

      {posts.length === 0 ? (
        <p className="mt-8 text-zinc-500 dark:text-zinc-400">
          No posts published yet. Check back soon.
        </p>
      ) : (
        <ul className="mt-8 flex flex-col gap-10">
          {posts.map((post) => {
            const cover = coverImageForPost(post.id);
            return (
              <li
                key={post.id}
                className="border-b border-black/10 pb-10 last:border-b-0 dark:border-white/15"
              >
                <article className="flex flex-col gap-3">
                  {cover && (
                    <Link href={`/news/${post.slug}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl(cover)}
                        alt=""
                        className="aspect-[16/9] w-full rounded-lg object-cover"
                      />
                    </Link>
                  )}
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
                  <h2 className="text-2xl font-semibold tracking-tight">
                    <Link href={`/news/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-300">
                    {excerpt(post.body)}
                  </p>
                  <Link
                    href={`/news/${post.slug}`}
                    className="text-sm font-medium hover:underline"
                  >
                    Read more →
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
