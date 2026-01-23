import { Module } from "@nestjs/common";
import { CategoriesController } from "./categories.controller";
import { CategoriesService } from "./categories.service";
import { PrismaService } from "../../configs/prisma-client.config";

@Module({
    controllers: [CategoriesController],
    providers: [CategoriesService, PrismaService]
})
export class CategoriesModule {}
