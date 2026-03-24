import { api } from "../../lib/api/api";
import type {
    AddressPayload,
    AddressRep,
    UpdateAddressPayload,
} from "./address.type";

type ApiResponse<T> = {
    data: T;
};

export const getAddresses = (accountId: string) =>
    api.get<ApiResponse<AddressRep[]>>(`/api/users/${accountId}/address`);

export const getAddressById = (accountId: string, addressId: string) =>
    api.get<ApiResponse<AddressRep>>(
        `/api/users/${accountId}/address/${addressId}`,
    );

export const createAddress = (
    accountId: string,
    payload: AddressPayload,
) => api.post<ApiResponse<AddressRep>>(`/api/users/${accountId}/address`, payload);

export const updateAddress = (
    accountId: string,
    addressId: string,
    payload: UpdateAddressPayload,
) =>
    api.put<ApiResponse<AddressRep>>(
        `/api/users/${accountId}/address/${addressId}`,
        payload,
    );

export const deleteAddress = (accountId: string, addressId: string) =>
    api.delete<ApiResponse<{ id: string }>>(
        `/api/users/${accountId}/address/${addressId}`,
    );
