<<<<<<< HEAD

import { api } from "../../lib/api/api";
=======
import { api } from "../../api/api";
>>>>>>> f69e5af (Them type, dùng query, thêm chức năng mở khoá, fix lại UI cho chức năng thêm sản phẩm, lưu ý là phải xem lại phân trang cho phần product)
import type { TagRep } from "./tag.type";

export const getAllTags = async () => {
    const response = await api.get<TagRep[]>("/api/tags");
    return response;
};

export const getTagsPagination = async (page: number, limit: number) => {
    const response = await api.get<TagRep[]>(`/api/tags/pagination?page=${page}&limit=${limit}`);
    return response;
};

export const getTagById = async (id: string) => {
<<<<<<< HEAD
    const response = await api.get<TagRep>(`/api/tags/by-id/${id}`);
=======
    const response = await api.get<TagRep[]>(`/api/tags/by-id/${id}`);
>>>>>>> f69e5af (Them type, dùng query, thêm chức năng mở khoá, fix lại UI cho chức năng thêm sản phẩm, lưu ý là phải xem lại phân trang cho phần product)
    return response;
};

export const searchTags = async (name?: string, status?: string) => {
    const response = await api.get<TagRep[]>(`/api/tags/search?name=${name ?? ""}&status=${status ?? ""}`);
    return response;
};

export const createTag = async (body: any) => {
    const response = await api.post<TagRep>("/api/tags", body);
    return response;
};

export const updateTag = async (id: string, body: any) => {
    const response = await api.put<TagRep>(`/api/tags/${id}`, body);
    return response;
};

export const softDeleteTag = async (id: string) => {
    const response = await api.delete<TagRep>(`/api/tags/${id}`);
    return response;
};

export const reActivateTag = async (id: string) => {
    const response = await api.patch<TagRep>(`/api/tags/${id}/activate`);
    return response;
<<<<<<< HEAD
}
=======
}
>>>>>>> f69e5af (Them type, dùng query, thêm chức năng mở khoá, fix lại UI cho chức năng thêm sản phẩm, lưu ý là phải xem lại phân trang cho phần product)
