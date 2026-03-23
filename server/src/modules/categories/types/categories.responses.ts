import { RestResponse } from 'src/utils/response.utils';
import { PaginationDto } from 'src/modules/common.dto';
import { CategoryPaginationResponseDto, CategoryResponseDto } from '../dto/responses/response.dto';

export type CategoryListResponse = RestResponse<CategoryResponseDto[]>;
export type CategoryPaginationResponse = RestResponse<CategoryResponseDto[], PaginationDto>;
export type CategoryDetailResponse = RestResponse<CategoryResponseDto>;
