import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../configs/prisma-client.config";
import { CreateTagDto } from "./dto/create-tag.dto";
import { CommonStatus } from "prisma/generated/client";

@Injectable()
export class TagsService {
    constructor(private prismaService: PrismaService) { }

    // GET: Lấy tất cả tags (không bao gồm tags bị xóa mềm)
    async getTags() {
        const result = await this.prismaService.prismaClient.tags.findMany({
            where: {
                isDelete: false
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return result;
    }

    // GET: Lấy tags theo phân trang
    async getTagsPagination(page: number, limit: number) {
        if (page < 1 || limit < 1) {
            throw new BadRequestException('Page and limit must be greater than 0');
        }

        const skip = (page - 1) * limit;

        const [tags, total] = await Promise.all([
            this.prismaService.prismaClient.tags.findMany({
                where: {
                    isDelete: false
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            this.prismaService.prismaClient.tags.count({
                where: {
                    isDelete: false
                }
            })
        ]);

        return {
            data: tags,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    // GET: Lấy tag theo ID
    async getTagById(id: string) {
        const tag = await this.prismaService.prismaClient.tags.findUnique({
            where: { id }
        });

        if (!tag) {
            throw new NotFoundException(`Tag with ID ${id} not found`);
        }

        if (tag.isDelete) {
            throw new NotFoundException(`Tag with ID ${id} has been deleted`);
        }

        return tag;
    }

    // GET: Tìm kiếm tags theo điều kiện
    async searchTags(conditions: { name?: string; status?: "Active" | "UnActive" | "Other" }) {
        const where: any = {
            isDelete: false
        };

        if (conditions.name) {
            where.name = {
                $regex: conditions.name,
                $options: 'i' // Case insensitive
            };
        }

        if (conditions.status) {
            where.status = conditions.status;
        }

        const result = await this.prismaService.prismaClient.tags.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return result;
    }

    // POST: Tạo tag mới
    async createTag(body: CreateTagDto) {
        const existingTag = await this.prismaService.prismaClient.tags.findFirst({
            where: {
                name: body.name,
                isDelete: false
            }
        });

        if (existingTag) {
            throw new BadRequestException('Tag with this name already exists');
        }

        const newTag = await this.prismaService.prismaClient.tags.create({
            data: {
                name: body.name,
                status: (body.status as CommonStatus) ?? CommonStatus.Other
            }
        });

        return newTag;
    }

    // PUT: Cập nhật tag
    async updateTag(id: string, body: { name?: string; status?: "Active" | "UnActive" | "Other" }) {
        const tag = await this.prismaService.prismaClient.tags.findUnique({
            where: { id }
        });

        if (!tag) {
            throw new NotFoundException(`Tag with ID ${id} not found`);
        }

        if (tag.isDelete) {
            throw new BadRequestException(`Cannot update deleted tag`);
        }

        // Kiểm tra nếu cập nhật name, không được trùng với tag khác
        if (body.name && body.name !== tag.name) {
            const existingTag = await this.prismaService.prismaClient.tags.findFirst({
                where: {
                    name: body.name,
                    isDelete: false,
                    id: { not: id }
                }
            });

            if (existingTag) {
                throw new BadRequestException('Tag with this name already exists');
            }
        }

        const updatedTag = await this.prismaService.prismaClient.tags.update({
            where: { id },
            data: {
                name: body.name,
                status: body.status
            }
        });

        return updatedTag;
    }

    // DELETE: Xóa mềm tag (thay đổi isDelete thành true)
    async softDeleteTag(id: string) {
        const tag = await this.prismaService.prismaClient.tags.findUnique({
            where: { id }
        });

        if (!tag) {
            throw new NotFoundException(`Tag with ID ${id} not found`);
        }

        if (tag.isDelete) {
            throw new BadRequestException('Tag is already deleted');
        }

        const deletedTag = await this.prismaService.prismaClient.tags.update({
            where: { id },
            data: {
                isDelete: true
            }
        });

        return deletedTag;
    }
}