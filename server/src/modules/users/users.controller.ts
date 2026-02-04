import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-dto';
import { UpdateUserDto } from './dto/update-dto';
import { CreateAddressDto } from '../addresses/dto/create-address-dto';
import { UpdateAddressDto } from '../addresses/dto/update-address-dto';
import { AddressesService } from '../addresses/addresses.service';
import { CartsService } from '../carts/carts.service';

@Controller('api/users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly addressesService: AddressesService,
        private readonly cartsService: CartsService,
    ) {}

    @Get()
    findAll(@Query() query: any) {
        return this.usersService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Post()
    create(@Body() data: CreateUserDto) {
        return this.usersService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdateUserDto) {
        return this.usersService.update(id, data);
    }

    @Delete(':id')
    deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }

    // ========== Addresses ==========

    @Get(':id/address')
    getAddress(@Param('id') id: string) {
        return this.addressesService.getAddress(id);
    }

    @Post(':id/address')
    addAddress(@Param('id') id: string, @Body() data: CreateAddressDto) {
        return this.addressesService.addAddress(id, data);
    }

    @Put(':id/address/:addressId')
    updateAddress(@Param('id') id: string, @Param('addressId') addressId: string, @Body() data: UpdateAddressDto) {
        return this.addressesService.updateAddress(id, addressId, data);
    }

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
}
