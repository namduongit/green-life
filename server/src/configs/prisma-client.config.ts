import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'prisma/generated/client';

@Injectable()
export class PrismaService {
    public prismaClient: PrismaClient;

    constructor() {
        this.prismaClient = new PrismaClient();
    }
}
