import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/configs/prisma-client.config';
import { Product, ProductProperty, ProductStatusType } from './entities/products.entitie';
import { SearchParamsQuery } from 'prisma-searchparams-mapper';
import { ProductsOrderByWithRelationInput, ProductsWhereInput } from 'prisma/generated/models';
import { CreateProductDto } from './dto/createProduct.dto';

const INCLUDE_PRODUCT_RELATIONS = {
    category: {
        select: {
            id: true,
            name: true,
        },
    },
    property: {
        omit: {
            createdAt: true,
            updatedAt: true,
        },
    },
    tagItems: {
        select: {
            tag: {
                omit: {
                    createdAt: true,
                    updatedAt: true,
                    isDelete: true,
                    status: true,
                },
            },
        },
    },
};

@Injectable()
export class ProductsService {
    constructor(private readonly prismaService: PrismaService) {}

    async getAllProducts(
        filter: SearchParamsQuery<ProductsWhereInput, ProductsOrderByWithRelationInput>,
    ): Promise<Product[]> {
        const products = await this.prismaService.prismaClient.products.findMany({
            include: INCLUDE_PRODUCT_RELATIONS,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            where: filter.where,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            orderBy: filter.orderBy,
            skip: filter.skip,
            take: filter.take,
        });

        // how to map tagItems to tags
        const mappedProducts = products.map((product) => {
            const { tagItems, ...rest } = product;
            const tags = tagItems.map((tagItem) => tagItem.tag);
            return {
                ...rest,
                tags,
            };
        });

        return mappedProducts;
    }

    async getProductById(id: string): Promise<Product | null> {
        const product = await this.prismaService.prismaClient.products.findUnique({
            where: {
                id,
            },
            include: INCLUDE_PRODUCT_RELATIONS,
        });

        if (!product) {
            return null;
        }

        const { tagItems, ...rest } = product;
        const tags = tagItems.map((tagItem) => tagItem.tag);
        return {
            ...rest,
            tags,
        };
    }

    async createProduct(data: CreateProductDto): Promise<Product> {
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

        const createdProduct = await this.getProductById(newProduct.id);

        if (!createdProduct) {
            throw new Error('Product creation failed');
        }

        return createdProduct;
    }

    async deleteProduct(id: string): Promise<void> {
        await this.prismaService.prismaClient.products.update({
            where: {
                id,
            },
            data: {
                isDelete: true,
            },
        });
    }

    async changeStock(id: string, newStock: number): Promise<Product | null> {
        await this.prismaService.prismaClient.products.update({
            where: {
                id,
            },
            data: {
                currentStock: newStock,
            },
        });

        return this.getProductById(id);
    }

    async updateStatus(id: string, newStatus: ProductStatusType): Promise<Product | null> {
        await this.prismaService.prismaClient.products.update({
            where: {
                id,
            },
            data: {
                status: newStatus,
            },
        });

        return this.getProductById(id);
    }

    async updateCategory(id: string, categoryId: string): Promise<Product | null> {
        await this.prismaService.prismaClient.products.update({
            where: {
                id,
            },
            data: {
                categoryId,
            },
        });

        return this.getProductById(id);
    }

    async updateTags(id: string, tagIds: string[]): Promise<Product | null> {
        await this.prismaService.prismaClient.$transaction(async (prisma) => {
            // First, delete existing tagItems
            await prisma.tagProducts.deleteMany({
                where: {
                    productId: id,
                },
            });
            // Then, create new tagItems
            const createTagItems = tagIds.map((tagId) => ({
                productId: id,
                tagId,
            }));
            await prisma.tagProducts.createMany({
                data: createTagItems,
            });
        });

        return this.getProductById(id);
    }

    async updateProperty(id: string, propertyData: Partial<ProductProperty>): Promise<Product | null> {
        await this.prismaService.prismaClient.properties.upsert({
            where: {
                productId: id,
            },
            create: {
                productId: id,
                urlImage: propertyData.urlImage || '',
                name: propertyData.name || '',
                description: propertyData.description || '',
                weight: propertyData.weight || '',
                unit: propertyData.unit || 'Other',
                length: propertyData.length || 0,
                width: propertyData.width || 0,
                height: propertyData.height || 0,
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
            },
        });

        return this.getProductById(id);
    }
}
