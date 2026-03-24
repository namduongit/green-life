import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CommonStatus, Prisma } from 'prisma/generated/client';
import { PrismaService } from 'src/configs/prisma-client.config';
import { TagPaginationResponseDto, TagResponseDto } from '../dto/responses/response.dto';
import { CreateTagDto, UpdateTagDto } from '../dto/requests/request.dto';

@Injectable()
export class TagsService {
    constructor(private prismaService: PrismaService) { }

    async getTags(): Promise<TagResponseDto[]> {
        const result = await this.prismaService.prismaClient.tags.findMany({
            // where: {
            //     isDelete: false,
            // },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return result;
    }

    async getTagsPagination(page: number, limit: number): Promise<TagPaginationResponseDto> {
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

    async getTagById(id: string): Promise<TagResponseDto> {
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

    async searchTags(conditions: { name?: string; status?: CommonStatus }): Promise<TagResponseDto[]> {
        const where: Prisma.TagsWhereInput = {
            isDelete: false,
        };

        if (conditions.name) {
            where.name = {
                contains: conditions.name,
                mode: 'insensitive',
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

    async createTag(body: CreateTagDto): Promise<TagResponseDto> {
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
                status: body.status ?? CommonStatus.Active,
            },
        });

        return newTag;
    }

    async updateTag(id: string, body: UpdateTagDto): Promise<TagResponseDto> {
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

        const data: Prisma.TagsUpdateInput = {};
        if (body.name) {
            data.name = body.name;
        }
        if (body.status) {
            data.status = body.status;
        }

        const updatedTag = await this.prismaService.prismaClient.tags.update({
            where: { id },
            data,
        });

        return updatedTag;
    }

    async softDeleteTag(id: string): Promise<TagResponseDto> {
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

    async reActivateTag(id: string) {
        const tag = await this.prismaService.prismaClient.tags.findUnique({
            where: { id },
        });

        if (!tag) {
            throw new NotFoundException('Không tìm thấy thẻ');
        }

        if (!tag.isDelete) {
            throw new BadRequestException('Thẻ này đang được kích hoạt');
        }


        const reActivatedTag = await this.prismaService.prismaClient.tags.update({
            where: { id },
            data: {
                isDelete: false,
            },
        });

        return reActivatedTag;
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> f69e5af (Them type, dùng query, thêm chức năng mở khoá, fix lại UI cho chức năng thêm sản phẩm, lưu ý là phải xem lại phân trang cho phần product)
