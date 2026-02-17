import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { TagsService } from './tags.service';

@Controller('/api/tags')
export class TagsController {
    constructor(private tagsService: TagsService) {}

    @Get()
    async getAll() {
        const result = await this.tagsService.getTags();
        return result;
    }

    @Get('pagination')
    async getPagination(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
        const result = await this.tagsService.getTagsPagination(parseInt(page), parseInt(limit));
        return result;
    }

    @Get('by-id/:id')
    async getById(@Param('id') id: string) {
        const result = await this.tagsService.getTagById(id);
        return result;
    }

    @Get('search')
    async searchTags(@Query('name') name?: string, @Query('status') status?: 'Active' | 'UnActive' | 'Other') {
        const result = await this.tagsService.searchTags({ name, status });
        return result;
    }

    @Post()
    async create(@Body() body) {
        const result = await this.tagsService.createTag(body);
        return result;
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() body: { name?: string; status?: 'Active' | 'UnActive' | 'Other' }) {
        const result = await this.tagsService.updateTag(id, body);
        return result;
    }

    @Delete(':id')
    async softDelete(@Param('id') id: string) {
        const result = await this.tagsService.softDeleteTag(id);
        return result;
    }
}
