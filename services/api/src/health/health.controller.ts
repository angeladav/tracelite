import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '@tracelite/db';
import { Public } from '../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
    constructor(private readonly prisma: PrismaService) {}

    @Public()
    @Get()
    async getHealth() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return { status: 'ok', db: 'connected' };
        } catch {
            throw new ServiceUnavailableException({
                status: 'error',
                db: 'disconnected',
            });
        }
    }
}
