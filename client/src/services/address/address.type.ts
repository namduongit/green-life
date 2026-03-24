import type { Address } from "../../lib/types/models.type";

export type AddressRep = Address;

export type AddressPayload = {
    fullName: string;
    phone: string;
    province: string;
    ward: string;
    detail: string;
    isDefault?: boolean;
};

export type UpdateAddressPayload = Partial<AddressPayload>;
