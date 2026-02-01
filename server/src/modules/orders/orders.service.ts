import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/configs/prisma-client.config";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
    constructor(private readonly prismaService: PrismaService) {}

    async getAllOrders() {
        const orders = await this.prismaService.prismaClient.orders.findMany({
            include: {
                account: true,
                orderItems: {
                    include: {
                        product: true
                    }
                },
                payment: true
            }
        });

        return orders;
    }

    async getOrderById(id: string) {
        const order = await this.prismaService.prismaClient.orders.findUnique({
            where: {
                id: id
            }
        });

        if (!order) throw new NotFoundException(`Không có order ${id}`);

        return order;
    }

    async createOrder(createOrderDto: CreateOrderDto) {
        const { accountId, items, paymentMethod } = createOrderDto;

        const account = await this.prismaService.prismaClient.accounts.findUnique({
            where: { id: accountId },
        });

        if (!account) {
            throw new NotFoundException(`Không có account với id ${accountId}`);
        }

        if (account.isLock) {
            throw new BadRequestException('Account đã bị khóa');
        }

        const productIds = items.map(item => item.productId);
        const products = await this.prismaService.prismaClient.products.findMany({
            where: {
                id: { in: productIds },
            },
            include: {
                property: true,
            },
        });

        if (products.length !== productIds.length) {
            throw new NotFoundException('Sản phẩm không đủ');
        }

        let totalAmount = 0;
        const orderItemsData: { productId: string; quantity: number; price: number }[] = [];

        for (const item of items) {
            const product = products.find(p => p.id === item.productId);

            if (product?.status !== 'Active') {
                throw new BadRequestException(`Sản phẩm ${product?.id} không khả dụng`);
            }

            if (product.currentStock < item.quantity) {
                throw new BadRequestException(
                    `Không đủ số lượng cho sản phẩm ${product.id}`
                );
            }

            const price = product.price || 0;
            const itemTotal = price * item.quantity;
            totalAmount += itemTotal;

            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: totalAmount,
            });
        }

        const address = await this.prismaService.prismaClient.addresses.findUnique({
            where: { accountId },
        });

        if (!address) {
            throw new BadRequestException(`Account ${accountId} không có địa chỉ`);
        }

        const fullAddress = `${address.home}, ${address.city}, ${address.province}`;

        const order = await this.prismaService.prismaClient.$transaction(async (prisma) => {

            const newOrder = await prisma.orders.create({
                data: {
                    accountId,
                    totalAmount,
                    name: account.email.split('@')[0], // xem lại
                    phone: '0000000000', // xem lại
                    email: account.email, // xem lại
                    address: fullAddress, // xem lại
                    note: '',
                    status: 'Pending',
                    paymentStatus: 'UnPaid',
                    orderItems: {
                        create: orderItemsData,
                    },
                    payment: {
                        create: {
                            type: paymentMethod,
                            transactionId: `TXN-${Date.now()}`, // xem lại transactionId
                            totalAmount,
                            content: `Tạo order`, // xem lại
                            status: 'Pending',
                        },
                    },
                },
                include: {
                    orderItems: {
                        include: {
                            product: {
                                include: {
                                    property: true,
                                },
                            },
                        },
                    },
                    payment: true,
                },
            });

            for (const item of items) {
                await prisma.products.update({
                    where: { id: item.productId },
                    data: {
                        currentStock: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            return newOrder;
        });


        // Xử lý phát đi event để thanh toán

        return order;
    }
}