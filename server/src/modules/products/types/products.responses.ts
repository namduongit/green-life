import { RestResponse } from 'src/utils/response.utils';
import { ProductListResponseDto, ProductResponseDto } from '../dto/responses/response.dto';

export type ProductDetailResponse = RestResponse<ProductResponseDto>;
export type ProductListResponse = RestResponse<ProductListResponseDto>;
export type ProductMutationResponse = RestResponse<ProductResponseDto>;
