import { api } from "../../api/api";
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
    const response = await api.get<TagRep[]>(`/api/tags/by-id/${id}`);
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
}