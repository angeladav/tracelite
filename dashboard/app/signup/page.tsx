'use client';

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SignupErrorMessage = {
  message?: string
};

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/auth/signup", {
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
        message?: Partial<SignupErrorMessage>;
      };

      if (!response.ok) {
        setError(
          payload?.message?.message ?? "Could not create account.",
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
        <p className="text-base text-tl-text-secondary">Create your account</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-medium uppercase tracking-wide text-tl-text-secondary"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="h-10 w-full rounded-lg border border-tl-border bg-tl-bg px-3 text-sm text-tl-text-primary outline-none placeholder:text-tl-text-muted focus:border-tl-accent focus:ring-2 focus:ring-tl-accent/30"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              required
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
              name="password"
              type="password"
              autoComplete="new-password"
              className="h-10 w-full rounded-lg border border-tl-border bg-tl-bg px-3 text-sm text-tl-text-primary outline-none placeholder:text-tl-text-muted focus:border-tl-accent focus:ring-2 focus:ring-tl-accent/30"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="confirm"
              className="text-xs font-medium uppercase tracking-wide text-tl-text-secondary"
            >
              Confirm password
            </label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              className="h-10 w-full rounded-lg border border-tl-border bg-tl-bg px-3 text-sm text-tl-text-primary outline-none placeholder:text-tl-text-muted focus:border-tl-accent focus:ring-2 focus:ring-tl-accent/30"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isSubmitting}
              required
              minLength={6}
            />
          </div>
          {error ? (
            <p className="text-sm text-tl-error" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="h-10 w-full rounded-lg bg-tl-accent text-sm font-medium text-white transition-colors hover:bg-tl-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>
        </form>
        <div className="my-6 h-px bg-tl-border" />
        <p className="text-center text-sm text-tl-text-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-tl-accent hover:text-tl-accent-hover"
          >
            Log in →
          </Link>
        </p>
      </div>
    </div>
  );
}
