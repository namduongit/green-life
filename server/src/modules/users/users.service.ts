import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/configs/prisma-client.config';
import { CreateUserDto } from './dto/create-dto';
import { UpdateUserDto } from './dto/update-dto';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}
    async findAll(query: any) {
        const data = await this.prismaService.prismaClient.accounts.findMany();

        return data;
    }

    async findOne(id: string) {
        const data = await this.prismaService.prismaClient.accounts.findUnique({
            where: { id: id },
        });

        return data;
    }

    async create(data: CreateUserDto) {
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

        return newUser;
    }

    async update(id: string, data: UpdateUserDto) {
        const updatedUser = await this.prismaService.prismaClient.accounts.update({
            where: { id: id },
            data: {
                email: data.email,
                password: data.password,
                role: data.role,
            },
        });

        return updatedUser;
    }

    async deleteUser(id: string) {
        // soft delete implementation
        const deletedUser = await this.prismaService.prismaClient.accounts.update({
            where: { id: id },
            data: {
                isLock: true,
            },
        });

        return deletedUser;
    }
}
