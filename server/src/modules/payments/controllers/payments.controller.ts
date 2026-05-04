import { Body, Controller, Get, Ip, Post, Query, Req } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import type { Request } from 'express';

@Controller('api/payment')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    /**
     * IPN (Instant Payment Notification) callback từ Momo
     * Momo gọi vào endpoint này sau khi người dùng thanh toán
     */
    @Post("ipn/momo-service")
    async momoIpnCallback(@Req() request: Request) {
        const body = request.body;
        console.log("[Momo IPN] Received callback:", body);

        try {
            await this.paymentsService.handleMomoIpn(body);
        } catch (err) {
            console.error("[Momo IPN] Error handling callback:", err);
        }

        // Momo yêu cầu trả về 204 hoặc 200
        return { message: "ok" };
    }

    /**
     * Admin: lấy tất cả giao dịch với filter/sort/pagination
     */
    @Get("transactions")
    async getAllTransactions(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('paymentType') paymentType?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: string,
        @Query('search') search?: string,
    ) {
        return this.paymentsService.getAllTransactions({
            page: page ? parseInt(page, 10) : 1,
            limit: limit ? parseInt(limit, 10) : 20,
            paymentType,
            sortBy: sortBy as any,
            sortOrder: sortOrder as any,
            search,
        });
    }
}
