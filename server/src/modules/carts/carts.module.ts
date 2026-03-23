import { Module } from '@nestjs/common';
import { CartsService } from './services/carts.service';
import { CommonModule } from '../common.module';

@Module({
    providers: [CartsService],
    imports: [CommonModule],
    exports: [CartsService],
})
export class CartsModule {}
