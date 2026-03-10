import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CryptoUtils } from 'src/utils/crypto.utils';
import { CommonModule } from '../common.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
    imports: [CommonModule, OrdersModule],
    controllers: [PaymentsController],
    providers: [PaymentsService, CryptoUtils],
})
export class PaymentsModule {}
