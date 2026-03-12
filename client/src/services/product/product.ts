import { api } from "../../lib/api/api";
import type { ProductRep } from "./product.type";

export const getAllProducts = async (page: number = 0, pageSize: number = 10) => {
    const response = await api.get<ProductRep[]>("/api/products?" + new URLSearchParams({ page: page.toString(), pageSize: pageSize.toString() }).toString());
    return response;
};

export const getProductById = async (id: string) => {
    const response = await api.get<ProductRep>(`/api/products/${id}`);
    return response;
};

export const createProduct = async (body: any) => {
    const response = await api.post<ProductRep>("/api/products", body);
    return response;
};


export const updateStatus = async (id: string, status: string) => {
    const response = await api.patch<ProductRep>(`/api/products/${id}/status`, { status });
    return response;
};

export const updateTags = async (id: string, tags: string[]) => {
    return api.patch<ProductRep[]>(`/api/products/${id}/tags`, {
        tags
    });
};

export const updateProperty = async (id: string, property: any) => {
    return api.patch<ProductRep>(`/api/products/${id}/property`, property);
};

export const updateCategory = async (id: string, categoryId: string) => {
    const response = await api.patch<ProductRep>(`/api/products/${id}/category`, {
        category: { id: categoryId }
    });
    return response;
};

export const deleteProduct = async (id: string) => {
    const response = await api.delete<ProductRep>(`/api/products/${id}`);
    return response;
};

export const reActivateProduct = async (id: string) => {
    const response = await api.patch<ProductRep>(`/api/products/${id}/activate`);
    return response;
}
