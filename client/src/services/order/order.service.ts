import { api } from "../../lib/api/api";
import type { RestResponse } from "../../lib/api/api.type";
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

export const getOrders = async (userId: string) => {
    const response = await api.get<RestResponse<OrderRep[]>>(`/api/users/${userId}/orders`);
    return response.data;
};