import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/configs/prisma-client.config';

@Injectable()
export class CartsService {
    constructor(private readonly prismaService: PrismaService) {}

    async clearCart(userId: string) {
        const data = await this.prismaService.prismaClient.cartItems.deleteMany({
            where: { cart: { accountId: userId } },
        });

        return data;
    }

    async getCartItems(userId: string) {
        const data = await this.prismaService.prismaClient.cartItems.findMany({
            where: { cart: { accountId: userId } },
            include: {
                product: true,
            },
        });

        return data;
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
}
