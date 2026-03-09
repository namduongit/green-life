import type { CommonStatus } from "../enums.typs";

export type Category = {
    id: string;
    name: string;
    status: CommonStatus;
    slug: string;

    createdAt: string;
    updatedAt?: string;
    isDelete: boolean;
};
