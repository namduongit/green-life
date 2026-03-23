import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';
import { CryptoUtils } from 'src/utils/crypto.utils';
@Module({
    controllers: [PaymentsController],
    providers: [PaymentsService, CryptoUtils],
})
export class PaymentsModule {}
