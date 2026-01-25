import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../configs/prisma-client.config";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CommonStatus } from "prisma/generated/client";

@Injectable()
export class CategoriesService {
    constructor(private prismaService: PrismaService) { }

    async getCategories() {
        const result = await this.prismaService.prismaClient.categories.findMany({
            where: {
                isDelete: false
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return result;
    }

    async getCategoriesPagination(page: number, limit: number) {
        if (page < 1 || limit < 1) {
            throw new BadRequestException("Số trang và số lượng phải lớn hơn 0");
        }

        const skip = (page - 1) * limit;

        const [categories, total] = await Promise.all([
            this.prismaService.prismaClient.categories.findMany({
                where: {
                    isDelete: false
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            this.prismaService.prismaClient.categories.count({
                where: {
                    isDelete: false
                }
            })
        ]);

        return {
            data: categories,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getCategoryById(id: string) {
        const category = await this.prismaService.prismaClient.categories.findUnique({
            where: { id }
        });

        if (!category) {
            throw new NotFoundException("Không tìm thấy danh mục");
        }

        if (category.isDelete) {
            throw new NotFoundException("Không thể lấy danh mục bị xóa");
        }

        return category;
    }

    async searchCategories(conditions: { name?: string; status?: "Active" | "UnActive" | "Other" }) {
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

        const result = await this.prismaService.prismaClient.categories.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return result;
    }

    async createCategory(body: CreateCategoryDto) {
        const existingCategory = await this.prismaService.prismaClient.categories.findFirst({
            where: {
                name: body.name,
                isDelete: false
            }
        });

        if (existingCategory) {
            throw new BadRequestException("Tên của danh mục này đã tồn tại");
        }

        const newCategory = await this.prismaService.prismaClient.categories.create({
            data: {
                name: body.name,
                status: (body.status as CommonStatus) ?? CommonStatus.Other
            }
        });

        return newCategory;
    }

    async updateCategory(id: string, body: { name?: string; status?: "Active" | "UnActive" | "Other" }) {
        const category = await this.prismaService.prismaClient.categories.findUnique({
            where: { id }
        });

        if (!category) {
            throw new NotFoundException("Không tìm thấy danh mục");
        }

        if (category.isDelete) {
            throw new BadRequestException("Không thể cập nhật danh mục bị xóa");
        }

        if (body.name && body.name !== category.name) {
            const existingCategory = await this.prismaService.prismaClient.categories.findFirst({
                where: {
                    name: body.name,
                    isDelete: false,
                    id: { not: id }
                }
            });

            if (existingCategory) {
                throw new BadRequestException("Tên danh mục này đã được sử dụng");
            }
        }

        const updatedCategory = await this.prismaService.prismaClient.categories.update({
            where: { id },
            data: {
                name: body.name,
                status: body.status
            }
        });

        return updatedCategory;
    }

    async softDeleteCategory(id: string) {
        const category = await this.prismaService.prismaClient.categories.findUnique({
            where: { id }
        });

        if (!category) {
            throw new NotFoundException("Không tìm thấy danh mục");
        }

        if (category.isDelete) {
            throw new BadRequestException("Danh mục này đã được xóa");
        }

        const deletedCategory = await this.prismaService.prismaClient.categories.update({
            where: { id },
            data: {
                isDelete: true
            }
        });

        return deletedCategory;
    }
}
