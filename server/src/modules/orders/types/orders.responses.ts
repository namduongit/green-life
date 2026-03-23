import { RestResponse } from 'src/utils/response.utils';
import { OrderDetailResponseDto, OrderResponseDto } from '../dto/responses/response.dto';

export type OrderListResponse = RestResponse<OrderResponseDto[]>;
export type OrderDetailResponse = RestResponse<OrderDetailResponseDto>;
export type OrderMutationResponse = RestResponse<OrderDetailResponseDto>;
