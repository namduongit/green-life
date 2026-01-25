import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/configs/prisma-client.config";

@Module({
    providers: [PrismaService, JwtService],
    exports: [PrismaService, JwtService]
})
export class CommonModule {}