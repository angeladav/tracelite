import { redirect } from "next/navigation";
import { orgOverviewPath } from "@/lib/routes";

type Props = {
  params: Promise<{ orgId: string }>;
};

export default async function OrgIndexPage({ params }: Props) {
  const { orgId } = await params;
  redirect(orgOverviewPath(orgId));
}
