'use client';

import Link from "next/link";
import type { OrgSummary } from "@/types/org";
import { orgCreatePath, orgPath } from "@/lib/routes";
import { useEffect, useState } from "react";

export default function OrgsPage() {
  const [orgs, setOrgs] = useState<OrgSummary[]>([]);

  useEffect(() => {
    fetch("/api/orgs")
      .then(response => response.json())
      .then(response => {
        setOrgs(response);
        console.log(response);
      })
      .catch(error => console.log(error))
  }, []); 



  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-semibold text-tl-text-primary">
        Organizations
      </h1>
      <p className="mt-1 text-sm text-tl-text-secondary">
        Choose an organization to open the dashboard.
      </p>
      <ul className="mt-8 divide-y divide-tl-border rounded-lg border border-tl-border bg-tl-card">
        {orgs.map((org) => (
          <li key={org.id}>
            <Link
              href={orgPath(org.id)}
              className="flex items-center justify-between gap-4 px-5 py-4 text-sm transition-colors hover:bg-tl-card-hover"
            >
              <span className="font-medium text-tl-text-primary">{org.name}</span>
              <span className="font-code text-tl-text-secondary">{org.slug}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={orgCreatePath()}
        className="mt-8 inline-flex items-center justify-center rounded-lg bg-tl-accent px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-tl-accent-hover"
      >
        Create organization
      </Link>
    </div>
  );
}
