import { Module } from '@nestjs/common';
import { TagsController } from './controllers/tags.controller';
import { TagsService } from './services/tags.service';
import { CommonModule } from '../common.module';

@Module({
    imports: [CommonModule],
    controllers: [TagsController],
    providers: [TagsService],
})
export class TagsModule {}
