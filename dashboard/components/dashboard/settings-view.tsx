"use client";

import { useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { cn } from "@/lib/cn";

type KeyRow = {
  id: string;
  name: string;
  preview: string;
  created: string;
  lastUsed: string;
  revoked?: boolean;
};

const initialKeys: KeyRow[] = [
  {
    id: "1",
    name: "Production Key",
    preview: "tl_live_****7f2a",
    created: "Apr 1, 2026",
    lastUsed: "2 minutes ago",
  },
  {
    id: "2",
    name: "Staging Key",
    preview: "tl_live_****a3b1",
    created: "Apr 2, 2026",
    lastUsed: "3 hours ago",
  },
  {
    id: "3",
    name: "Old Key",
    preview: "tl_live_****d4e5",
    created: "Mar 20, 2026",
    lastUsed: "—",
    revoked: true,
  },
];

const demoFullKey =
  "tl_live_8a3f2b1c9d4e5f6a7b8c9d0e1f2a3b4c";

export function SettingsView() {
  const [keys, setKeys] = useState(initialKeys);
  const [createOpen, setCreateOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState("");

  function openCreate() {
    setNewKeyName("");
    setCreateOpen(true);
  }

  function submitCreate() {
    setCreateOpen(false);
    setCreatedKey(demoFullKey);
    setSuccessOpen(true);
    setKeys((prev) => [
      {
        id: crypto.randomUUID(),
        name: newKeyName.trim() || "Untitled",
        preview: `tl_live_****${demoFullKey.slice(-4)}`,
        created: "Apr 19, 2026",
        lastUsed: "Just now",
      },
      ...prev,
    ]);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-tl-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-tl-text-secondary">
          Organization profile and API keys.
        </p>
      </div>

      <section className="rounded-lg border border-tl-border bg-tl-card p-5">
        <h2 className="text-base font-semibold text-tl-text-primary">
          Organization
        </h2>
        <dl className="mt-5 space-y-4 text-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-tl-text-secondary">Name</dt>
            <dd className="font-medium text-tl-text-primary">My Startup</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-tl-text-secondary">Slug</dt>
            <dd className="font-code text-tl-text-primary">my-startup</dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-tl-text-secondary">Plan</dt>
            <dd className="flex flex-wrap items-center gap-3">
              <span className="rounded bg-tl-card-hover px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-tl-text-secondary">
                Free
              </span>
              <button
                type="button"
                className="text-sm font-medium text-tl-accent hover:text-tl-accent-hover"
              >
                Upgrade →
              </button>
            </dd>
          </div>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-tl-text-secondary">Created</dt>
            <dd className="text-tl-text-primary">March 15, 2026</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-tl-border bg-tl-card p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-tl-text-primary">API Keys</h2>
          <button
            type="button"
            onClick={openCreate}
            className="h-10 rounded-lg bg-tl-accent px-4 text-sm font-medium text-white transition-colors hover:bg-tl-accent-hover"
          >
            + Create New Key
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {keys.map((k) => (
            <div
              key={k.id}
              className="rounded-lg border border-tl-border bg-tl-bg p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1 space-y-1">
                  <p
                    className={cn(
                      "text-sm font-semibold text-tl-text-primary",
                      k.revoked && "text-tl-text-muted line-through",
                    )}
                  >
                    {k.name}
                    {k.revoked && (
                      <span className="ml-2 inline-flex rounded bg-tl-error/15 px-2 py-0.5 text-[11px] font-medium text-tl-error">
                        Revoked
                      </span>
                    )}
                  </p>
                  <p
                    className={cn(
                      "font-code text-sm",
                      k.revoked ? "text-tl-text-muted" : "text-tl-text-secondary",
                    )}
                  >
                    {k.preview}
                  </p>
                  <div className="flex flex-wrap gap-x-4 text-xs text-tl-text-muted">
                    <span>Created: {k.created}</span>
                    <span>Last used: {k.lastUsed}</span>
                  </div>
                </div>
                {!k.revoked && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-tl-border px-3 text-xs font-medium text-tl-text-secondary transition-colors hover:bg-tl-card-hover hover:text-tl-text-primary"
                    >
                      <Copy className="size-3.5" strokeWidth={1.75} />
                      Copy
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center rounded-lg border border-tl-border px-3 text-xs font-medium text-tl-error transition-colors hover:bg-tl-error/10"
                    >
                      Revoke
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {createOpen && (
        <ModalOverlay onClose={() => setCreateOpen(false)}>
          <div className="w-full max-w-[480px] rounded-lg border border-tl-border bg-tl-card p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-base font-semibold text-tl-text-primary">
                Create API Key
              </h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="rounded-lg p-1 text-tl-text-muted hover:bg-tl-card-hover hover:text-tl-text-primary"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-4 space-y-2">
              <label className="text-xs font-medium text-tl-text-secondary">
                Key Name
              </label>
              <input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production, Staging"
                className="h-10 w-full rounded-lg border border-tl-border bg-tl-bg px-3 text-sm text-tl-text-primary outline-none placeholder:text-tl-text-muted focus:border-tl-accent focus:ring-2 focus:ring-tl-accent/30"
              />
              <p className="text-xs text-tl-text-secondary">
                This key will have access to send tracking events for your
                organization.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="h-10 rounded-lg border border-tl-border px-4 text-sm font-medium text-tl-text-secondary transition-colors hover:bg-tl-card-hover hover:text-tl-text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitCreate}
                className="h-10 rounded-lg bg-tl-accent px-4 text-sm font-medium text-white hover:bg-tl-accent-hover"
              >
                Create Key
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}

      {successOpen && (
        <ModalOverlay onClose={() => setSuccessOpen(false)}>
          <div className="w-full max-w-[480px] rounded-lg border border-tl-border bg-tl-card p-5 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-tl-success/15 text-tl-success">
                <Check className="size-5" strokeWidth={2} />
              </span>
              <h3 className="text-base font-semibold text-tl-text-primary">
                API Key Created
              </h3>
            </div>
            <div className="mt-5 space-y-3">
              <p className="text-sm text-tl-text-secondary">Your new API key:</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <code className="block flex-1 overflow-x-auto rounded-lg border border-tl-border bg-tl-bg px-3 py-2 font-code text-sm text-tl-text-primary">
                  {createdKey}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(createdKey)}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-tl-border px-3 text-xs font-medium text-tl-text-secondary hover:bg-tl-card-hover hover:text-tl-text-primary"
                >
                  <Copy className="size-3.5" strokeWidth={1.75} />
                  Copy
                </button>
              </div>
              <div className="rounded-lg border border-tl-warning/40 bg-tl-warning/10 p-3 text-xs text-tl-warning">
                Make sure to copy your API key now. You won&apos;t be able to see
                it again.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSuccessOpen(false)}
              className="mt-6 h-10 w-full rounded-lg bg-tl-accent text-sm font-medium text-white hover:bg-tl-accent-hover"
            >
              Done
            </button>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}

function ModalOverlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative z-[101]">{children}</div>
    </div>
  );
}
