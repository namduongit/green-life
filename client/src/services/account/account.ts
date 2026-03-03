import { api } from "../../api/api"
import type { AddressForm, AddressRep, AddToCartForm, CartRep, CreateAccountForm, UpdateAccountForm } from "./account.type";

export const getAllAccounts = async () => {
    const response = await api.get("/api/users");
    return response;
}

export const getAccountById = async (id: string) => {
    const response = await api.get(`/api/users/${id}`);
    return response;
}

export const createAccount = async (createAccountForm: CreateAccountForm) => {
    const response = await api.post("/api/users", createAccountForm);
    return response;
}

export const updateAccount = async (id: string, updateAccountForm: UpdateAccountForm) => {
    const response = await api.put(`/api/users/${id}`, updateAccountForm);
    return response;
}

export const deActivateAccount = async (id: string) => {
    const response = await api.delete(`/api/users/${id}`);
    return response;
}

export const activateAccount = async (id: string) => {
    const response = await api.patch(`/api/users/${id}/activate`);
    return response;
}

export const getUserAddresses = async (userId: string) => {
    const response = await api.get<AddressRep[]>(`/api/users/${userId}/address`);
    return response.data;
}

export const addAddress = async (userId: string, addressForm: AddressForm) => {
    const response = await api.post<AddressRep>(`/api/users/${userId}/address`, addressForm);
    return response.data;
}

export const updateAddress = async (userId: string, addressId: string, addressForm: Partial<AddressForm>) => {
    const response = await api.put<AddressRep>(`/api/users/${userId}/address/${addressId}`, addressForm);
    return response.data;
}

export const deleteAddress = async (userId: string, addressId: string) => {
    const response = await api.delete(`/api/users/${userId}/address/${addressId}`);
    return response.data;
}

export const getUserCart = async (userId: string) => {
    const response = await api.get<CartRep>(`/api/users/${userId}/cart`);
    return response.data;
}

export const addToCart = async (userId: string, addToCartForm: AddToCartForm) => {
    const response = await api.post(`/api/users/${userId}/cart`, addToCartForm);
    return response.data;
}

export const removeFromCart = async (userId: string, productId: string) => {
    const response = await api.delete(`/api/users/${userId}/cart/${productId}`);
    return response.data;
}

export const clearCart = async (userId: string) => {
    const response = await api.delete(`/api/users/${userId}/cart`);
    return response.data;
}
