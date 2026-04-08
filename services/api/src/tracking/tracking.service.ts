import { Injectable } from '@nestjs/common';
import { TrackEventDto } from '@tracelite/common';
import { PrismaService } from '@tracelite/db';

@Injectable()
export class TrackingService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    async track(apiKey: string, trackEventDto: TrackEventDto) {
        const {
            method,
            endpoint,
            statusCode,
            latencyMs,
        } = trackEventDto;
        const request = await this.prisma.requestLog.create({
            data: {
                method,
                endpoint,
                statusCode,
                latencyMs,
                apiKeyId: apiKey
            }
        });

        return {
            status: "accepted",
            eventId: request?.id
        };
    }
}
