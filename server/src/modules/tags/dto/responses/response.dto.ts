import { PaginationDto } from "src/modules/common.dto";

export class TagResponseDto {
    id: string;
    name: string;
    status: string;
    isDelete: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class TagPaginationResponseDto {
    data: TagResponseDto[];
    pagination: PaginationDto;
}