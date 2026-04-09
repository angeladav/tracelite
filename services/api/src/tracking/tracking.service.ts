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
        } = trackEventDto;

        const trackData = {
            method,
            endpoint,
            statusCode,
            latencyMs,
            apiKeyId: apiKey
        };

        const res = await this.queueService.enqueue(trackData);

        if (res) return;

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
