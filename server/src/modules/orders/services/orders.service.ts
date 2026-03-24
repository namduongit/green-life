import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CheckoutHistory, CommonStatus, OrderItems, Orders, Prisma } from 'prisma/generated/client';
import { OrderPaymentStatus, OrderStatus } from 'prisma/generated/enums';
import { PrismaService } from 'src/configs/prisma-client.config';
import { CreateOrderDto } from '../dto/requests/request.dto';
import { OrderDetailResponseDto, OrderResponseDto } from '../dto/responses/response.dto';

type OrderWithRelations = Orders & {
    orderItems: OrderItems[];
    checkoutHistory: CheckoutHistory | null;
    account?: {
        id: string;
        email: string;
    } | null;
};

const ORDER_DETAIL_INCLUDE = {
    orderItems: {
        select: {
            id: true,
            productId: true,
            quantity: true,
            price: true,
            amount: true,
            orderId: true,
        },
    },
    checkoutHistory: {
        select: {
            id: true,
            paymentType: true,
            amount: true,
            requestId: true,
            createdAt: true,
            orderId: true,
            accountId: true,
        },
    },
    account: {
        select: {
            id: true,
            email: true,
        },
    },
} as const;

const PRODUCT_INCLUDE = {
    property: true,
} as const;

type ProductWithProperty = Prisma.ProductsGetPayload<{
    include: typeof PRODUCT_INCLUDE;
}>;

@Injectable()
export class OrdersService {
    constructor(private readonly prismaService: PrismaService) {}

    async getAllOrders(): Promise<OrderResponseDto[]> {
        const orders = await this.prismaService.prismaClient.orders.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return orders.map((order) => this.mapOrder(order));
    }

    async getOrderById(id: string): Promise<OrderDetailResponseDto> {
        const order = await this.prismaService.prismaClient.orders.findUnique({
            where: { id },
            include: ORDER_DETAIL_INCLUDE,
        });

        if (!order) {
            throw new NotFoundException(`Không có order ${id}`);
        }

        return this.mapOrderDetail(order);
    }

    async createOrder(accountId: string, createOrderDto: CreateOrderDto): Promise<OrderDetailResponseDto> {
        const account = await this.prismaService.prismaClient.accounts.findUnique({
            where: { id: accountId },
        });

        if (!account) {
            throw new NotFoundException(`Tài khoản ${accountId} không tồn tại`);
        }

        if (!createOrderDto.orderItem || createOrderDto.orderItem.length === 0) {
            throw new BadRequestException('Đơn hàng phải có ít nhất một sản phẩm');
        }

        const productQuantityMap = this.aggregateOrderItems(createOrderDto);
        const productIds = [...productQuantityMap.keys()];

        const products = await this.prismaService.prismaClient.products.findMany({
            where: {
                id: {
                    in: productIds,
                },
                isDelete: false,
                status: CommonStatus.Active,
            },
            include: PRODUCT_INCLUDE,
        });

        if (products.length !== productIds.length) {
            const foundIds = products.map((product) => product.id);
            const missingIds = productIds.filter((id) => !foundIds.includes(id));
            throw new BadRequestException(`Sản phẩm ${missingIds.join(', ')} không tồn tại hoặc đã bị xóa`);
        }

        const totalQuantity = this.calculateTotalQuantity(productQuantityMap);
        const totalAmount = this.calculateTotalAmount(products, productQuantityMap);

        const orderId = await this.prismaService.prismaClient.$transaction(async (prisma) => {
            const newOrder = await prisma.orders.create({
                data: {
                    recipientName: createOrderDto.recipientName,
                    recipientPhone: createOrderDto.recipientPhone,
                    recipientProvince: createOrderDto.recipientProvince,
                    recipientWard: createOrderDto.recipientWard,
                    recipientDetail: createOrderDto.recipientDetail,
                    totalQuantity,
                    totalAmount,
                    paymentMethod: createOrderDto.paymentMethod,
                    accountId,
                    status: OrderStatus.Pending,
                    paymentStatus: OrderPaymentStatus.UnPaid,
                },
            });

            await prisma.orderItems.createMany({
                data: products.map((product) => {
                    const quantity = productQuantityMap.get(product.id) ?? 0;
                    const price = product.property?.price ?? 0;
                    return {
                        orderId: newOrder.id,
                        productId: product.id,
                        quantity,
                        price,
                        amount: price * quantity,
                    };
                }),
            });

            return newOrder.id;
        });

        return this.getOrderById(orderId);
    }

    private aggregateOrderItems(createOrderDto: CreateOrderDto): Map<string, number> {
        const quantities = new Map<string, number>();

        for (const item of createOrderDto.orderItem) {
            const currentQuantity = quantities.get(item.productId) ?? 0;
            quantities.set(item.productId, currentQuantity + item.quantity);
        }

        return quantities;
    }

    private calculateTotalQuantity(quantities: Map<string, number>): number {
        let total = 0;
        quantities.forEach((quantity) => {
            total += quantity;
        });
        return total;
    }

    private calculateTotalAmount(products: ProductWithProperty[], quantities: Map<string, number>): number {
        return products.reduce((sum, product) => {
            const quantity = quantities.get(product.id) ?? 0;
            const price = product.property?.price ?? 0;
            return sum + price * quantity;
        }, 0);
    }

    private mapOrder(order: Orders): OrderResponseDto {
        return {
            id: order.id,
            totalAmount: order.totalAmount,
            totalQuantity: order.totalQuantity,
            recipientName: order.recipientName,
            recipientPhone: order.recipientPhone,
            recipientProvince: order.recipientProvince,
            recipientWard: order.recipientWard,
            recipientDetail: order.recipientDetail,
            paymentMethod: order.paymentMethod,
            status: order.status,
            paymentStatus: order.paymentStatus,
            accountId: order.accountId,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    }

    private mapOrderDetail(order: OrderWithRelations): OrderDetailResponseDto {
        return {
            ...this.mapOrder(order),
            orderItems: order.orderItems.map((item) => ({
                id: item.id,
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                amount: item.amount,
            })),
            checkoutHistory: order.checkoutHistory
                ? {
                      id: order.checkoutHistory.id,
                      paymentType: order.checkoutHistory.paymentType,
                      amount: order.checkoutHistory.amount,
                      requestId: order.checkoutHistory.requestId,
                      createdAt: order.checkoutHistory.createdAt,
                  }
                : null,
            account: order.account
                ? {
                      id: order.account.id,
                      email: order.account.email,
                  }
                : undefined,
        };
    }
}
