import { Injectable, NotFoundException } from '@nestjs/common';
import { CartItems, Products, Properties } from 'prisma/generated/client';
import { PrismaService } from 'src/configs/prisma-client.config';
import { CartRep } from '../dto/responses/carts-response.dto';

type CartItemWithProduct = CartItems & {
    product: Products & {
        property: Properties | null;
    };
};

const CART_ITEM_INCLUDE = {
    product: {
        include: {
            property: true,
        },
    },
};

@Injectable()
export class CartsService {
    constructor(private readonly prismaService: PrismaService) {}

    async clearCart(userId: string): Promise<CartRep[]> {
        const items = await this.prismaService.prismaClient.cartItems.findMany({
            where: { cart: { accountId: userId } },
            include: CART_ITEM_INCLUDE,
        });

        await this.prismaService.prismaClient.cartItems.deleteMany({
            where: { cart: { accountId: userId } },
        });

        return items.map((item) => this.mapCartItem(item));
    }

    async getCartItems(userId: string): Promise<CartRep[]> {
        const data = await this.prismaService.prismaClient.cartItems.findMany({
            where: { cart: { accountId: userId } },
            include: CART_ITEM_INCLUDE,
        });

        return data.map((item) => this.mapCartItem(item));
    }

    async addItemToCart(userId: string, productId: string, quantity: number): Promise<CartRep> {
        const existingItem = await this.prismaService.prismaClient.cartItems.findFirst({
            where: {
                cart: { accountId: userId },
                productId,
            },
        });

        if (existingItem) {
            await this.prismaService.prismaClient.cartItems.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });

            const cartItem = await this.getCartItemWithProduct(existingItem.id);
            return this.mapCartItem(cartItem);
        }

        const newItem = await this.prismaService.prismaClient.cartItems.create({
            data: {
                quantity,
                product: {
                    connect: { id: productId },
                },
                cart: {
                    connectOrCreate: {
                        where: { accountId: userId },
                        create: { accountId: userId },
                    },
                },
            },
        });

        const cartItem = await this.getCartItemWithProduct(newItem.id);
        return this.mapCartItem(cartItem);
    }

    async removeItemFromCart(userId: string, productId: string): Promise<CartRep> {
        const cartItem = await this.prismaService.prismaClient.cartItems.findFirst({
            where: {
                cart: { accountId: userId },
                productId,
            },
            include: CART_ITEM_INCLUDE,
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        await this.prismaService.prismaClient.cartItems.delete({
            where: { id: cartItem.id },
        });

        return this.mapCartItem(cartItem);
    }

    async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<CartRep> {
        const cartItem = await this.prismaService.prismaClient.cartItems.findFirst({
            where: {
                cart: { accountId: userId },
                productId,
            },
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        const updatedItem = await this.prismaService.prismaClient.cartItems.update({
            where: { id: cartItem.id },
            data: { quantity },
            include: CART_ITEM_INCLUDE,
        });

        return this.mapCartItem(updatedItem);
    }

    private async getCartItemWithProduct(id: string): Promise<CartItemWithProduct> {
        const cartItem = await this.prismaService.prismaClient.cartItems.findUnique({
            where: { id },
            include: CART_ITEM_INCLUDE,
        });

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        return cartItem;
    }

    private mapCartItem(cartItem: CartItemWithProduct): CartRep {
        return {
            id: cartItem.id,
            product: {
                id: cartItem.product.id,
                urlImage: cartItem.product.property?.urlImage ?? '',
                name: cartItem.product.property?.name ?? '',
                price: cartItem.product.property?.price ?? 0,
            },
            quantity: cartItem.quantity,
        };
    }
}
