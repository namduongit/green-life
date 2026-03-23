import { RestResponse } from 'src/utils/response.utils';
import { CartRep } from '../dto/responses/carts-response.dto';

export type CartListResponse = RestResponse<CartRep[]>;
export type CartMutationResponse = RestResponse<CartRep>;
