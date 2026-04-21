'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

type LoginErrorMessage = {
  message?: string
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    
    const normalizedEmail = email.trim();

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: Partial<LoginErrorMessage>;
      };

      if (!response.ok) {
        console.log(payload);
        setError(
          payload?.message?.message ?? "Could not login.",
        );
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
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-tl-bg px-4 py-16">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xl font-bold text-tl-text-primary"
        >
          <span aria-hidden>⚡</span>
          TraceLite
        </Link>
      </div>
      <div className="w-full max-w-[400px] rounded-lg border border-tl-border bg-tl-card p-6">
        <p className="text-base text-tl-text-secondary">Log in to your account</p>
        <form className="mt-6 space-y-4" action="#" method="post" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-wide text-tl-text-secondary"
            >
              Email
            </label>
            <input
              id="email"
              disabled={isSubmitting}
              name="email"
              type="email"
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="h-10 w-full rounded-lg border border-tl-border bg-tl-bg px-3 text-sm text-tl-text-primary outline-none placeholder:text-tl-text-muted focus:border-tl-accent focus:ring-2 focus:ring-tl-accent/30"
              placeholder="you@company.com"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-xs font-medium uppercase tracking-wide text-tl-text-secondary"
            >
              Password
            </label>
            <input
              id="password"
              disabled={isSubmitting}
              name="password"
              type="password"
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
              className="h-10 w-full rounded-lg border border-tl-border bg-tl-bg px-3 text-sm text-tl-text-primary outline-none placeholder:text-tl-text-muted focus:border-tl-accent focus:ring-2 focus:ring-tl-accent/30"
              placeholder="••••••••"
            />
          </div>
          {error ? (
            <p className="text-sm text-tl-error" role="alert">
              {error}
            </p>
          ) : null}
          <button
            disabled={isSubmitting}
            type="submit"
            className="h-10 w-full rounded-lg bg-tl-accent text-sm font-medium text-white transition-colors hover:bg-tl-accent-hover"
          >
            Log In
          </button>
        </form>
        <div className="my-6 h-px bg-tl-border" />
        <p className="text-center text-sm text-tl-text-secondary">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-tl-accent hover:text-tl-accent-hover"
          >
            Sign up →
          </Link>
        </p>
      </div>
    </div>
  );
}
