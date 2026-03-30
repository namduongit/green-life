import { Module } from '@nestjs/common';
import { PrismaService } from 'src/configs/prisma-client.config';

@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class CommonModule {}
