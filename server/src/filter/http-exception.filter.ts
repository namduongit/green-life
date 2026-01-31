import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { RestResponse } from 'src/utils/response.utils';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();
        const httpResponse = exception.getResponse() as { message: string; error: string; statusCode: number };

        response.status(status).json({
            statusCode: status,
            message: 'Bad Request',
            error: httpResponse.message,
            data: null,
        } as RestResponse<null>);
    }
}
