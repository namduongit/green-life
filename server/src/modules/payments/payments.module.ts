import { Module } from '@nestjs/common';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentsService } from './services/payments.service';
import { CryptoUtils } from 'src/utils/crypto.utils';
import { CommonModule } from '../common.module';

@Module({
    imports: [CommonModule],
    controllers: [PaymentsController],
    providers: [PaymentsService, CryptoUtils],
    exports: [PaymentsService],
})
export class PaymentsModule {}
