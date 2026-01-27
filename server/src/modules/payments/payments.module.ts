import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { CryptoUtils } from "src/utils/crypto.utils";
import { PaymentUtils } from "src/utils/payment.utils";

@Module({
    controllers: [PaymentsController],
    providers: [
        PaymentsService,
        PaymentUtils, CryptoUtils
    ]
})
export class PaymentsModule { }