import {
  IsString,
  IsInt,
  IsOptional,
  IsObject,
  Min,
  Max,
  IsIn,
} from 'class-validator';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;

export class TrackEventDto {
  @IsIn(HTTP_METHODS)
  method: string;

  @IsString()
  endpoint: string;

  @IsInt()
  @Min(100)
  @Max(599)
  statusCode: number;

  @IsInt()
  @Min(0)
  latencyMs: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
