import { OrderPaymentMethod, OrderPaymentStatus, OrderStatus } from 'prisma/generated/enums';

export type OrderItemResponseDto = {
    id: string;
    productId: string;
    quantity: number;
    price: number;
    amount: number;
};

export type CheckoutHistoryResponseDto = {
    id: string;
    paymentType: OrderPaymentMethod;
    amount: number;
    requestId: string;
    createdAt: Date;
};

export type OrderResponseDto = {
    id: string;
    totalAmount: number;
    totalQuantity: number;
    recipientName: string;
    recipientPhone: string;
    recipientProvince: string;
    recipientWard: string;
    recipientDetail: string;
    paymentMethod: OrderPaymentMethod;
    status: OrderStatus;
    paymentStatus: OrderPaymentStatus;
    accountId: string;
    createdAt: Date;
    updatedAt: Date;
};

export type OrderDetailResponseDto = OrderResponseDto & {
    orderItems: OrderItemResponseDto[];
    checkoutHistory: CheckoutHistoryResponseDto | null;
    account?: {
        id: string;
        email: string;
    };
};