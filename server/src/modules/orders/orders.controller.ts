import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

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
    async createOrder(@Body() createOrderDto: CreateOrderDto) {
        const result = await this.ordersService.createOrder(createOrderDto);
        return result;
    }
}