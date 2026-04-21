'use client';

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function NewOrgPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState<string | null>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const computedSlug = slugify(slug || trimmedName);

    if (!trimmedName) {
      setError("Organization name is required.");
      return;
    }

    if (!computedSlug) {
      setError("Please provide a valid slug.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/orgs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          slug: computedSlug,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: {
          message?: string
        };
      };

      if (!response.ok) {
        setError(payload?.message?.message ?? "Could not create organization.");
        return;
      }

      router.push("/orgs");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold text-tl-text-primary">
        Create Organization
      </h1>
      <p className="mt-1 text-sm text-tl-text-secondary">
        Set up your organization to start tracking API requests.
      </p>

      <form
        className="mt-8 rounded-lg border border-tl-border bg-tl-card p-6"
        onSubmit={onSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="org-name"
              className="text-xs font-medium uppercase tracking-wide text-tl-text-secondary"
            >
              Organization Name
            </label>
            <input
              id="org-name"
              name="name"
              type="text"
              disabled={isSubmitting}
              value={name}
              onChange={(event) => {
                const nextName = event.target.value;
                setName(nextName);
                if (!slugEdited) {
                  setSlug(slugify(nextName));
                }
              }}
              placeholder="My Startup"
              className="h-10 w-full rounded-lg border border-tl-border bg-tl-bg px-3 text-sm text-tl-text-primary outline-none placeholder:text-tl-text-muted focus:border-tl-accent focus:ring-2 focus:ring-tl-accent/30"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="org-slug"
              className="text-xs font-medium uppercase tracking-wide text-tl-text-secondary"
            >
              Slug
            </label>
            <input
              id="org-slug"
              name="slug"
              type="text"
              disabled={isSubmitting}
              value={slug}
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(slugify(event.target.value));
              }}
              placeholder="my-startup"
              className="h-10 w-full rounded-lg border border-tl-border bg-tl-bg px-3 text-sm text-tl-text-primary outline-none placeholder:text-tl-text-muted focus:border-tl-accent focus:ring-2 focus:ring-tl-accent/30"
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-tl-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-3">
          <Link
            href="/orgs"
            className="rounded-lg border border-tl-border px-4 py-2 text-sm font-medium text-tl-text-secondary transition-colors hover:bg-tl-card-hover"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-tl-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-tl-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating..." : "Create organization"}
          </button>
        </div>
      </form>
    </div>
  );
}
