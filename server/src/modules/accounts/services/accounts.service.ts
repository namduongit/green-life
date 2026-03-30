
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/configs/prisma-client.config';
import { SearchParamsQuery } from 'prisma-searchparams-mapper';
import { Prisma } from 'prisma/generated/browser';
import { AccountResponseDto } from '../dto/responses/response.dto';
import { CreateAccountDto, UpdateAccountDto } from '../dto/requests/request.dto';

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
}
