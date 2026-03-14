import { api } from "../../lib/api/api";
import type { CommonStatus } from "../../lib/types/enums.typs";
import type {
    CreateProductForm,
    GetProductRep,
    QueryGetProducts,
} from "./product.type";

export const getAllProducts = async (query: QueryGetProducts) => {
    const response = await api.get<GetProductRep[]>(`/api/products`, {
        params: query,
    });
    return response;
};

export const getProductById = async (id: string) => {
    const response = await api.get<GetProductRep>(`/api/products/${id}`);
    return response.data;
};

export const createProduct = async (formData: CreateProductForm) => {
    const response = await api.post<GetProductRep>("/api/products", formData);
    return response.data;
};

export const updateProductStock = async (id: string, stock: number) => {
    const response = await api.put<GetProductRep>(`/api/products/${id}/stock`, {
        stock,
    });
    return response.data;
};

export const updateProductStatus = async (id: string, status: CommonStatus) => {
    const response = await api.put<GetProductRep>(
        `/api/products/${id}/status`,
        {
            status: status,
        },
    );
    return response.data;
};

export const updateProductTags = async (id: string, tagIds: string[]) => {
    const response = await api.put<GetProductRep>(`/api/products/${id}/tags`, {
        tagIds,
    });
    return response.data;
};

export const updateProductProperty = async (
    id: string,
    property: GetProductRep["property"],
) => {
    const response = await api.put<GetProductRep>(
        `/api/products/${id}/property`,
        {
            property,
        },
    );
    return response.data;
};

export const updateProductCategory = async (id: string, categoryId: string) => {
    const response = await api.put<GetProductRep>(
        `/api/products/${id}/category`,
        {
            category: {
                id: categoryId,
            },
        },
    );
    return response.data;
};
