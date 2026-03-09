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
    province: string;
    city: string;
    home: string;
    createdAt: string;
    updatedAt?: string;
};
