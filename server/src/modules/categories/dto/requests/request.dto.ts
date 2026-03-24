import { CommonStatus } from "prisma/generated/enums";

export class CreateCategoryDto {
    name: string;
    status: CommonStatus;
}

export class UpdateCategoryDto {
    name?: string;
    status?: CommonStatus;
}