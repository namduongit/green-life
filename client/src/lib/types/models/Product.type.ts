import type { CommonStatus, Role, Unit } from "../enums.typs";

export type Product = {
    id: string;
    currentStock: number;
    status: CommonStatus;
    categoryId: string;
    isDelete: boolean;
    createdAt: string;
    updatedAt?: string;
};

export type ProductProperty = {
    id: string;
    productId: string;
    urlImage: string;
    name: string;
    description: string;
    weight: string;
    unit: Unit;
    length: number;
    width: number;
    height: number;
    price: number;
    createdAt: string;
    updatedAt?: string;
};
