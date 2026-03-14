import type { CommonStatus } from "../../lib/types/enums.typs";
import type {
    Category,
    Product,
    ProductProperty,
    Tags,
} from "../../lib/types/models.type";

export type GetProductRep = Omit<Product, "createdAt" | "updatedAt"> & {
    property: Omit<ProductProperty, "createdAt" | "updatedAt">;
    category: Pick<Category, "id" | "name">;
    tagItems: {
        tag: Tags;
    }[];
};

export type QueryGetProducts = {
    id?: string;
    "property.id"?: string;
    "property.id_in"?: string;
    "property.name_contains"?: string;
    "category.id"?: string;
    page?: string;
    order?: string;
    pageSize?: string;
    "tagItems.some.tag.id"?: string;
    "property.description_contains"?: string;
};

export type CreateProductForm = {
    currentStock: number;

    status: CommonStatus;

    categoryId: string;

    tags: {
        id: string;
    }[];

    property: Omit<ProductProperty, "createdAt" | "updatedAt" | "id">;

    price: number;
};
