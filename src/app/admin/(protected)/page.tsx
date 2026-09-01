import Link from "next/link";
import { deletePost } from "../actions";
import { ConfirmButton } from "../_components/confirm-button";
import { formatDate, listAllPosts } from "@/lib/posts";
import { listImagesForPost } from "@/lib/images";

export const dynamic = "force-dynamic";

export default function AdminDashboard() {
  const posts = listAllPosts();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
        <Link
          href="/admin/new"
          className="rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-8 text-zinc-500 dark:text-zinc-400">
          No posts yet. Create your first one.
        </p>
      ) : (
        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-white/15 dark:text-zinc-400">
              <th className="py-2 pr-3 font-medium">Title</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 pr-3 font-medium">Date</th>
              <th className="py-2 pr-3 font-medium">Images</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-b border-black/5 dark:border-white/10"
              >
                <td className="py-3 pr-3">
                  <span className="font-medium">{post.title}</span>
                  <span className="block text-xs text-zinc-400">
                    /news/{post.slug}
                  </span>
                </td>
                <td className="py-3 pr-3">
                  <span
                    className={
                      post.status === "published"
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        : "rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    }
                  >
                    {post.status}
                  </span>
                </td>
                <td className="py-3 pr-3 whitespace-nowrap text-zinc-600 dark:text-zinc-300">
                  {formatDate(post.published_at)}
                </td>
                <td className="py-3 pr-3 text-zinc-600 dark:text-zinc-300">
                  {listImagesForPost(post.id).length}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/${post.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deletePost}>
                      <input type="hidden" name="id" value={post.id} />
                      <ConfirmButton
                        message={`Delete "${post.title}" and its images?`}
                        className="font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        Delete
                      </ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
