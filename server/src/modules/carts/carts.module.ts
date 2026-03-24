import { Module } from '@nestjs/common';
import { CommonModule } from '../common.module';
import { CartsService } from './services/carts.service';

@Module({
    imports: [CommonModule],
    providers: [CartsService],
    exports: [CartsService],
})
export class CartsModule {}
