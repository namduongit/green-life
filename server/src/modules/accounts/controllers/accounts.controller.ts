import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AccountsService } from '../services/accounts.service';
import { AddressesService } from '../../addresses/services/addresses.service';
import { CartsService } from '../../carts/services/carts.service';
import { CreateAccountDto, QueryAccountDto, UpdateAccountDto } from '../dto/requests/request.dto';
import { CreateAddressDto, UpdateAddressDto } from 'src/modules/addresses/dto/requests/request.dto';
import { OrdersService } from 'src/modules/orders/services/orders.service';

@Controller('api/users')
export class AccountsController {
    constructor(
        private readonly usersService: AccountsService,
        private readonly addressesService: AddressesService,
        private readonly cartsService: CartsService,
        private readonly ordersService: OrdersService,
    ) {}

    @Get()
    findAll(@Query(new QueryAccountDto()) query: any) {
        return this.usersService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Post()
    create(@Body() data: CreateAccountDto) {
        return this.usersService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdateAccountDto) {
        return this.usersService.update(id, data);
    }

    // @Delete(':id')
    // deleteUser(@Param('id') id: string) {
    //     return this.usersService.deActivate(id);
    // }

    @Patch(':id/activate')
    activateUser(@Param('id') id: string) {
        return this.usersService.activate(id);
    }

    @Patch(':id/lock')
    lockUser(@Param('id') id: string) {
        return this.usersService.lockAccount(id);
    }

    @Patch(':id/reset-password')
    resetPassword(@Param('id') id: string, @Body() body: { newPassword: string }) {
        return this.usersService.resetPassword(id, body.newPassword);
    }

    // ========== Addresses ==========
    // Get all addresses for a user: GET /api/users/:id/address
    @Get(':id/address')
    getAddresses(@Param('id') id: string) {
        return this.addressesService.getAddresses(id);
    }
    // Get a specific address by ID: GET /api/users/:id/address/:addressId
    @Get(':id/address/:addressId')
    getAddressById(@Param('id') id: string, @Param('addressId') addressId: string) {
        return this.addressesService.getAddressById(id, addressId);
    }
    // Add a new address for a user: POST /api/users/:id/address
    @Post(':id/address')
    addAddress(@Param('id') id: string, @Body() data: CreateAddressDto) {
        return this.addressesService.createAddress(id, data);
    }
    // Update an existing address: PUT /api/users/:id/address/:addressId
    @Put(':id/address/:addressId')
    updateAddress(@Param('id') id: string, @Param('addressId') addressId: string, @Body() data: UpdateAddressDto) {
        return this.addressesService.updateAddress(id, addressId, data);
    }
    // Delete an address: DELETE /api/users/:id/address/:addressId
    @Delete(':id/address/:addressId')
    deleteAddress(@Param('id') id: string, @Param('addressId') addressId: string) {
        return this.addressesService.deleteAddress(id, addressId);
    }

    // ========== Carts ==========

    @Get(':id/cart')
    getCart(@Param('id') id: string) {
        return this.cartsService.getCartItems(id);
    }

    @Post(':id/cart')
    addToCart(@Param('id') id: string, @Body() data: { productId: string; quantity: number }) {
        return this.cartsService.addItemToCart(id, data.productId, data.quantity);
    }

    @Delete(':id/cart/:productId')
    removeFromCart(@Param('id') id: string, @Param('productId') productId: string) {
        return this.cartsService.removeItemFromCart(id, productId);
    }

    @Delete(':id/cart')
    clearCart(@Param('id') id: string) {
        return this.cartsService.clearCart(id);
    }

    // ========== Orders ==========
    @Get(':id/orders')
    getOrders(@Param('id') id: string) {
        return this.ordersService.getOrdersByAccountId(id);
    }

    @Get(':id/orders/:orderId')
    getOrderById(@Param('id') id: string, @Param('orderId') orderId: string) {
        return this.ordersService.getOrderById(orderId);
    }

    @Get(':id/checkout-history')
    getCheckoutHistory(@Param('id') id: string) {
        return this.ordersService.getCheckoutHistoryByAccount(id);
    }
}
