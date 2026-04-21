export function orgOverviewPath(orgId: string) {
  return `/orgs/${orgId}/overview`;
}

export function orgRequestsPath(orgId: string) {
  return `/orgs/${orgId}/requests`;
}

export function orgEndpointsPath(orgId: string) {
  return `/orgs/${orgId}/endpoints`;
}

export function orgSettingsPath(orgId: string) {
  return `/orgs/${orgId}/settings`;
}

/** Org picker / default entry — lands on overview. */
export function orgPath(orgId: string) {
  return orgOverviewPath(orgId);
}

export function orgCreatePath() {
  return "/orgs/new";
}
