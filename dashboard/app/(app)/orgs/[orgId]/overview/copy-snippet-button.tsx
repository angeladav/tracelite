"use client";

import { Copy } from "lucide-react";

export function CopySnippetButton({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="absolute right-3 top-3 inline-flex h-9 items-center gap-2 rounded-lg border border-tl-border bg-tl-card px-3 text-xs font-medium text-tl-text-secondary transition-colors hover:bg-tl-card-hover hover:text-tl-text-primary"
      onClick={() => navigator.clipboard.writeText(text)}
    >
      <Copy className="size-3.5" strokeWidth={1.75} />
      Copy
    </button>
  );
}
