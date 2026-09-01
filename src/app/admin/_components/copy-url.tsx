"use client";

import { useState } from "react";

export function CopyUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable — ignore */
        }
      }}
      className="truncate text-left text-xs text-zinc-500 hover:text-foreground hover:underline dark:text-zinc-400"
      title={url}
    >
      {copied ? "Copied!" : url}
    </button>
  );
}
