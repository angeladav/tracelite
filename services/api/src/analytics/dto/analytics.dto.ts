import { AggPeriod } from "@tracelite/common";
import { Type } from "class-transformer";
import {
    IsEnum,
    IsISO8601,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min
} from "class-validator";

export class OverviewDto {
    @IsUUID()
    organizationId!: string;
}

export class RequestsDto {
    @IsUUID()
    organizationId!: string;

    @IsOptional()
    @IsString()
    endpoint?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    status?: number;

    @IsISO8601()
    from!: string;

    @IsISO8601()
    to!: string;

    @IsOptional()
    @IsUUID()
    cursor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    take?: number;
}

export class TimeseriesDto {
    @IsUUID()
    organizationId!: string;

    @IsEnum(AggPeriod)
    period: AggPeriod;

    @IsISO8601()
    from!: string;

    @IsISO8601()
    to!: string;
}