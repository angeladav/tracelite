import { BadRequestException, Injectable } from '@nestjs/common';
import { TrackEventDto } from '@tracelite/common';
import { PrismaService } from '@tracelite/db';
import { randomUUID } from 'crypto';
import { QueueService } from '../queue/queue.service';

@Injectable()
export class TrackingService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly queueService: QueueService,
    ) {}

    async track(apiKeyId: string, organizationId: string, trackEventDto: TrackEventDto) {
        if (
            trackEventDto.organizationId !== undefined &&
            trackEventDto.organizationId !== organizationId
        ) {
            throw new BadRequestException('organizationId does not match API key');
        }

        const eventId = randomUUID();
        const { method, endpoint, statusCode, latencyMs } = trackEventDto;

        const trackData = {
            id: eventId,
            method,
            endpoint,
            statusCode,
            latencyMs,
            apiKeyId: apiKeyId,
            organizationId,
            idempotencyKey: trackEventDto.idempotencyKey,
            metadata: trackEventDto.metadata,
        };

        const enqueued = await this.queueService.enqueue(trackData);
        const response = { status: 'accepted' as const, eventId };

        if (enqueued) {
            return response;
        }

        const request = await this.prisma.requestLog.create({
            data: trackData,
        });

        return { status: 'accepted', eventId: request.id };
    }
}
