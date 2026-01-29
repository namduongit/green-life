import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../configs/prisma-client.config';
import { CreateTagDto } from './dto/create-tag.dto';
import { CommonStatus } from 'prisma/generated/client';

@Injectable()
export class TagsService {
    constructor(private prismaService: PrismaService) {}

    async getTags() {
        const result = await this.prismaService.prismaClient.tags.findMany({
            where: {
                isDelete: false,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return result;
    }

    async getTagsPagination(page: number, limit: number) {
        if (page < 1 || limit < 1) {
            throw new BadRequestException('Số trang và số lượng phải lớn hơn 0');
        }

        const skip = (page - 1) * limit;

        const [tags, total] = await Promise.all([
            this.prismaService.prismaClient.tags.findMany({
                where: {
                    isDelete: false,
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prismaService.prismaClient.tags.count({
                where: {
                    isDelete: false,
                },
            }),
        ]);

        return {
            data: tags,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getTagById(id: string) {
        const tag = await this.prismaService.prismaClient.tags.findUnique({
            where: { id },
        });

        if (!tag) {
            throw new NotFoundException('Không tìm thấy thẻ');
        }

        if (tag.isDelete) {
            throw new NotFoundException('Không thể lấy thẻ bị xóa');
        }

        return tag;
    }

    async searchTags(conditions: { name?: string; status?: 'Active' | 'UnActive' | 'Other' }) {
        const where: any = {
            isDelete: false,
        };

        if (conditions.name) {
            where.name = {
                $regex: conditions.name,
                $options: 'i', // Case insensitive
            };
        }

        if (conditions.status) {
            where.status = conditions.status;
        }

        const result = await this.prismaService.prismaClient.tags.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
        });

        return result;
    }

    async createTag(body: CreateTagDto) {
        const existingTag = await this.prismaService.prismaClient.tags.findFirst({
            where: {
                name: body.name,
                isDelete: false,
            },
        });

        if (existingTag) {
            throw new BadRequestException('Tên của thẻ này đã tồn tại');
        }

        const newTag = await this.prismaService.prismaClient.tags.create({
            data: {
                name: body.name,
                status: (body.status as CommonStatus) ?? CommonStatus.Other,
            },
        });

        return newTag;
    }

    async updateTag(id: string, body: { name?: string; status?: 'Active' | 'UnActive' | 'Other' }) {
        const tag = await this.prismaService.prismaClient.tags.findUnique({
            where: { id },
        });

        if (!tag) {
            throw new NotFoundException('Không tìm thấy thẻ');
        }

        if (tag.isDelete) {
            throw new BadRequestException('Không thể cập nhật thẻ bị xóa');
        }

        if (body.name && body.name !== tag.name) {
            const existingTag = await this.prismaService.prismaClient.tags.findFirst({
                where: {
                    name: body.name,
                    isDelete: false,
                    id: { not: id },
                },
            });

            if (existingTag) {
                throw new BadRequestException('Tên thẻ đã được sử dụng');
            }
        }

        const updatedTag = await this.prismaService.prismaClient.tags.update({
            where: { id },
            data: {
                name: body.name,
                status: body.status,
            },
        });

        return updatedTag;
    }

    async softDeleteTag(id: string) {
        const tag = await this.prismaService.prismaClient.tags.findUnique({
            where: { id },
        });

        if (!tag) {
            throw new NotFoundException('Không tìm thấy thẻ');
        }

        if (tag.isDelete) {
            throw new BadRequestException('Thẻ này đã được xóa');
        }

        const deletedTag = await this.prismaService.prismaClient.tags.update({
            where: { id },
            data: {
                isDelete: true,
            },
        });

        return deletedTag;
    }
}
