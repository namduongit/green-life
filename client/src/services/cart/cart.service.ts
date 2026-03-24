import { api } from "../../lib/api/api";
import type { CartRep } from "./cart.type";
import type { CartItem } from "../../lib/types/models.type";

export const addProductToCart = async (
    userId: string,
    payload: {
        productId: string,
        quantity: number
    }) => {
    const response = await api.post<CartItem>(`/api/users/${userId}/cart`, payload);
    return response;
};

export const getCartItems = async (userId: string) => {
    const response = await api.get<CartRep[]>(`/api/users/${userId}/cart`);
    return response;
};

export const removeProductFromCart = async (userId: string, productId: string) => {
    const response = await api.delete<void>(`/api/users/${userId}/cart/${productId}`);
    return response;
};

export const clearCartItems = async (userId: string) => {
    const response = await api.delete<void>(`/api/users/${userId}/cart`);
    return response;
};
