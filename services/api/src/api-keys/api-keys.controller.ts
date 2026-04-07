import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { ApiKeyDto } from './dto/api-key.dto';

@Controller('organizations/:orgId/api-keys')
export class ApiKeysController {
    constructor(
        private readonly apiKeysService: ApiKeysService
    ) { }

    @Post()
    generateKey(@Param('orgId') orgId: string, @Body() apiKeyDto: ApiKeyDto, @Req() req) {
        return this.apiKeysService.generateKey(orgId, apiKeyDto, req.user.userId);
    }

    @Get()
    getKeys(@Param('orgId') orgId: string, @Req() req) {
        return this.apiKeysService.getKeys(orgId, req.user.userId);
    }

    @Delete(':id')
    deleteKey(@Param('orgId') orgId: string, @Param('id') id: string, @Req() req) {
        return this.apiKeysService.deleteKey(orgId, id, req.user.userId);
    }
}
