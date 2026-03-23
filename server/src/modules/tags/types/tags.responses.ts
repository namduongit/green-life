import { RestResponse } from 'src/utils/response.utils';
import { PaginationDto } from 'src/modules/common.dto';
import { TagPaginationResponseDto, TagResponseDto } from '../dto/responses/response.dto';

export type TagListResponse = RestResponse<TagResponseDto[]>;
export type TagPaginationResponse = RestResponse<TagResponseDto[], PaginationDto>;
export type TagDetailResponse = RestResponse<TagResponseDto>;
