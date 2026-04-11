import type { JsonObject } from './json-value';

export type { JsonObject, JsonValue } from './json-value';

export interface TrackingEvent {
  apiKeyId: string;
  organizationId: string;
  method: string;
  endpoint: string;
  statusCode: number;
  latencyMs: number;
  userAgent?: string;
  ipAddress?: string;
  metadata?: JsonObject;
  idempotencyKey?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  retryAfter?: number;
}

export type QueueDriver = 'redis' | 'sqs';

export enum MemberRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum PlanType {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export enum AggPeriod {
  MINUTE = 'MINUTE',
  HOUR = 'HOUR',
  DAY = 'DAY',
}
