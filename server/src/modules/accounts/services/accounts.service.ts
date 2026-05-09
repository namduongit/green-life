
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/configs/prisma-client.config';
import { SearchParamsQuery } from 'prisma-searchparams-mapper';
import { Prisma } from 'prisma/generated/browser';
import { AccountPaginationResponseDto, AccountResponseDto } from '../dto/responses/response.dto';
import { CreateAccountDto, UpdateAccountDto } from '../dto/requests/request.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountsService {
    constructor(private readonly prismaService: PrismaService) {}
    async findAll(
        query: SearchParamsQuery<Prisma.AccountsWhereInput, Prisma.AccountsOrderByWithRelationInput>,
    ): Promise<AccountResponseDto[]> {
        const data = await this.prismaService.prismaClient.accounts.findMany({
            // ...(query || {}),
        });
        return data.map((account) => ({
            id: account.id,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
            email: account.email,
            role: account.role,
            isLock: account.isLock,
        }));
    }

    async findAllPaginated(page: number, limit: number): Promise<AccountPaginationResponseDto> {
        if (page < 1 || limit < 1) {
            throw new BadRequestException('Số trang và số lượng phải lớn hơn 0');
        }

        const skip = (page - 1) * limit;

        const [accounts, total] = await Promise.all([
            this.prismaService.prismaClient.accounts.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prismaService.prismaClient.accounts.count(),
        ]);

        return {
            data: accounts.map((account) => ({
                id: account.id,
                createdAt: account.createdAt,
                updatedAt: account.updatedAt,
                email: account.email,
                role: account.role,
                isLock: account.isLock,
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string): Promise<AccountResponseDto> {
        const data = await this.prismaService.prismaClient.accounts.findUnique({
            where: { id: id },
        });

        if (!data) {
            throw new BadRequestException('Tài khoản không tồn tại');
        }

        return {
            id: data.id,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            email: data.email,
            role: data.role,
            isLock: data.isLock,
        };
    }

    async create(dto: CreateAccountDto): Promise<AccountResponseDto> {
        const newUser = await this.prismaService.prismaClient.accounts.create({
            data: {
                email: dto.email,
                password: dto.password,
                role: dto.role,
                // NOTE: mấy má nhớ tạo cart khi tạo user nha:w
                cart: {
                    create: {},
                },
            },
        });

        return {
            id: newUser.id,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
            email: newUser.email,
            role: newUser.role,
            isLock: newUser.isLock,
        };
    }

    async update(id: string, dto: UpdateAccountDto): Promise<AccountResponseDto> {
        const updatedUser = await this.prismaService.prismaClient.accounts.update({
            where: { id: id },
            data: {
                email: dto.email,
                password: dto.password,
                role: dto.role,
            },
        });

        return {
            id: updatedUser.id,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
            email: updatedUser.email,
            role: updatedUser.role,
            isLock: updatedUser.isLock,
        };
    }

    async deleteUser(id: string): Promise<AccountResponseDto> {
        // soft delete implementation
        const deActivatedUser = await this.prismaService.prismaClient.accounts.update({
            where: { id: id },
            data: {
                isLock: true,
            },
        });

        return {
            id: deActivatedUser.id,
            createdAt: deActivatedUser.createdAt,
            updatedAt: deActivatedUser.updatedAt,
            email: deActivatedUser.email,
            role: deActivatedUser.role,
            isLock: deActivatedUser.isLock,
        };
    }
    async activate(id: string): Promise<AccountResponseDto> {
        const activatedUser = await this.prismaService.prismaClient.accounts.update({
            where: {id : id},
            data: {
                isLock: false,
            },
        });
        return {
            id: activatedUser.id,
            createdAt: activatedUser.createdAt,
            updatedAt: activatedUser.updatedAt,
            email: activatedUser.email,
            role: activatedUser.role,
            isLock: activatedUser.isLock,
        }
    }

    async lockAccount(id: string): Promise<AccountResponseDto> {
        const updated = await this.prismaService.prismaClient.accounts.update({
            where: { id },
            data: { isLock: true },
        });
        return {
            id: updated.id,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
            email: updated.email,
            role: updated.role,
            isLock: updated.isLock,
        };
    }

    async resetPassword(id: string, newPassword: string): Promise<{ message: string }> {
        const saltRound = parseInt(process.env.SALT_ROUND ?? '10', 10);
        const hashed = await bcrypt.hash(newPassword, saltRound);
        await this.prismaService.prismaClient.accounts.update({
            where: { id },
            data: { password: hashed },
        });
        return { message: 'Đặt lại mật khẩu thành công' };
    }
}
