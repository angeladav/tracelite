import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@tracelite/db';

@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class DatabaseModule { }