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
    }

    // @Get("")
    // async testingMomo() {
    //     const items = [
    //         {
    //             id: "69a4d2df25094f6261733e6d",
    //             name: "Electronic Silk Sausages",
    //             description: "Professional-grade Chips perfect for confused training and recreational use",
    //             imageUrl: "https://picsum.photos/seed/2mF5idk/400/400",
    //             price: 130000,
    //             quantity: 3,
    //             unit: "Gram",
    //             totalPrice: 390000
    //         },
    //         {
    //             id: "69a4d2df25094f6261733e7e",
    //             name: "Generic Bronze Chicken",
    //             description: "Innovative Computer featuring wrathful technology and Rubber construction",
    //             imageUrl: "https://picsum.photos/seed/5SFXGXd/400/400",
    //             price: 150000,
    //             quantity: 2,
    //             unit: "Gram",
    //             totalPrice: 300000
    //         }
    //     ];

    // const result = await this.paymentsService.paymentMomoCreate({
    //     extraData: { id: "69a4e592385e0c7aa6e68b8a", email: "nguyennamduong205@gmail.com" },
    //     lang: "vi",
    //     orderId: "69a4d2dfss2094sf66d173e44",
    //     orderInfo: "This is noi dung giao dich",
    //     total: 10000,
    //         items: items, deliveryInfo: { deliveryAddress: "To 12, KP Phu My, phuong Xuan Lap, tinh Dong Nai", deliveryFee: "20000", quantity: "1" } })
    //     return result;
    // }
}
