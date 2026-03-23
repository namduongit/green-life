import { CommonStatus } from "prisma/generated/enums";

export class CreateTagDto {
    name: string;
    status: CommonStatus;
}

export class UpdateTagDto {
    name?: string;
    status?: CommonStatus;
}