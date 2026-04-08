import { Body, Controller, Post, Headers, HttpCode, UseGuards, Req } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackEventDto } from '@tracelite/common';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';

@Controller('track')
export class TrackingController {

    constructor(
        private readonly trackingService: TrackingService
    ) { }

    @UseGuards(ApiKeyGuard)
    @Post()
    @HttpCode(202)
    track(@Req() req, @Body() trackEventDto: TrackEventDto) {
        return this.trackingService.track(req.apiKeyId, trackEventDto);
    }

}
