import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CommonModule } from '../common.module';

@Module({
    imports: [CommonModule],
    controllers: [CategoriesController],
    providers: [CategoriesService],
})
export class CategoriesModule {}
