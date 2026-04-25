import type {
	OrderPaymentMethod,
	OrderPaymentStatus,
	OrderStatus,
} from "../../lib/types/enums.typs";

export type OrderRep = {
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
	createdAt: string;
	updatedAt: string;
};

type OrderItemRep = {
	id: string;
    productId: string;
    quantity: number;
    price: number;
    amount: number;
};

type CheckoutHistoryRep = {
	id: string;
    paymentType: OrderPaymentMethod;
    amount: number;
    requestId: string;
    createdAt: Date;
}

export type OrderDetailRep = {
	orderItems: OrderItemRep[];
	checkoutHistory: CheckoutHistoryRep | null;
	account?: {
        id: string;
        email: string;
    };
};