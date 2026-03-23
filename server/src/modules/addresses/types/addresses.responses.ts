import { RestResponse } from 'src/utils/response.utils';
import { AddressResponseDto } from '../dto/responses/address-response.dto';

export type AddressListResponse = RestResponse<AddressResponseDto[]>;
export type AddressDetailResponse = RestResponse<AddressResponseDto>;
export type AddressMutationResponse = RestResponse<AddressResponseDto>;
