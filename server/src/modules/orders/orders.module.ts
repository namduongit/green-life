import { Module } from '@nestjs/common';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { CommonModule } from '../common.module';

@Module({
    controllers: [OrdersController],
    providers: [OrdersService],
    imports: [CommonModule]
})
export class OrdersModule {}
