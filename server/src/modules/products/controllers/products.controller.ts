
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ProductsQueryDto } from '../dto/requests/getAllProduct.dto';
import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductPropertyDto, UpdateProductStatusDto, UpdateProductStockDto, UpdateProductTagsDto } from '../dto/requests/request.dto';

@Controller('api/products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}

    @Get('/')
    async getAllProducts(@Query(new ProductsQueryDto()) searchParams: any) {
        console.log("namduongit debug", searchParams)
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


    // @Patch('/:id/activate')
    // async ReActivateProduct(@Param('id') id: string) {
    //     const reActivatedProduct = await this.productsService.reActivate(id);
    //     return reActivatedProduct;
    // }

}
