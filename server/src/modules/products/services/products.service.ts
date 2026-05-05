import { Injectable, NotFoundException } from '@nestjs/common';
import { SearchParamsQuery } from 'prisma-searchparams-mapper';
import { CommonStatus } from 'prisma/generated/enums';
import { Prisma, Properties } from 'prisma/generated/client';
import { ProductsOrderByWithRelationInput, ProductsWhereInput } from 'prisma/generated/models';
import { PrismaService } from 'src/configs/prisma-client.config';
import { PaginationDto } from 'src/modules/common.dto';
import { CreateProductDto } from '../dto/requests/request.dto';
import { ProductListResponseDto, ProductResponseDto } from '../dto/responses/response.dto';
import { Cron } from '@nestjs/schedule';

const PRODUCT_INCLUDE = {
    category: {
        select: {
            id: true,
            name: true,
        },
    },
    property: {
        select: {
            urlImage: true,
            name: true,
            description: true,
            weight: true,
            unit: true,
            length: true,
            width: true,
            height: true,
            price: true,
        },
    },
    tagItems: {
        select: {
            tag: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    },
} as const;

type ProductWithRelations = Prisma.ProductsGetPayload<{
    include: typeof PRODUCT_INCLUDE;
}>;

@Injectable()
export class ProductsService {
    constructor(private readonly prismaService: PrismaService) {}

    // tính toán sản phẩm hot dựa trên số lượng bán ra trong ngày
    @Cron('0 0 * * *') // Chạy vào lúc 00:00 hàng ngày
    // @Cron('*/30 * * * * *') // Chạy mỗi 30 giây (dùng cho mục đích test)
    async calculateHotProducts() {
        console.log('Calculating hot products...');
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // Lấy số lượng bán ra của từng sản phẩm trong ngày
        const salesData = await this.prismaService.prismaClient.orderItems.groupBy({
            by: ['productId'],
            where: {
                order: {
                    createdAt: {
                        gte: startOfDay,
                        lt: endOfDay,
                    },
                },
            },
            _sum: {
                quantity: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: 10, // Lấy top 10 sản phẩm bán chạy nhất
        });

        // delete all hot products cũ
        await this.prismaService.prismaClient.hotProducts.deleteMany({});

        // Thêm sản phẩm hot mới vào bảng hotProducts
        const hotProductsData = salesData.map((item) => ({
            productId: item.productId,
            soldQuantity: item._sum.quantity ?? 0,
        }));

        if (hotProductsData.length == 0) return false;

        await this.prismaService.prismaClient.hotProducts.createMany({
            data: hotProductsData,
        });

        return true;
    }

    async getHotProducts(): Promise<ProductResponseDto[]> {
        const hotProducts = await this.prismaService.prismaClient.hotProducts.findMany({
            orderBy: {
                soldQuantity: 'desc',
            },
            include: {
                product: {
                    include: PRODUCT_INCLUDE,
                },
            },
        });

        if (hotProducts.length === 0) {
            const haveCalculated = await this.calculateHotProducts();

            if (!haveCalculated) {
                // lấy random 10 sản phẩm nếu chưa có sản phẩm hot nào được tính toán
                const randomProducts = await this.prismaService.prismaClient.products.findMany({
                    where: { isDelete: false },
                    take: 10,
                    include: PRODUCT_INCLUDE,
                });

                return randomProducts.map((product) => this.mapProduct(product));
            }

            return this.getHotProducts();
        }

        return hotProducts.map((hotProduct) => this.mapProduct(hotProduct.product));
    }

    async getAllProducts(
        filter: SearchParamsQuery<ProductsWhereInput, ProductsOrderByWithRelationInput>,
        /**
         *
         *
         */
    ): Promise<ProductListResponseDto> {
        const where = this.buildWhereClause(filter.where);

        const [products, total] = await Promise.all([
            this.prismaService.prismaClient.products.findMany({
                where,
                orderBy: filter.orderBy,
                skip: filter.skip,
                take: filter.take,
                include: PRODUCT_INCLUDE,
            }),
            filter.take ? this.prismaService.prismaClient.products.count({ where }) : Promise.resolve(0),
        ]);

        const data = products.map((product) => this.mapProduct(product));
        const pagination = this.buildPagination(filter.skip, filter.take, total);

        return {
            data,
            ...(pagination ? { pagination } : {}),
        };
    }

    async getProductById(id: string): Promise<ProductResponseDto> {
        const product = await this.prismaService.prismaClient.products.findUnique({
            where: { id },
            include: PRODUCT_INCLUDE,
        });

        if (!product || product.isDelete) {
            throw new NotFoundException('Sản phẩm không tồn tại');
        }

        return this.mapProduct(product);
    }

    async getRelatedProducts(id: string, limit = 8): Promise<ProductResponseDto[]> {
        const product = await this.prismaService.prismaClient.products.findUnique({
            where: { id },
            select: { categoryId: true },
        });

        if (!product) {
            throw new NotFoundException('Sản phẩm không tồn tại');
        }

        const related = await this.prismaService.prismaClient.products.findMany({
            where: {
                categoryId: product.categoryId,
                id: { not: id },
                isDelete: false,
                status: 'Active',
            },
            take: limit,
            include: PRODUCT_INCLUDE,
        });

        return related.map((p) => this.mapProduct(p));
    }

    async createProduct(data: CreateProductDto): Promise<ProductResponseDto> {
        const newProduct = await this.prismaService.prismaClient.products.create({
            data: {
                currentStock: data.currentStock,
                status: data.status,
                categoryId: data.categoryId,
                property: data.property
                    ? {
                          create: {
                              urlImage: data.property.urlImage,
                              name: data.property.name,
                              description: data.property.description,
                              weight: data.property.weight,
                              unit: data.property.unit,
                              length: data.property.length,
                              width: data.property.width,
                              height: data.property.height,
                              price: data.price,
                          },
                      }
                    : undefined,
                tagItems: {
                    create: data.tags.map((tag) => ({
                        tagId: tag.id,
                    })),
                },
            },
        });

        return this.getProductById(newProduct.id);
    }

    async deleteProduct(id: string): Promise<ProductResponseDto> {
        await this.prismaService.prismaClient.products.update({
            where: { id },
            data: {
                isDelete: true,
            },
        });

        return this.getProductById(id);
    }

    async changeStock(id: string, newStock: number): Promise<ProductResponseDto> {
        await this.prismaService.prismaClient.products.update({
            where: { id },
            data: {
                currentStock: newStock,
            },
        });

        return this.getProductById(id);
    }

    async updateStatus(id: string, newStatus: CommonStatus): Promise<ProductResponseDto> {
        await this.prismaService.prismaClient.products.update({
            where: { id },
            data: {
                status: newStatus,
            },
        });

        return this.getProductById(id);
    }

    async updateCategory(id: string, categoryId: string): Promise<ProductResponseDto> {
        await this.prismaService.prismaClient.products.update({
            where: { id },
            data: {
                categoryId,
            },
        });

        return this.getProductById(id);
    }

    async updateTags(id: string, tagIds: string[]): Promise<ProductResponseDto> {
        await this.prismaService.prismaClient.$transaction(async (prisma) => {
            await prisma.tagProducts.deleteMany({
                where: { productId: id },
            });

            if (tagIds.length === 0) {
                return;
            }

            await prisma.tagProducts.createMany({
                data: tagIds.map((tagId) => ({
                    productId: id,
                    tagId,
                })),
            });
        });

        return this.getProductById(id);
    }

    async updateProperty(id: string, propertyData: Partial<Properties>): Promise<ProductResponseDto> {
        await this.prismaService.prismaClient.properties.upsert({
            where: { productId: id },
            create: {
                productId: id,
                urlImage: propertyData.urlImage ?? '',
                name: propertyData.name ?? '',
                description: propertyData.description ?? '',
                weight: propertyData.weight ?? '',
                unit: propertyData.unit ?? 'Kilogram',
                length: propertyData.length ?? 0,
                width: propertyData.width ?? 0,
                height: propertyData.height ?? 0,
                price: propertyData.price ?? 0,
            },
            update: {
                urlImage: propertyData.urlImage,
                name: propertyData.name,
                description: propertyData.description,
                weight: propertyData.weight,
                unit: propertyData.unit,
                length: propertyData.length,
                width: propertyData.width,
                height: propertyData.height,
                price: propertyData.price,
            },
        });

        return this.getProductById(id);
    }

    private mapProduct(product: ProductWithRelations): ProductResponseDto {
        return {
            id: product.id,
            currentStock: product.currentStock,
            status: product.status,
            category: {
                id: product.category.id,
                name: product.category.name,
            },
            tags: product.tagItems.map((tagItem) => ({
                id: tagItem.tag.id,
                name: tagItem.tag.name,
            })),
            property: product.property
                ? {
                      urlImage: product.property.urlImage,
                      name: product.property.name,
                      description: product.property.description,
                      weight: product.property.weight,
                      unit: product.property.unit,
                      length: product.property.length,
                      width: product.property.width,
                      height: product.property.height,
                      price: product.property.price,
                  }
                : undefined,
            isDelete: product.isDelete,
        };
    }

    private buildWhereClause(filter?: ProductsWhereInput): ProductsWhereInput {
        if (!filter) {
            return { isDelete: false };
        }

        return {
            AND: [{ isDelete: false }, filter],
        };
    }

    private buildPagination(skip = 0, take = 0, total = 0): PaginationDto | undefined {
        if (!take || take <= 0) {
            return undefined;
        }

        return {
            page: Math.floor((skip ?? 0) / take) + 1,
            limit: take,
            total,
            totalPages: Math.ceil(total / take),
        };
    }
}
