import { RestResponse } from 'src/utils/response.utils';
import { LoginRep, RegisterRep } from '../dto/responses/auth-response.dto';

export type AuthRegisterResponse = RestResponse<RegisterRep>;
export type AuthLoginResponse = RestResponse<LoginRep>;
