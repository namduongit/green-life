import { Module } from '@nestjs/common';
import { CategoriesController } from './controllers/categories.controller';
import { CategoriesService } from './services/categories.service';
import { CommonModule } from '../common.module';

@Module({
    imports: [CommonModule],
    controllers: [CategoriesController],
    providers: [CategoriesService],
})
export class CategoriesModule {}
