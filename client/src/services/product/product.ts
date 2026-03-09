import { api } from "../../api/api";

export const getAllProducts = async () => {
    const response = await api.get("/api/products");
    return response;
};

export const getProductById = async (id: string) => {
    const response = await api.get(`/api/products/${id}`);
    return response;
};

export const createProduct = async (body: any) => {
    const response = await api.post("/api/products", body);
    return response;
};

export const changeStock = async (id: string, stock: number) => {
    const response = await api.patch(`/api/products/${id}/stock`, { stock });
    return response;
};

export const updateStatus = async (id: string, status: string) => {
    const response = await api.patch(`/api/products/${id}/status`, { status });
    return response;
};

export const updateTags = async (id: string, tags: string[]) => {
    return api.patch(`/api/products/${id}/tags`, {
        tags
    });
};

export const updateProperty = async (id: string, property: any) => {
    return api.patch(`/api/products/${id}/property`, property);
};

export const updateCategory = async (id: string, categoryId: string) => {
    const response = await api.patch(`/api/products/${id}/category`, {
        category: { id: categoryId }
    });
    return response;
};

export const deleteProduct = async (id: string) => {
    const response = await api.delete(`/api/products/${id}`);
    return response;
};