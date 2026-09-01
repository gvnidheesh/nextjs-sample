import { marked } from "marked";

// The post body is authored only by the authenticated admin, so we render it
// as trusted HTML (no sanitizer). If this ever becomes multi-author, add a
// sanitize step here before returning.

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function renderMarkdown(md: string): string {
  return marked.parse(md ?? "", { async: false }) as string;
}
