/** Demo display names keyed by org id until API wiring exists. */
export const DEMO_ORG_NAMES: Record<string, string> = {
  "00000000-0000-4000-8000-000000000001": "My Startup",
  "00000000-0000-4000-8000-000000000002": "Contoso",
};

export function demoOrgName(orgId: string) {
  return DEMO_ORG_NAMES[orgId] ?? "My Startup";
}
