type CategoryRep = {
    id: string;
    name: string;
    slug: string;
    status: string;
    isDelete: boolean;
    createdAt: Date;
    updatedAt: Date;
};

type CreateCategoryForm = {
    name: string;
    slug: string;
    status?: string;
};

type UpdateCategoryForm = {
    name?: string;
    slug?: string;
};

export type {CategoryRep,CreateCategoryForm,UpdateCategoryForm};