import type { Role } from "../enums.typs";

export type Account = {
    id: string;
    email: string;
    role: Role;
    isLock: boolean;
    createdAt: string;
    updatedAt?: string;
};

export type Address = {
    id: string;
    accountId: string;
    fullName: string;
    phone: string;
    province: string;
    ward: string;
    detail: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt?: string;
};
