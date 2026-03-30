import { Module } from '@nestjs/common';
import { CommonModule } from '../common.module';
import { TagsController } from './controllers/tags.controller';
import { TagsService } from './services/tags.service';

@Module({
    imports: [CommonModule],
    controllers: [TagsController],
    providers: [TagsService],
    exports: [TagsService],
})
export class TagsModule {}
