import { Module } from "@nestjs/common";
import { TagsController } from "./tags.controller";
import { TagsService } from "./tags.service";
import { CommonModule } from "../common.module";

@Module({
    imports: [CommonModule],
    controllers: [TagsController],
    providers: [TagsService]
})
export class TagsModule {}