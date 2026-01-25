import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { TagsService } from "./tags.service";
import { isCreate, isDelete, isGet, isPut, RestResponse } from "src/utils/response.utils";

@Controller("/api/tags")
export class TagsController {
    constructor(private tagsService: TagsService) {}

    @Get()
    async getAll() {
        const result = await this.tagsService.getTags();   
        return isGet(result);
    }

    @Get('pagination')
    async getPagination(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10'
    ) {
        const result = await this.tagsService.getTagsPagination(
            parseInt(page),
            parseInt(limit)
        );
        return isGet(result);
    }

    @Get('by-id/:id')
    async getById(@Param('id') id: string) {
        const result = await this.tagsService.getTagById(id);
        return isGet(result);
    }

    @Get('search')
    async searchTags(
        @Query('name') name?: string,
        @Query('status') status?: "Active" | "UnActive" | "Other"
    ) {
        const result = await this.tagsService.searchTags({ name, status });
        return isGet(result);
    }

    @Post()
    async create(@Body() body) {
        const result = await this.tagsService.createTag(body);
        return isCreate(result);
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() body: { name?: string, status?: "Active" | "UnActive" | "Other" }
    ) {
        const result = await this.tagsService.updateTag(id, body);
        return isPut(result);
    }

    @Delete(':id')
    async softDelete(@Param('id') id: string) {
        const result = await this.tagsService.softDeleteTag(id);
        return isDelete(result);
    }
}