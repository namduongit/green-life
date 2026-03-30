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
