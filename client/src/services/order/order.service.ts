import { api } from "../../lib/api/api";
import type { OrderPaymentMethod } from "../../lib/types/enums.typs";
import type { OrderDetailRep, OrderRep } from "./order.type";

/** --------------------------- USER FEATS --------------------------- */
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


// Lấy đơn hàng theo accountId (đúng với API backend)
export const getOrdersByAccountId = async (accountId: string) => {
    const response = await api.get<OrderRep[]>(`/api/users/${accountId}/orders`);
    return response;
};

export const getOrderDetailById = async (accountId: string, orderId: string) => {
    const response = await api.get<OrderDetailRep>(`/api/users/${accountId}/orders/${orderId}`);
    return response;
}

/** --------------------------- ADMIN FEATS --------------------------- */
// Lấy tất cả đơn hàng (nếu cần)
export const getAllOrders = async () => {
    const response = await api.get<OrderRep[]>(`/api/orders`);
    return response;
};

// Lấy đơn hàng theo id (admin)
export const getOrderById = async (id: string) => {
    const response = await api.get<OrderRep>(`/api/orders/${id}`);
    return response;
};

// Get all orders (admin only)
export const getOrder = async () => {
    const response = await api.get<OrderRep[]>(`/api/orders`);
    return response;
};