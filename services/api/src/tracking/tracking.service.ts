import { Injectable } from '@nestjs/common';
import { TrackEventDto } from '@tracelite/common';
import { PrismaService } from '@tracelite/db';
import { QueueService } from 'src/queue/queue.service';

@Injectable()
export class TrackingService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly queueService: QueueService
    ) { }

    async track(apiKey: string, trackEventDto: TrackEventDto) {
        const {
            method,
            endpoint,
            statusCode,
            latencyMs,
            organizationId
        } = trackEventDto;

        const trackData = {
            method,
            endpoint,
            statusCode,
            latencyMs,
            apiKeyId: apiKey,
            organizationId,
            idempotencyKey: trackEventDto.idempotencyKey,
            metadata: trackEventDto.metadata,
        };

        const res = await this.queueService.enqueue(trackData);

        if (res) return;

        const request = await this.prisma.requestLog.create({
            data: trackData
        });

        return {
            status: "accepted",
            eventId: request?.id
        };
    }
}
