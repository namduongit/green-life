import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { TagsService } from "./tags.service";
import { RestResponse } from "src/utils/response.utils";

@Controller("/api/tags")
export class TagsController {
    constructor(private tagsService: TagsService) {}

    // GET: Lấy tất cả tags (không xóa mềm)
    @Get()
    async getAll(): Promise<RestResponse> {
        const result = await this.tagsService.getTags();   
        return {
            statusCode: 200,
            data: result,
            error: null
        };
    }

    // GET: Lấy tags theo phân trang
    @Get('pagination')
    async getPagination(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10'
    ): Promise<RestResponse> {
        const result = await this.tagsService.getTagsPagination(
            parseInt(page),
            parseInt(limit)
        );
        return {
            statusCode: 200,
            data: result,
            error: null
        };
    }

    // GET: Lấy tag theo ID
    @Get('by-id/:id')
    async getById(@Param('id') id: string): Promise<RestResponse> {
        const result = await this.tagsService.getTagById(id);
        return {
            statusCode: 200,
            data: result,
            error: null
        };
    }

    // GET: Lấy tags theo điều kiện (tìm kiếm theo name, status, etc.)
    @Get('search')
    async searchTags(
        @Query('name') name?: string,
        @Query('status') status?: "Active" | "UnActive" | "Other"
    ): Promise<RestResponse> {
        const result = await this.tagsService.searchTags({ name, status });
        return {
            statusCode: 200,
            data: result,
            error: null
        };
    }

    // POST: Thêm mới tag
    @Post()
    async create(@Body() body): Promise<RestResponse> {
        const result = await this.tagsService.createTag(body);
        return {
            statusCode: 201,
            data: result,
            error: null
        };
    }

    // PUT: Sửa tag
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() body: { name?: string, status?: "Active" | "UnActive" | "Other" }
    ): Promise<RestResponse> {
        const result = await this.tagsService.updateTag(id, body);
        return {
            statusCode: 200,
            data: result,
            error: null
        };
    }

    // DELETE: Xóa mềm tag (thay đổi isDelete thành true)
    @Delete(':id')
    async softDelete(@Param('id') id: string): Promise<RestResponse> {
        const result = await this.tagsService.softDeleteTag(id);
        return {
            statusCode: 200,
            data: result,
            error: null
        };
    }
}