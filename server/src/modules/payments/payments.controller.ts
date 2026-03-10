import { Controller, Get, Ip, Post, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import type { Request } from 'express';

@Controller('api/payment')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post("ipn/momo-service")
    async testingCallBack(@Req() request: Request) {
        console.log("Hello callback")
        console.log(request.body)
        this.paymentsService.paymentMomoIpn(request.body);
    }

    @Post("ipn/sepay-service")
    async sepayCallBack(@Req() request: Request) {
        const accessToken = request.headers.authorization;
        console.log(accessToken)
        console.log("Hello callback")
        console.log(request.body)
    }

    // @Post("momo/query")
    // async queryMomo(@Req() request: Request) {
    //     console.log("Momo query")
    //     const { orderId, lang } = request.body;
    //     const result = await this.paymentsService.paymentMomoQuery({ orderId: orderId as string, lang: lang as "vi" | "en" });
    //     return result;
    // }


    @Post("momo/create")
    async testingMomo() {
        console.log("Momo create")
        const result = await this.paymentsService.paymentMomoCreate(
            {
                extraData: { id: "69a4e592385e0c7aa6e68b8a", email: "nguyennamduong205@gmail.com" },
                lang: "vi",
                orderId: "69a4d2dfss2094sf6g6d1e44",
                orderInfo: "This is noi dung giao dich",
                total: 10000
            })
        return result;
    }
}
