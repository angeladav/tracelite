import { OrgDashboardShell } from "@/components/dashboard/org-dashboard-shell";
import type { OrgSummary } from "@/types/org";
import { demoOrgName } from "@/lib/demo-orgs";

const demoOrgs: OrgSummary[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "My Startup",
    slug: "my-startup",
  },
  { id: "00000000-0000-4000-8000-000000000002", name: "Contoso", slug: "contoso" },
];

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const orgName = demoOrgName(orgId);

  return (
    <OrgDashboardShell orgId={orgId} orgName={orgName} orgs={demoOrgs}>
      {children}
    </OrgDashboardShell>
  );
}
