import { RestResponse } from 'src/utils/response.utils';
import { AccountRep } from '../dto/responses/account-response';

export type AccountListResponse = RestResponse<AccountRep[]>;
export type AccountDetailResponse = RestResponse<AccountRep>;
export type AccountMutationResponse = RestResponse<AccountRep>;
