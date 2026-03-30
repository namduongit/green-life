import { Module } from '@nestjs/common';
import { CommonModule } from '../common.module';
import { ProductsController } from './controllers/products.controller';
import { ProductsService } from './services/products.service';

@Module({
    imports: [CommonModule],
    controllers: [ProductsController],
    providers: [ProductsService],
    exports: [ProductsService],
})
export class ProductsModule {}
