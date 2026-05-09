import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CheckoutHistory, CommonStatus, OrderItems, Orders, Prisma } from 'prisma/generated/client';
import { OrderPaymentMethod, OrderPaymentStatus, OrderStatus } from 'prisma/generated/enums';
import { PrismaService } from 'src/configs/prisma-client.config';
import { CreateOrderDto } from '../dto/requests/request.dto';
import { OrderDetailResponseDto, OrderPaginationResponseDto, OrderResponseDto } from '../dto/responses/response.dto';
import { PaymentsService } from 'src/modules/payments/services/payments.service';
import { Cron } from '@nestjs/schedule';

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
    constructor(
        private readonly prismaService: PrismaService,
        private readonly paymentsService: PaymentsService,
    ) { }

    async getAllOrders(status?: OrderStatus): Promise<OrderDetailResponseDto[]> {
        const orders = await this.prismaService.prismaClient.orders.findMany({
            where: status ? { status } : undefined,
            include: ORDER_DETAIL_INCLUDE,
            orderBy: {
                createdAt: 'desc',
            },
        });

        return orders.map((order) => this.mapOrderDetail(order));
    }

    async getAllOrdersPaginated(
        page: number,
        limit: number,
        status?: OrderStatus,
    ): Promise<OrderPaginationResponseDto> {
        if (page < 1 || limit < 1) {
            throw new BadRequestException('Số trang và số lượng phải lớn hơn 0');
        }

        const skip = (page - 1) * limit;
        const where = status ? { status } : undefined;

        const [orders, total] = await Promise.all([
            this.prismaService.prismaClient.orders.findMany({
                where,
                include: ORDER_DETAIL_INCLUDE,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prismaService.prismaClient.orders.count({ where }),
        ]);

        return {
            data: orders.map((order) => this.mapOrderDetail(order)),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
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

    async getPaymentStatus(id: string): Promise<{
        id: string;
        paymentStatus: string;
        paymentMethod: string;
        accountId: string;
        totalAmount: number;
    }> {
        const order = await this.prismaService.prismaClient.orders.findUnique({
            where: { id },
            select: {
                id: true,
                paymentStatus: true,
                paymentMethod: true,
                accountId: true,
                totalAmount: true,
            },
        });

        if (!order) {
            throw new NotFoundException(`Không có order ${id}`);
        }

        return {
            id: order.id,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            accountId: order.accountId,
            totalAmount: order.totalAmount,
        };
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

        const orderDetail = await this.getOrderById(orderId);

        // Nếu thanh toán Momo, tạo payment link và trả về paymentUrl
        if (createOrderDto.paymentMethod === OrderPaymentMethod.Momo) {
            const momoPayment = await this.paymentsService.paymentMomoCreate({
                total: orderDetail.totalAmount,
                orderId: orderDetail.id,
                orderInfo: `Thanh toán đơn hàng Green Life #${orderDetail.id}`,
                lang: 'vi',
                extraData: {
                    id: account.id,
                    email: account.email,
                },
            }, {
                items: orderDetail.orderItems.map(item => ({
                    id: item.productId,
                    name: `Sản phẩm #${item.productId}`,
                    description: '',
                    imageUrl: '',
                    price: item.price,
                    quantity: item.quantity,
                    unit: 'Cái',
                    totalPrice: item.amount,
                })),
                userInfo: {
                    name: orderDetail.recipientName,
                    phoneNumber: orderDetail.recipientPhone,
                    email: account.email,
                },
            });

            return {
                ...orderDetail,
                paymentUrl: momoPayment.payment.paymentUrl,
            };
        }
        // Nếu thanh toán SePay, trả về URL mã QR để thanh toán
        if (createOrderDto.paymentMethod === OrderPaymentMethod.SePay) {
            const sepayPayment = await this.paymentsService.paymentSeapayCreate(
                orderDetail.totalAmount,
                orderDetail.id,
                account.id,
                account.email
            );

            return {
                ...orderDetail,
                paymentUrl: sepayPayment.payment.paymentUrl,
            };
        }

        return orderDetail;
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

    async getOrdersByAccountId(accountId: string): Promise<OrderResponseDto[]> {
        const orders = await this.prismaService.prismaClient.orders.findMany({
            where: { accountId },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return orders.map((order) => this.mapOrder(order));
    }

    /* ───────────── Order status management ───────────── */

    // Thứ tự trạng thái đơn hàng
    private readonly STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
        [OrderStatus.Pending]: OrderStatus.Confirmed,
        [OrderStatus.Confirmed]: OrderStatus.InTransit,
        [OrderStatus.InTransit]: OrderStatus.Received,
        [OrderStatus.Received]: null,
        [OrderStatus.Cancelled]: null,
    };

    async advanceOrderStatus(id: string): Promise<OrderDetailResponseDto> {
        const order = await this.prismaService.prismaClient.orders.findUnique({
            where: { id },
            include: ORDER_DETAIL_INCLUDE,
        });

        if (!order) throw new NotFoundException(`Không có order ${id}`);

        if (order.paymentStatus !== OrderPaymentStatus.Paid && order.paymentMethod !== OrderPaymentMethod.Cod) {
            throw new BadRequestException('Đơn hàng chưa được thanh toán, không thể xử lý');
        }

        const nextStatus = this.STATUS_FLOW[order.status as OrderStatus];
        if (!nextStatus) {
            throw new BadRequestException(`Đơn hàng đã ở trạng thái cuối: ${order.status}`);
        }

        const updated = await this.prismaService.prismaClient.orders.update({
            where: { id },
            data: { status: nextStatus },
            include: ORDER_DETAIL_INCLUDE,
        });

        return this.mapOrderDetail(updated);
    }

    async cancelOrder(id: string): Promise<OrderDetailResponseDto> {
        const order = await this.prismaService.prismaClient.orders.findUnique({
            where: { id },
            include: ORDER_DETAIL_INCLUDE,
        });

        if (!order) throw new NotFoundException(`Không có order ${id}`);

        if (order.status === OrderStatus.Received || order.status === OrderStatus.Cancelled) {
            throw new BadRequestException(`Không thể hủy đơn ở trạng thái ${order.status}`);
        }

        const updated = await this.prismaService.prismaClient.orders.update({
            where: { id },
            data: { status: OrderStatus.Cancelled },
            include: ORDER_DETAIL_INCLUDE,
        });

        return this.mapOrderDetail(updated);
    }

    // Cron: tự động hủy đơn Chưa thanh toán (non-COD) sau 30 phút
    @Cron('*/5 * * * *') // kiểm tra mỗi 5 phút
    async cancelExpiredOrders(): Promise<void> {
        const EXPIRY_MINUTES = 30;
        const expiredBefore = new Date(Date.now() - EXPIRY_MINUTES * 60 * 1000);

        const expired = await this.prismaService.prismaClient.orders.findMany({
            where: {
                status: OrderStatus.Pending,
                paymentStatus: OrderPaymentStatus.UnPaid,
                paymentMethod: { not: OrderPaymentMethod.Cod },
                createdAt: { lt: expiredBefore },
            },
            select: { id: true },
        });

        if (expired.length === 0) return;

        const ids = expired.map(o => o.id);
        await this.prismaService.prismaClient.orders.updateMany({
            where: { id: { in: ids } },
            data: { status: OrderStatus.Cancelled },
        });

        console.log(`[Cron] Tự động hủy ${ids.length} đơn hàng quá hạn thanh toán.`);
    }

    /* ───────────── Checkout history ───────────── */
    async getCheckoutHistoryByAccount(accountId: string) {
        const histories = await this.prismaService.prismaClient.checkoutHistory.findMany({
            where: { accountId },
            orderBy: { createdAt: 'desc' },
            include: {
                order: {
                    select: {
                        id: true,
                        totalAmount: true,
                        status: true,
                        paymentMethod: true,
                        paymentStatus: true,
                        createdAt: true,
                        recipientName: true,
                    },
                },
            },
        });

        return histories.map(h => ({
            id: h.id,
            paymentType: h.paymentType,
            amount: h.amount,
            requestId: h.requestId,
            createdAt: h.createdAt,
            orderId: h.orderId,
            order: h.order,
        }));
    }
}
