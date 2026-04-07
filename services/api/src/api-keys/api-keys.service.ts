import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '@tracelite/db';
import { randomBytes } from 'crypto';
import { ApiKeyDto } from './dto/api-key.dto';

@Injectable()
export class ApiKeysService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    async generateKey(orgId: string, apiKeyDto: ApiKeyDto, userId: string) {
        await this.isUserInOrg(orgId, userId);

        const hex = randomBytes(16).toString('hex');
        const key = `tl_live_${hex}`;
        const name = apiKeyDto.name;

        await this.prisma.apiKey.create({
            data: {
                name,
                key,
                organization: {
                    connect: {
                        id: orgId
                    }
                }
            }
        });
        return key;
    }

    async getKeys(orgId: string, userId: string) {
        await this.isUserInOrg(orgId, userId);
        const keys = await this.prisma.apiKey.findMany({
            where: {
                organizationId: orgId,
                revoked: false
            }
        });
        return keys;
    }

    async deleteKey(orgId: string, id: string, userId: string) {
        await this.isUserInOrg(orgId, userId);

        await this.prisma.apiKey.delete({
            where: {
                id
            }
        });
    }

    async isUserInOrg(orgId: string, userId: string) {
        const isMember = await this.prisma.membership.findUnique(
            {
                where: {
                    userId_organizationId: {
                        userId, organizationId: orgId
                    }
                }
            }
        );

        if (!isMember) throw new ForbiddenException();
    }
}
