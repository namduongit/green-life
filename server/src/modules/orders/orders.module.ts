import { Module } from '@nestjs/common';
import { CommonModule } from '../common.module';
import { OrdersController } from './controllers/orders.controller';
import { OrdersService } from './services/orders.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
    imports: [CommonModule, PaymentsModule],
    controllers: [OrdersController],
    providers: [OrdersService],
    exports: [OrdersService],
})
export class OrdersModule {}
