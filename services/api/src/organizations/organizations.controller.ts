import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { OrganizationDto } from './dto/organization.dto';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
    constructor(private readonly organizationsService: OrganizationsService) { }

    @Post()
    createOrg(@Body() organizationDto: OrganizationDto, @Req() req) {
        return this.organizationsService.createOrg(organizationDto, req.user.userId);
    }

    @Get()
    getOrg(@Req() req) {
        return this.organizationsService.getOrgs(req.user.userId);
    }

}
