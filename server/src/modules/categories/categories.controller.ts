import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('/api/categories')
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) {}

    @Get()
    async getAll() {
        const result = await this.categoriesService.getCategories();
        return result;
    }

    @Get('pagination')
    async getPagination(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
        const result = await this.categoriesService.getCategoriesPagination(parseInt(page), parseInt(limit));
        return result;
    }

    @Get('by-id/:id')
    async getById(@Param('id') id: string) {
        const result = await this.categoriesService.getCategoryById(id);
        return result;
    }

    @Get('search')
    async searchCategories(@Query('name') name?: string, @Query('status') status?: 'Active' | 'UnActive' | 'Other') {
        const result = await this.categoriesService.searchCategories({ name, status });
        return result;
    }

    @Post()
    async create(@Body() body) {
        const result = await this.categoriesService.createCategory(body);
        return result;
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() body: { name?: string; status?: 'Active' | 'UnActive' | 'Other' }) {
        const result = await this.categoriesService.updateCategory(id, body);
        return result;
    }

    @Delete(':id')
    async softDelete(@Param('id') id: string) {
        const result = await this.categoriesService.softDeleteCategory(id);
        return result;
    }
}
