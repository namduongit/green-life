import { Controller, Get, Ip, Post, Req } from "@nestjs/common";
import { PaymentsService } from "./payments.service";

@Controller("api/payment")
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Get("return-url")
    async callIpn() {
        console.log("Server call to server")
    }

    @Post("vnpay")
    async callVnpay(@Ip() idAddress) {
        this.paymentsService.callVnpay(idAddress, {
            id: "namduongit",
            totalAmount: 2000000
        })
    }

    @Post("momo")
    async callMomo() {
        this.paymentsService.callMomo({
             id: "namduongit",
            totalAmount: 2000000
        })
    }
}