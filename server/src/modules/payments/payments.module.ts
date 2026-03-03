import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { CryptoUtils } from 'src/utils/crypto.utils';
@Module({
    controllers: [PaymentsController],
    providers: [PaymentsService, CryptoUtils],
})
export class PaymentsModule {}
