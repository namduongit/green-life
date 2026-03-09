<<<<<<< HEAD

import { api } from "../../lib/api/api";
=======
import { api } from "../../api/api";
>>>>>>> f69e5af (Them type, dùng query, thêm chức năng mở khoá, fix lại UI cho chức năng thêm sản phẩm, lưu ý là phải xem lại phân trang cho phần product)
import type { CategoryRep } from "./category.type";

export const getAllCategories = async () => {
    const response = await api.get<CategoryRep[]>("/api/categories");
    return response;
};

export const getCategoriesPagination = async (page: number, limit: number) => {
    const response = await api.get<CategoryRep[]>(`/api/categories/pagination?page=${page}&limit=${limit}`);
    return response;
};

export const getCategoryById = async (id: string) => {
<<<<<<< HEAD
    const response = await api.get<CategoryRep>(`/api/categories/by-id/${id}`);
=======
    const response = await api.get<CategoryRep[]>(`/api/categories/by-id/${id}`);
>>>>>>> f69e5af (Them type, dùng query, thêm chức năng mở khoá, fix lại UI cho chức năng thêm sản phẩm, lưu ý là phải xem lại phân trang cho phần product)
    return response;
};

export const searchCategories = async (name?: string, status?: string) => {
    const response = await api.get<CategoryRep[]>(`/api/categories/search?name=${name ?? ""}&status=${status ?? ""}`);
    return response;
};

export const createCategory = async (body: any) => {
    const response = await api.post<CategoryRep>("/api/categories", body);
    return response;
};

export const updateCategory = async (id: string, body: any) => {
    const response = await api.put<CategoryRep>(`/api/categories/${id}`, body);
    return response;
};

export const softDeleteCategory = async (id: string) => {
    const response = await api.delete<CategoryRep>(`/api/categories/${id}`);
    return response;
};

export const reActivateCategory = async (id: string) => {
    const response = await api.patch<CategoryRep>(`/api/categories/${id}/activate`);
    return response;
<<<<<<< HEAD
}
=======
}
>>>>>>> f69e5af (Them type, dùng query, thêm chức năng mở khoá, fix lại UI cho chức năng thêm sản phẩm, lưu ý là phải xem lại phân trang cho phần product)
