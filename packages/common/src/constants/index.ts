export const API_VERSION = 'v1';

export const API_KEY_PREFIX_LIVE = 'tl_live_';
export const API_KEY_PREFIX_TEST = 'tl_test_';

export const RATE_LIMITS = {
  FREE: { tracking: 100, dashboard: 30 },
  PRO: { tracking: 1000, dashboard: 100 },
  ENTERPRISE: { tracking: 10000, dashboard: 500 },
} as const;

export const RETENTION_DAYS = {
  FREE: 7,
  PRO: 30,
  ENTERPRISE: 90,
} as const;

export const REDIS_KEYS = {
  FALLBACK_EVENTS: 'tracelite:fallback:events',
  RATE_LIMIT_PREFIX: 'tracelite:ratelimit:',
} as const;

export const ERROR_CODES = {
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INVALID_API_KEY: 'INVALID_API_KEY',
  API_KEY_REVOKED: 'API_KEY_REVOKED',
  API_KEY_EXPIRED: 'API_KEY_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;
