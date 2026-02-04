import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RestResponse } from 'src/utils/response.utils';


@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, RestResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<RestResponse<T>> {
    return next.handle().pipe(
      map(data => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: 'Success', // Or a more dynamic message
        data: data,
        error: null,
      })),
    );
  }
}
