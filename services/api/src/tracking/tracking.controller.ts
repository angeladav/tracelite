import { Body, Controller, Post, HttpCode, Req, UseGuards } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackEventDto } from '@tracelite/common';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';

@Controller('track')
export class TrackingController {
    constructor(private readonly trackingService: TrackingService) {}

    @Public()
    @UseGuards(ThrottlerGuard, ApiKeyGuard)
    @Post()
    @HttpCode(202)
    track(
        @Req() req: { apiKeyId: string; organizationId: string },
        @Body() trackEventDto: TrackEventDto,
    ) {
        return this.trackingService.track(req.apiKeyId, req.organizationId, trackEventDto);
    }
}
