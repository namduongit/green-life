import { Controller, Get, Param, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { isGet, isCreate } from "src/utils/response.utils";
import { CreateOrderDto } from "./dto/create-order.dto";

@Controller('/api/orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Get()
    async getAll() {
        const result = await this.ordersService.getAllOrders();
        return isGet(result);
    }

    @Get('/:id')
    async getOrderById(@Param('id') id: string) {
        const result = await this.ordersService.getOrderById(id);
        return isGet(result);
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createOrder(@Body() createOrderDto: CreateOrderDto) {
        const result = await this.ordersService.createOrder(createOrderDto);
        return isCreate(result);
    }
}