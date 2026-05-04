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
    const response = await api.post<OrderDetailRep>("/api/orders", orderForm);
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

// Get all orders with optional status filter (admin)
export const getOrder = async (status?: string) => {
    const url = status ? `/api/orders?status=${status}` : `/api/orders`;
    const response = await api.get<OrderRep[]>(url);
    return response;
};

// Advance order to next status (admin)
export const advanceOrderStatus = async (orderId: string) => {
    const response = await api.patch<OrderDetailRep>(`/api/orders/${orderId}/advance-status`);
    return response;
};

// Cancel order (admin)
export const cancelOrderAdmin = async (orderId: string) => {
    const response = await api.patch<OrderDetailRep>(`/api/orders/${orderId}/cancel`);
    return response;
};

// Get checkout history for a user
export const getCheckoutHistory = async (accountId: string) => {
    const response = await api.get(`/api/users/${accountId}/checkout-history`);
    return response;
};

export const getOrderPaymentStatus = async (orderId: string) => {
    const response = await api.get<{
        id: string;
        paymentStatus: string;
        paymentMethod: string;
        accountId: string;
        totalAmount: number;
    }>(`/api/orders/${orderId}/payment-status`);
    return response;
};