import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/configs/prisma-client.config';
import { CartRep } from '../dto/responses/carts-response.dto';

@Injectable()
export class CartsService {
    constructor(private readonly prismaService: PrismaService) { }

    async clearCart(userId: string) {
        const data = await this.prismaService.prismaClient.cartItems.deleteMany({
            where: { cart: { accountId: userId } },
        });

        return data;
    }

    async getCartItems(userId: string): Promise<CartRep[]> {
        const data = await this.prismaService.prismaClient.cartItems.findMany({
            where: { cart: { accountId: userId } },
            include: {
                product: {
                    include: {
                        property: true
                    }
                },
            },
        });

        return data.map((item) => ({
            id: item.id,
            product: {
                id: item.product.id,
                urlImage: item.product.property?.urlImage!,
                name: item.product.property?.name!,
                price: item.product.property?.price!,
            },
            quantity: item.quantity,
        }));
    }

    async addItemToCart(userId: string, productId: string, quantity: number) {
        const existingItem = await this.prismaService.prismaClient.cartItems.findFirst({
            where: {
                cart: { accountId: userId },
                productId: productId,
            },
        });

        if (existingItem) {
            const updatedItem = await this.prismaService.prismaClient.cartItems.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
            return updatedItem;
        }

        const newItem = await this.prismaService.prismaClient.cartItems.create({
            data: {
                quantity: quantity,
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

        return newItem;
    }

    async removeItemFromCart(userId: string, productId: string) {
        const data = await this.prismaService.prismaClient.cartItems.deleteMany({
            where: {
                cart: { accountId: userId },
                productId: productId,
            },
        });

        return data;
    }

    async updateItemQuantity(userId: string, productId: string, quantity: number) {
        const cartItem = await this.prismaService.prismaClient.cartItems.findFirst({
            where: {
                cart: { accountId: userId },
                productId: productId,
            },
        });

        if (!cartItem) {
            throw new Error('Cart item not found');
        }

        const updatedItem = await this.prismaService.prismaClient.cartItems.update({
            where: { id: cartItem.id },
            data: { quantity: quantity },
            include: {
                product: true,
            },
        });

        return updatedItem;
    }
}
