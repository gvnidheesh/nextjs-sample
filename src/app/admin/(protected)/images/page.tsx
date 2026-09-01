import { removeImage } from "../../actions";
import { ImageUploader } from "../../_components/image-uploader";
import { ConfirmButton } from "../../_components/confirm-button";
import { CopyUrl } from "../../_components/copy-url";
import { getPostById } from "@/lib/posts";
import { imageUrl, listImages } from "@/lib/images";

export const dynamic = "force-dynamic";

export default function AdminImagesPage() {
  const images = listImages();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Images</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Upload standalone images for the gallery. Images attached to a post are
        managed on that post&rsquo;s edit page.
      </p>

      <div className="mt-6">
        <ImageUploader />
      </div>

      {images.length === 0 ? (
        <p className="mt-8 text-zinc-500 dark:text-zinc-400">
          No images uploaded yet.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => {
            const post = image.post_id ? getPostById(image.post_id) : undefined;
            return (
              <div key={image.id} className="flex flex-col gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl(image)}
                  alt={image.original_name ?? ""}
                  className="aspect-square w-full rounded-md object-cover"
                />
                <CopyUrl url={imageUrl(image)} />
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="truncate">
                    {post ? `Post: ${post.title}` : "Gallery"}
                  </span>
                  <form action={removeImage}>
                    <input type="hidden" name="id" value={image.id} />
                    <ConfirmButton
                      message="Delete this image?"
                      className="font-medium text-red-600 hover:underline dark:text-red-400"
                    >
                      Delete
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
