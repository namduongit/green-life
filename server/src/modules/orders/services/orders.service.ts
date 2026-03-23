import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/configs/prisma-client.config';
import { CreateOrderDto } from '../dto/requests/request.dto';

@Injectable()
export class OrdersService {
    constructor(private readonly prismaService: PrismaService) { }

    async getAllOrders() {
        const orders = await this.prismaService.prismaClient.orders.findMany({
            include: {
                account: true,
                orderItems: {
                    include: {
                        product: true,
                    },
                },
                checkoutHistory: true
            },
        });

        return orders;
    }

    async getOrderById(id: string) {
        const order = await this.prismaService.prismaClient.orders.findUnique({
            where: {
                id: id,
            },
        });

        if (!order) throw new NotFoundException(`Không có order ${id}`);

        return order;
    }

    async createOrder(accountId: string, createOrderDto: CreateOrderDto) {
        const account = await this.prismaService.prismaClient.accounts.findUnique({
            where: {
                id: accountId
            }
        });

        if (!account) throw new NotFoundException(`Tài khoản ${accountId} không tồn tại`)

        const map = new Map<string, number>();
        for (const orderItem of createOrderDto.orderItem) {
            if (!map.has(orderItem.productId)) {
                map.set(orderItem.productId, orderItem.quantity);
            } else {
                map.set(orderItem.productId, map.get(orderItem.productId)! + orderItem.quantity);
            }
        }

        const ids = [...map.keys()];
        console.log('Product IDs in order:', ids);

        const products = await this.prismaService.prismaClient.products.findMany({
            where: {
                id: {
                    in: ids
                },
                isDelete: false,
                status: 'Active'
            },
            include: {
                property: true
            }
        });
        console.log(products)

        if (products.length !== ids.length) {
            const foundIds = products.map(product => product.id);
            const notFoundIds = ids.filter(id => !foundIds.includes(id));
            throw new BadRequestException(`Sản phẩm ${notFoundIds.join(', ')} không tồn tại hoặc đã bị xóa`);
        }

        const totalQuantity = Array.from(map.values()).reduce((sum, quantity) => sum + quantity, 0);

        const totalAmount = products.reduce((sum, product) => {
            const quantity = map.get(product.id) || 0;
            const price = product.property?.price || 0;
            return sum + price * quantity;
        }, 0);

        const order = await this.prismaService.prismaClient.$transaction(async (prisma) => {
            const newOrder = await prisma.orders.create({
                data: {
                    recipientName: createOrderDto.recipientName,
                    recipientPhone: createOrderDto.recipientPhone,
                    recipientProvince: createOrderDto.recipientProvince,
                    recipientWard: createOrderDto.recipientWard,
                    recipientDetail: createOrderDto.recipientDetail,

                    totalQuantity: totalQuantity,
                    totalAmount: totalAmount,

                    paymentMethod: createOrderDto.paymentMethod,
                    accountId: accountId,
                    status: 'Pending',
                    paymentStatus: 'UnPaid',
                }
            });

            const orderItemsData = products.map(product => ({
                orderId: newOrder.id,
                productId: product.id,
                quantity: map.get(product.id) || 0,
                price: product.property?.price || 0,
                amount: (product.property?.price || 0) * (map.get(product.id) || 0),
            }));

            await prisma.orderItems.createMany({
                data: orderItemsData
            });

            return newOrder;
        });

        console.log('Created order:', order);

        return order;
    }
}
