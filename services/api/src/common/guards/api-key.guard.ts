
import { Injectable, ExecutionContext, CanActivate, UnauthorizedException } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Observable } from 'rxjs';
import { PrismaService } from '@tracelite/db';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const key = request.headers['x-api-key'];

        if (!key) throw new UnauthorizedException('Missing API key');

        const apiKeyRow = await this.prisma.apiKey.findUnique({
            where: {
                key
            }
        });

        if (!apiKeyRow || apiKeyRow.revoked) throw new UnauthorizedException('Invalid API key');

        request['apiKeyId'] = apiKeyRow.id;
        request['organizationId'] = apiKeyRow.organizationId;
        return true;
    }

}