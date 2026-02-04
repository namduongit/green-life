import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/createProduct.dto';
import { ProductsQueryDto } from './dto/getAllProduct.dto';
import { UpdateProductPropertyDto } from './dto/updateProductProperty.dto';
import { UpdateProductStatusDto } from './dto/updateProductStatus.dto';
import { UpdateProductStockDto } from './dto/updateProductStock.dto';
import { UpdateProductTagsDto } from './dto/updateProductTags.dto';
import { ProductsService } from './products.service';

/**
 *
 * Hello everyone Hiếu (luky) đây
 *
 * thì đầu tiên phải biết product là gì trước đã
 *
 * thì tôi định nghĩ product như sau
 *
 *
 * Products:
 *  - id: string
 *  - currentStock: number
 *  - status: enum (active, inactive, others)
 *  - category:
 *    - id: string
 *    - name: string
 *
 *  - tags: []
 *    - id: string
 *    - name: string
 *
 *  - property:
 *    - urlImage: string
 *    - name: string
 *    - description: string
 *    - weight: number
 *    - unit: string
 *    - length: number
 *    - width: number
 *    - height: number
 *
 *
 * phương thức của products
 * - changeStock
 * - updateStatus
 * - updateTags
 * - updateProperty
 * - updateCategory
 *
 * map to controller
 *
 *
 * - GET /api/products -> get all products
 * - GET /api/products/:id -> get product by id
 * - POST /api/products -> create product
 * - PATH /api/products/:id/stock -> change stock
 * - PATCH /api/products/:id/status -> update status
 * - PATCH /api/products/:id/tags -> update tags
 * - PATCH /api/products/:id/property -> update property
 * - PATCH /api/products/:id/category -> update category
 *
 */

@Controller('api/products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get('/')
    async getAllProducts(@Query(new ProductsQueryDto()) searchParams: any) {
        console.log('Parsed Query:', JSON.stringify(searchParams, null, 2));

        const products = await this.productsService.getAllProducts(searchParams);
        return products;
    }

    @Get('/:id')
    async getProductById(@Param('id') id: string) {
        const product = await this.productsService.getProductById(id);
        return product;
    }

    @Post('/')
    async createProduct(@Body() productData: CreateProductDto) {
        console.log('Create Product Data:', productData);
        const newProduct = await this.productsService.createProduct(productData);
        return newProduct;
    }

    @Patch('/:id/stock')
    async changeStock(@Param('id') id: string, @Body() stockData: UpdateProductStockDto) {
        const updatedProduct = await this.productsService.changeStock(id, stockData.stock);
        return updatedProduct;
    }

    @Patch('/:id/status')
    async updateStatus(@Param('id') id: string, @Body() statusData: UpdateProductStatusDto) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const updatedProduct = await this.productsService.updateStatus(id, statusData.status as any);
        return updatedProduct;
    }

    @Patch('/:id/tags')
    async updateTags(@Param('id') id: string, @Body() tagsData: UpdateProductTagsDto) {
        const updatedProduct = await this.productsService.updateTags(id, tagsData.tags);
        return updatedProduct;
    }

    @Patch('/:id/property')
    async updateProperty(@Param('id') id: string, @Body() propertyData: UpdateProductPropertyDto) {
        const updatedProduct = await this.productsService.updateProperty(id, propertyData.property);
        return updatedProduct;
    }

    @Patch('/:id/category')
    async updateCategory(
        @Param('id') id: string,
        @Body()
        categoryData: {
            category: {
                id: string;
            };
        },
    ) {
        const updatedProduct = await this.productsService.updateCategory(id, categoryData.category.id);
        return updatedProduct;
    }

    @Delete('/:id')
    async deleteProduct(@Param('id') id: string) {
        const deletedProduct = await this.productsService.deleteProduct(id);
        return deletedProduct;
    }
}
