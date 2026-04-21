import { Injectable } from '@nestjs/common';
import { PrismaService } from '@tracelite/db';
import { OrganizationDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async createOrg(organizationDto: OrganizationDto, userId: string) {
        const name = organizationDto.name;
        const doesOrgAlreadyExist = await this.prisma.organization.findUnique({ where: { name } });
        if (doesOrgAlreadyExist) throw new Error('Organization already exists');
        const slug = name.toLowerCase().trim().replace(/\s+/g, '-');
        await this.prisma.organization.create({
            data: {
                name,
                slug,
                memberships: {
                    create: {
                        userId,
                        role: 'OWNER'
                    }
                }
            }
        });
    }

    async getOrgs(userId: string) {
        const organizations = await this.prisma.organization.findMany({
            where: {
                memberships: {
                    some: {
                        userId: userId
                    }
                }
            }
        });

        return organizations;
    }
}
