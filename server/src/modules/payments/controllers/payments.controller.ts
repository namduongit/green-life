import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import type { Request } from 'express';

@Controller('api/payment')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    /**
     * IPN (Instant Payment Notification) callback từ Momo
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

        return { message: "ok" };
    }

    /**
     * IPN callback từ SePay
     * body.description = orderId của đơn hàng
     */
    @Post("ipn/sepay-service")
    async sepayIpnCallback(@Req() request: Request) {
        const header = request.headers['authorization'];
        const body = request.body;

        console.log("[Sepay IPN] Received callback:", header, body);

        try {
            await this.paymentsService.handleSepayIpn(body);
        } catch (err) {
            console.error("[Sepay IPN] Error handling callback:", err);
        }

        // SePay yêu cầu 200 với success=true
        return { success: true };
    }

    /**
     * Kiểm tra trạng thái thanh toán của đơn hàng
     * GET /api/payment/orders/:orderId/payment-status
     */
    @Get("orders/:orderId/payment-status")
    async checkPaymentStatus(@Param('orderId') orderId: string) {
        return this.paymentsService.getOrderPaymentStatus(orderId);
    }

    /**
     * Tạo lại URL thanh toán cho đơn hàng chưa thanh toán
     * POST /api/payment/orders/:orderId/repay
     */
    @Post("orders/:orderId/repay")
    async repayOrder(
        @Param('orderId') orderId: string,
        @Body() body: { accountId: string; email: string },
    ) {
        return this.paymentsService.regeneratePaymentUrl(orderId, body.accountId, body.email);
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
