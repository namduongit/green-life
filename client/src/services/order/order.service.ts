import { api } from "../../lib/api/api";
import type { OrderPaymentMethod } from "../../lib/types/enums.typs";
import type { OrderRep } from "./order.type";

export const createOrder = async (orderForm: {
    recipientName: string,
    recipientPhone: string,
    recipientProvince: string,
    recipientWard: string,
    recipientDetail: string,

    orderItem: {
        productId: string,
        quantity: number
    }[],
    paymentMethod: OrderPaymentMethod
}) => {
    const response = await api.post("/api/orders", orderForm);
    return response;
};

export const getOrdersByUserId = async (userId: string) => {
    const response = await api.get<OrderRep[]>(`/api/users/${userId}/orders`);
    return response;
};

export const getOrder = async () => {
    const response = await api.get<OrderRep[]>(`/api/orders`);
    return response;
};