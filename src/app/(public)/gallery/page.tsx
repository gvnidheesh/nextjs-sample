import type { Metadata } from "next";
import { imageUrl, listImages } from "@/lib/images";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: "All uploaded images.",
};

export default function GalleryPage() {
  const images = listImages();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Gallery</h1>

      {images.length === 0 ? (
        <p className="mt-8 text-zinc-500 dark:text-zinc-400">No images yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image) => (
            <a
              key={image.id}
              href={imageUrl(image)}
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl(image)}
                alt={image.original_name ?? ""}
                className="aspect-square w-full rounded-md object-cover transition-opacity hover:opacity-90"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
