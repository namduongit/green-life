export class AccountResponseDto {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    role: string;
    isLock: boolean;
}

export class AccountPaginationResponseDto {
    data: AccountResponseDto[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}