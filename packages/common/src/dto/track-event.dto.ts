import {
  IsString,
  IsInt,
  IsOptional,
  IsObject,
  Min,
  Max,
  IsIn,
} from 'class-validator';
import type { JsonObject } from '../types/json-value';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;

export class TrackEventDto {
  @IsIn(HTTP_METHODS)
  method: string;

  @IsString()
  endpoint: string;

  @IsString()
  organizationId: string;

  @IsInt()
  @Min(100)
  @Max(599)
  statusCode: number;

  @IsInt()
  @Min(0)
  latencyMs: number;

  @IsOptional()
  @IsObject()
  metadata?: JsonObject;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
