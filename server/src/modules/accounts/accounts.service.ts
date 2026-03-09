import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/configs/prisma-client.config';
import { CreateUserDto } from './dto/create-dto';
import { UpdateUserDto } from './dto/update-dto';
import type { AccountRep } from './dto/account-response';
import { SearchParamsQuery } from 'prisma-searchparams-mapper';
import { Prisma } from 'prisma/generated/browser';

@Injectable()
export class AccountsService {
    constructor(private readonly prismaService: PrismaService) {}
    async findAll(
        query: SearchParamsQuery<Prisma.AccountsWhereInput, Prisma.AccountsOrderByWithRelationInput>,
    ): Promise<AccountRep[]> {
        const data = await this.prismaService.prismaClient.accounts.findMany({
            ...query,
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

    async findOne(id: string): Promise<AccountRep> {
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

    async create(data: CreateUserDto): Promise<AccountRep> {
        const newUser = await this.prismaService.prismaClient.accounts.create({
            data: {
                email: data.email,
                password: data.password,
                role: data.role,
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

    async update(id: string, data: UpdateUserDto): Promise<AccountRep> {
        const updatedUser = await this.prismaService.prismaClient.accounts.update({
            where: { id: id },
            data: {
                email: data.email,
                password: data.password,
                role: data.role,
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

    async deleteUser(id: string): Promise<AccountRep> {
        // soft delete implementation
        const deletedUser = await this.prismaService.prismaClient.accounts.update({
            where: { id: id },
            data: {
                isLock: true,
            },
        });

        return {
            id: deletedUser.id,
            createdAt: deletedUser.createdAt,
            updatedAt: deletedUser.updatedAt,
            email: deletedUser.email,
            role: deletedUser.role,
            isLock: deletedUser.isLock,
        };
    }
}
