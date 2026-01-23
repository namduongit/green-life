import { Module } from "@nestjs/common";
import { TagsController } from "./tags.controller";
import { TagsService } from "./tags.service";
import { PrismaService } from "../../configs/prisma-client.config";

@Module({
    controllers: [TagsController],
    providers: [TagsService, PrismaService]
})
export class TagsModule {}