export class CreateCategoryDto {
    name: string;
    status: string;
}

export class UpdateCategoryDto {
    name?: string;
    status?: string;
}