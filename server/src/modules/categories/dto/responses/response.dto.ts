import { PaginationDto } from "src/modules/common.dto";

export class CategoryResponseDto {
    id: string;
    name: string;
    status: string;
    isDelete: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class CategoryPaginationResponseDto {
    data: CategoryResponseDto[];
    pagination: PaginationDto;
}