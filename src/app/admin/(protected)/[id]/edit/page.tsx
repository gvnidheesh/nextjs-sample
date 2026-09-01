import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePost, removeImage, updatePost } from "../../../actions";
import { PostForm } from "../../../_components/post-form";
import { ConfirmButton } from "../../../_components/confirm-button";
import { getPostById } from "@/lib/posts";
import { imageUrl, listImagesForPost } from "@/lib/images";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);
  const post = Number.isFinite(postId) ? getPostById(postId) : undefined;
  if (!post) notFound();

  const images = listImagesForPost(post.id);
  const action = updatePost.bind(null, post.id);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Edit post</h1>
          {post.status === "published" && (
            <Link
              href={`/news/${post.slug}`}
              className="text-sm font-medium hover:underline"
            >
              View live →
            </Link>
          )}
        </div>
        <div className="mt-6">
          <PostForm action={action} post={post} submitLabel="Save changes" />
        </div>
      </div>

      {images.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold tracking-tight">
            Attached images
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((image, index) => (
              <div key={image.id} className="flex flex-col gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl(image)}
                  alt={image.original_name ?? ""}
                  className="aspect-square w-full rounded-md object-cover"
                />
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{index === 0 ? "Cover" : `Image ${index + 1}`}</span>
                  <form action={removeImage}>
                    <input type="hidden" name="id" value={image.id} />
                    <ConfirmButton
                      message="Remove this image?"
                      className="font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      Remove
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-black/10 pt-6 dark:border-white/15">
        <h2 className="text-lg font-semibold tracking-tight text-red-600 dark:text-red-400">
          Danger zone
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Permanently delete this post and all its images.
        </p>
        <form action={deletePost} className="mt-3">
          <input type="hidden" name="id" value={post.id} />
          <ConfirmButton
            message={`Delete "${post.title}" and its images?`}
            className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Delete post
          </ConfirmButton>
        </form>
      </section>
    </div>
  );
}
