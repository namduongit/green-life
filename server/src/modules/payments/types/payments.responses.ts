import { RestResponse } from 'src/utils/response.utils';
import { PaymentRep } from '../dto/responses/payment-response.type';

export type PaymentCreateResponse = RestResponse<PaymentRep>;
