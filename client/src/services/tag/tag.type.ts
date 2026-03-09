type TagRep = {
    id: string;
    name: string;
    status: string;
    isDelete: boolean;
    createdAt: Date;
    updatedAt: Date;
};

type CreateTagForm = {
    name: string;
    status?: string;
};

type UpdateTagForm = {
    name?: string;
    status?: string;
};

export type {TagRep,CreateTagForm,UpdateTagForm};