import type { CommonStatus } from "../enums.typs";

export type Tags = {
    id: string;
    status: CommonStatus;
    isDelete: boolean;
    name: string;
    createdAt: Date;
    updatedAt: Date;
};
