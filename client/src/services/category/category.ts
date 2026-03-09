import { api } from "../../api/api";

export const getAllCategories = async () => {
    const response = await api.get("/api/categories");
    return response;
};

export const getCategoriesPagination = async (page: number, limit: number) => {
    const response = await api.get(`/api/categories/pagination?page=${page}&limit=${limit}`);
    return response;
};

export const getCategoryById = async (id: string) => {
    const response = await api.get(`/api/categories/by-id/${id}`);
    return response;
};

export const searchCategories = async (name?: string, status?: string) => {
    const response = await api.get(`/api/categories/search?name=${name ?? ""}&status=${status ?? ""}`);
    return response;
};

export const createCategory = async (body: any) => {
    const response = await api.post("/api/categories", body);
    return response;
};

export const updateCategory = async (id: string, body: any) => {
    const response = await api.put(`/api/categories/${id}`, body);
    return response;
};

export const softDeleteCategory = async (id: string) => {
    const response = await api.delete(`/api/categories/${id}`);
    return response;
};