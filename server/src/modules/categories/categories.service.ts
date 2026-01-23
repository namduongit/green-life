import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../configs/prisma-client.config";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CommonStatus } from "prisma/generated/client";

@Injectable()
export class CategoriesService {
    constructor(private prismaService: PrismaService) { }

    // GET: Lấy tất cả categories (không bao gồm categories bị xóa mềm)
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

    // GET: Lấy categories theo phân trang
    async getCategoriesPagination(page: number, limit: number) {
        if (page < 1 || limit < 1) {
            throw new BadRequestException('Page and limit must be greater than 0');
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

    // GET: Lấy category theo ID
    async getCategoryById(id: string) {
        const category = await this.prismaService.prismaClient.categories.findUnique({
            where: { id }
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        if (category.isDelete) {
            throw new NotFoundException(`Category with ID ${id} has been deleted`);
        }

        return category;
    }

    // GET: Tìm kiếm categories theo điều kiện
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

    // POST: Tạo category mới
    async createCategory(body: CreateCategoryDto) {
        const existingCategory = await this.prismaService.prismaClient.categories.findFirst({
            where: {
                name: body.name,
                isDelete: false
            }
        });

        if (existingCategory) {
            throw new BadRequestException('Category with this name already exists');
        }

        const newCategory = await this.prismaService.prismaClient.categories.create({
            data: {
                name: body.name,
                status: (body.status as CommonStatus) ?? CommonStatus.Other
            }
        });

        return newCategory;
    }

    // PUT: Cập nhật category
    async updateCategory(id: string, body: { name?: string; status?: "Active" | "UnActive" | "Other" }) {
        const category = await this.prismaService.prismaClient.categories.findUnique({
            where: { id }
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        if (category.isDelete) {
            throw new BadRequestException(`Cannot update deleted category`);
        }

        // Kiểm tra nếu cập nhật name, không được trùng với category khác
        if (body.name && body.name !== category.name) {
            const existingCategory = await this.prismaService.prismaClient.categories.findFirst({
                where: {
                    name: body.name,
                    isDelete: false,
                    id: { not: id }
                }
            });

            if (existingCategory) {
                throw new BadRequestException('Category with this name already exists');
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

    // DELETE: Xóa mềm category (thay đổi isDelete thành true)
    async softDeleteCategory(id: string) {
        const category = await this.prismaService.prismaClient.categories.findUnique({
            where: { id }
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        if (category.isDelete) {
            throw new BadRequestException('Category is already deleted');
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
