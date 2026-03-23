import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req } from "@nestjs/common";
import { OrdersService } from "../services/orders.service";

@Controller('/api/orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Get()
    async getAll() {
        const result = await this.ordersService.getAllOrders();
        return result;
    }

    @Get('/:id')
    async getOrderById(@Param('id') id: string) {
        const result = await this.ordersService.getOrderById(id);
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