import { Controller, Get, Query, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { OverviewDto, RequestsDto, TimeseriesDto } from './dto/analytics.dto';

@Controller('analytics')
export class AnalyticsController {

    constructor(
        private analyticsService: AnalyticsService
    ){}

    @Get('overview')
    async getOverview(@Req() req, @Query() overviewDto: OverviewDto) {
        return await this.analyticsService.getOverview(req.user.userId, overviewDto.organizationId);
    }

    @Get('requests')
    async getRequests(@Req() req, @Query() requestsDto: RequestsDto) {
        return await this.analyticsService.getRequests(req.user.userId, requestsDto);
    }

    @Get('endpoints')
    async getEndpoints(@Req() req, @Query() endpointsDto: OverviewDto) {
        return await this.analyticsService.getEndpoints(req.user.userId, endpointsDto.organizationId);
    }

    @Get('timeseries')
    async getTimeseries(@Req() req, @Query() timeseriesDto: TimeseriesDto) {
        return await this.analyticsService.getTimeseries(req.user.userId, timeseriesDto);
    }

}
