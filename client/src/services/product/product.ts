import { api } from "../../lib/api/api";
import type { ProductRep } from "./product.type";

export type GetAllProductsOptions = {
    page?: number;
    pageSize?: number;
    nameContains?: string;
    categoryId?: string;
    hotProducts?: boolean;
};

// Overload 1: object options
export function getAllProducts(options?: GetAllProductsOptions): Promise<any>;
// Overload 2: positional args (legacy — dùng trong home.tsx)
export function getAllProducts(page: number, pageSize?: number, hotProducts?: boolean): Promise<any>;

// Implementation
export async function getAllProducts(
    optionsOrPage?: GetAllProductsOptions | number,
    legacyPageSize?: number,
    legacyHotProducts?: boolean,
) {
    let opts: GetAllProductsOptions;

    if (typeof optionsOrPage === "number") {
        // Dạng positional: getAllProducts(1, 8, true)
        opts = {
            page: optionsOrPage,
            pageSize: legacyPageSize,
            hotProducts: legacyHotProducts,
        };
    } else {
        // Dạng object: getAllProducts({ page: 1, pageSize: 8 })
        opts = optionsOrPage ?? {};
    }

    const { page = 1, pageSize = 10, nameContains, categoryId, hotProducts } = opts;

    // Build flat query params khớp với PrismaQueryPipeline của server
    const params: Record<string, string> = {
        page: String(page),
        pageSize: String(pageSize),
    };

    if (nameContains) params["property.name_contains"] = nameContains;
    if (categoryId) params["category.id"] = categoryId;
    if (hotProducts) params["hotProducts"] = "true";

    const qs = new URLSearchParams(params).toString();
    const response = await api.get<ProductRep[]>(`/api/products?${qs}`);
    return response;
}

export const getProductById = async (id: string) => {
    const response = await api.get<ProductRep>(`/api/products/${id}`);
    return response;
};

export const getRelatedProducts = async (id: string, limit: number = 8) => {
    const response = await api.get<ProductRep[]>(`/api/products/${id}/related?limit=${limit}`);
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
