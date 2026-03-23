import { Module } from '@nestjs/common';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';
import { CommonModule } from '../common.module';

@Module({
    controllers: [ProductsController],
    providers: [ProductsService],
    imports: [CommonModule],
})
export class ProductsModule {}
