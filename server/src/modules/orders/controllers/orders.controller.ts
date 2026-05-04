import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, Query } from "@nestjs/common";
import { OrdersService } from "../services/orders.service";

@Controller('/api/orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Get()
    async getAll(@Query('status') status?: string) {
        const result = await this.ordersService.getAllOrders(status as any);
        return result;
    }

    @Get('/:id')
    async getOrderById(@Param('id') id: string) {
        const result = await this.ordersService.getOrderById(id);
        return result;
    }

    @Get('/:id/payment-status')
    async getPaymentStatus(@Param('id') id: string) {
        const result = await this.ordersService.getPaymentStatus(id);
        return result;
    }

    @Patch('/:id/advance-status')
    async advanceStatus(@Param('id') id: string) {
        const result = await this.ordersService.advanceOrderStatus(id);
        return result;
    }

    @Patch('/:id/cancel')
    async cancelOrder(@Param('id') id: string) {
        const result = await this.ordersService.cancelOrder(id);
        return result;
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createOrder(@Req() req, @Body() body) {
        const accountId = req.user.sub.uid;
        const result = await this.ordersService.createOrder(accountId, body);
        return result;
    }
}