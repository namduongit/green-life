import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { CategoriesService } from "./categories.service";
import { RestResponse } from "src/utils/response.utils";

@Controller("/api/categories")
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) {}

    // GET: Lấy tất cả categories (không xóa mềm)
    @Get()
    async getAll(): Promise<RestResponse> {
        const result = await this.categoriesService.getCategories();   
        return {
            statusCode: 200,
            data: result,
            error: null
        };
    }

    // GET: Lấy categories theo phân trang
    @Get('pagination')
    async getPagination(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10'
    ): Promise<RestResponse> {
        const result = await this.categoriesService.getCategoriesPagination(
            parseInt(page),
            parseInt(limit)
        );
        return {
            statusCode: 200,
            data: result,
            error: null
        };
    }

    // GET: Lấy category theo ID
    @Get('by-id/:id')
    async getById(@Param('id') id: string): Promise<RestResponse> {
        const result = await this.categoriesService.getCategoryById(id);
        return {
            statusCode: 200,
            data: result,
            error: null
        };
    }

    // GET: Lấy categories theo điều kiện (tìm kiếm theo name, status, etc.)
    @Get('search')
    async searchCategories(
        @Query('name') name?: string,
        @Query('status') status?: "Active" | "UnActive" | "Other"
    ): Promise<RestResponse> {
        const result = await this.categoriesService.searchCategories({ name, status });
        return {
            statusCode: 200,
            data: result,
            error: null
        };
    }

    // POST: Thêm mới category
    @Post()
    async create(@Body() body): Promise<RestResponse> {
        const result = await this.categoriesService.createCategory(body);
        return {
            statusCode: 201,
            data: result,
            error: null
        };
    }

    // PUT: Sửa category
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() body: { name?: string, status?: "Active" | "UnActive" | "Other" }
    ): Promise<RestResponse> {
        const result = await this.categoriesService.updateCategory(id, body);
        return {
            statusCode: 200,
            data: result,
            error: null
        };
    }

    // DELETE: Xóa mềm category (thay đổi isDelete thành true)
    @Delete(':id')
    async softDelete(@Param('id') id: string): Promise<RestResponse> {
        const result = await this.categoriesService.softDeleteCategory(id);
        return {
            statusCode: 200,
            data: result,
            error: null
        };
    }
}
